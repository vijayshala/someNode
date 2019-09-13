const ns = '[billing][initDB]';

import logger from 'applogger';
import config from '../../config';
import * as constants from './Constants';
import { SavePlan, GetPlan } from './Plan';
import { SaveProduct, GetProduct } from './Product';
import { SaveTaxCode } from './Tax';
import * as Data from './init_data';
import * as DataDe from './init_data-kazoo-de';
import * as DataSpaces from './init_data-spaces';
import * as DataSpacesUS from './init_data-spaces-us';
import * as DataSpacesCA from './init_data-spaces-ca';
import * as DataSpacesUK from './init_data-spaces-uk';
import * as DataSpacesDE from './init_data-spaces-de';
import LookupSchema from '../../schemas/LookupSchema';

const {
    StripeBackendCA,
    StripeBackendUS
} = require('./integrations/stripe');

export default async function init(req, res)   {
    let func = `[${req.requestId}]${ns}[initBilling]`;

    logger.info(func, 'begin');

    if (req.developers.indexOf(req.userInfo.username) == -1) {
        res.status(401).send();
    } else {
        
        try {
            await initLookups(Data);
            await initStripeAccount(StripeBackendUS);
            await initStripeAccount(StripeBackendCA);
            await initAllProductsAvaleraTaxes();
            res.status(200).send();
        }
        catch (error) {
            logger.error(func, 'error', error);
            res.status(500).send();
        }

        // Promise.all([
        //     initLookups(Data),
        //     initBilling(Data),
        //     initBilling(DataDe),
        //     initBilling(DataSpaces),
        //     initBilling(DataSpacesUS),
        //     initBilling(DataSpacesCA),
        //     initBilling(DataSpacesUK),
        //     initBilling(DataSpacesDE),
        // ]).then(() => {
        //     res.status(200).send();
        // }).catch((err)  =>  {
        //     logger.error(func, 'error', err);
        //     res.status(500).send();
        // })
    }
}

async function initStripeAccount(stripeAccount) {
    await initBilling(Data, stripeAccount);
    await initBilling(DataDe, stripeAccount);
    await initBilling(DataSpaces, stripeAccount);
    await initBilling(DataSpacesUS, stripeAccount);
    await initBilling(DataSpacesCA, stripeAccount);
    await initBilling(DataSpacesUK, stripeAccount);
    await initBilling(DataSpacesDE, stripeAccount);
}

async function initAllProductsAvaleraTaxes() {
    await initAvalaraData(Data);
    await initAvalaraData(DataDe);
    await initAvalaraData(DataSpaces);
    await initAvalaraData(DataSpacesUS);
    await initAvalaraData(DataSpacesCA);
    await initAvalaraData(DataSpacesUK);
    await initAvalaraData(DataSpacesDE);
}

async function initAvalaraData(DATA) {
    let func = `${ns}[initAvalaraData]`;

    logger.info(func, 'start init tax codes');

    for (let taxcode of DATA.AvalaraTaxCodes)    {
        await SaveTaxCode(taxcode.sku, taxcode.taxCodes);
    }

    logger.info(func, 'finish init tax codes');
}


async function initLookups(DATA)    {
    let func = `${ns}[initLookups]`;
    logger.info(func, 'begin');

    logger.info(func, 'start init countries');
    for (let country of DATA.COUNTRIES) {
        await LookupSchema.findOneAndUpdate({
            keyValue: country.keyValue
        }, country, { upsert: true });
    }

    logger.info(func, 'finish init countries');
    logger.info(func, 'start init states');

    for (let state of DATA.STATES) {
        await LookupSchema.findOneAndUpdate({
            keyValue: state.keyValue
        }, state, { upsert: true });
    }

    logger.info(func, 'finish init states');
    logger.info(func, 'start init industries');

    for (let industry of DATA.INDUSTRY_TYPES) {
        await LookupSchema.findOneAndUpdate({
            keyValue: industry.keyValue
        }, industry, { upsert: true });
    }

    logger.info(func, 'finish init industries');
}

async function initBilling(DATA, stripeAccount)    {
    let func = `${ns}[initBilling]`;

    logger.info(func, 'begin');
    logger.info(func, 'start init products');

    for(let product of DATA.StripeProducts)  {
        let existingProduct = await GetProduct(product.metadata.sku, true, stripeAccount.gateway);
        if (!existingProduct)   {
            let stripeProduct = await stripeAccount.initProduct(product);
            await SaveProduct(product.metadata.sku, stripeProduct.id, stripeAccount.gateway);
        }
    }

    logger.info(func, 'Finish init products');
    logger.info(func, 'start init plans');

    for (let plan of DATA.StripePlans)   {
        let existingPlan = await GetPlan(plan.metadata.sku, true, stripeAccount.gateway);
        let product = await GetProduct(plan.product_sku, true, stripeAccount.gateway);
        
        if ((!existingPlan && product)
            || (product && existingPlan && Math.round(existingPlan.amount) != Math.round(plan.price))) {
            plan.product = product.id;
            delete plan.product_sku;
            let stripePlan = await stripeAccount.CreatePlan(plan, stripeAccount.gateway);
            await SavePlan(plan.metadata.sku, stripePlan.id, stripeAccount.gateway);
        }
    }

    logger.info(func, 'Finish init plans');
    
}