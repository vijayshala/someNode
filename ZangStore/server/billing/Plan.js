const ns = '[billing][Plan]';

import logger from 'applogger';
import config from '../../config';
import { BillingError, ERROR_CODES } from './Error';
import PaymentGatewaySchema from '../../schemas/PaymentGatewaySchema';
import { GetProduct } from './Product';
import * as constants from './Constants';
import { nonBlockify } from '../modules/utils';

const {
    isStripeGateway,
    LoadStripe
} = require('./integrations/stripe');

/**
 * Retrieve an external planID from Store DB.
 * @param {string} sku 
 * @param {boolean} detail Return external system object
 * @param {string} gateway 
 */
export async function GetPlan(sku, detail = false, gateway = constants.PAYMENT_GATEWAYS.STRIPE)    {
    let func = `[${ns}][GetPlan]`;
    logger.info(func, 'begin', sku, {
        sku: sku,
        gateway: gateway,
        objectType: constants.STRIPE_OBJECTS.plan
    });

    let gatewayData = await PaymentGatewaySchema.findOne({
        sku: sku,
        gateway: gateway,
        objectType: constants.STRIPE_OBJECTS.plan
    });

    logger.info(func, 'gatewaydata', gatewayData);

    if (detail && gatewayData) {
        if (isStripeGateway(gateway))  {
            try {
                let stripe = LoadStripe(gateway);
                return await stripe.getPlan(gatewayData.objectId);
            } catch(e)  {
                logger.error(func, 'stripe plan not found', e);
                return null;
            }
            
        } 
    }
    return gatewayData;
}

/**
 * Save a mapping to external plan in Store DB.
 * @param {string} sku 
 * @param {string} planId 
 * @param {string} gateway 
 */
export async function SavePlan(sku, planId, gateway = constants.PAYMENT_GATEWAYS.STRIPE) {
    let func = `[${ns}][SavePlan]`;
    logger.info(func, 'begin');

    return await PaymentGatewaySchema.findOneAndUpdate({
        sku: sku,
        gateway: gateway,
        objectType: constants.STRIPE_OBJECTS.plan,
    },
    {
        sku: sku,
        gateway: gateway,
        objectType: constants.STRIPE_OBJECTS.plan,
        objectId: planId
    },
    {
        upsert: true,
        new: true
    });
}

/**
 * Create a tax plan on external system. This plan should map one-to-one with a real product plan on the same subscription.
 * @param {object} data 
 * @param {string} gateway 
 */
export async function CreateTaxPlan(data, gateway = constants.PAYMENT_GATEWAYS.STRIPE) {
    let func = `${ns}[CreateTaxPlan]`;
  
    if (!constants.PAYMENT_GATEWAYS.hasOwnProperty(gateway))  {
        logger.error(func, 'gateway does not exist', gateway);
        throw new BillingError("Gateway does not exist", ERROR_CODES.PAYMENT_GATEWAY_NOT_FOUND);
    }
    
    logger.info(func, 'begin');

    

    if (isStripeGateway(gateway)) {
        let stripe = LoadStripe(gateway);
        let taxProduct = await GetProduct('TAX', false, gateway);
        let planPayload = {
            currency: data.currency,
            interval: data.interval,
            price: data.tax,
            interval_count: data.interval_count,
            product: taxProduct.objectId,
            metadata: {
                AvayaStoreContractId: data.contractId ? data.contractId.toString() : null,
                StripePlanId: data.stripePlanId,
                isTaxPlan: true,
                AvayaStoreEnvironment: config.environment
            }
        };
        return await stripe.CreatePlan(planPayload);
    }
}

export async function DeletePlan(req, planId, gateway = constants.PAYMENT_GATEWAYS.STRIPE)    {
    let func = `[${req.requestId}]${ns}[DeletePlan]`;

    if (!constants.PAYMENT_GATEWAYS.hasOwnProperty(gateway))  {
        logger.error(func, 'gateway does not exist', gateway);
        throw new BillingError("Gateway does not exist", ERROR_CODES.PAYMENT_GATEWAY_NOT_FOUND);
    }

    logger.info(func, 'begin');

    if (isStripeGateway(gateway)) {
        let stripe = LoadStripe(gateway);
        return await stripe.DeletePlan(planId);
    }
}

export async function DeleteTaxPlans(req, subscriptionId, gateway = constants.PAYMENT_GATEWAYS.STRIPE)    {
    let func = `[${req.requestId}]${ns}[DeletePlan]`;

    if (!constants.PAYMENT_GATEWAYS.hasOwnProperty(gateway))  {
        logger.error(func, 'gateway does not exist', gateway);
        throw new BillingError("Gateway does not exist", ERROR_CODES.PAYMENT_GATEWAY_NOT_FOUND);
    }

    logger.info(func, 'begin');

    if (isStripeGateway(gateway)) {
        let stripe = LoadStripe(gateway);
        let subscription = await stripe.GetSubscription(req, subscriptionId);
        
        logger.info(func, subscription);

        if (subscription && subscription.items)   {
            const deletePlanIter = nonBlockify(async (plan)   =>  {
                let isTax = plan.plan && plan.plan.metadata && plan.plan.metadata.isTaxPlan;
                if (isTax)  {
                    await stripe.DeletePlan(plan.plan.id);
                }
            });
            
            for (let plan of subscription.items.data)   {
                await deletePlanIter(plan);
            }
        }
    }
}