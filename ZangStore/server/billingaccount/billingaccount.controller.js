const ns = '[billingaccount.controller]';
const logger = require('applogger');

const { BadRequestError, ValidationError, ErrorMessage, VIOLATIONS } = require('../modules/error');
const { BillingAccountBackend } = require('./billingaccount.backend');
const { validatePO } = require('./billingaccount.utils');
const { getBaseURL } = require('../../common/Utils');
const { RegionBackend } = require('../region/region.backend');
const { CountryBackend } = require('../region/country.backend');
const { BillingError, ERROR_CODES } = require('../billing/Error');
const _ = require('lodash');

import LookupModel, { getLookup } from '../../models/LookupModel';
import constants from '../../config/constants';

export async function GetBillingAccounts(req, res, next) {
    const fn = `[${req.requestId}]${ns}[GetBillingAccounts]`;
    const user = req.userInfo;

    logger.info(fn, 'begin');

    try {
        if (!user) {
            // FIXME: this should be handled by middleware
            throw new UnauthorizedError();
        }

        const billingAccounts = await BillingAccountBackend.findByUser(user, {
            requestId: req.requestId,
            localizer: req.localizer,
            populateGateways: true
        });

        logger.info(fn, 'billingaccounts:', billingAccounts);

        res.status(200).json({
            error: false,
            data: billingAccounts
        });
    } catch (e) {
        next(e);
    }
}

export async function GetBillingAccount(req, res, next) {
    const fn = `[${req.requestId}]${ns}[GetBillingAccount]`;
    const user = req.userInfo;
    const billingAccountId = req.params.id;
    const identifierType = '_id';

    logger.info(fn, 'begin');

    try {
        if (!user) {
            // FIXME: this should be handled by middleware
            throw new UnauthorizedError();
        }
        if (!billingAccountId) {
            throw new BadRequestError('Invalid ID');
        }

        const billingAccount = await BillingAccountBackend.findOneByIdentifier(user, billingAccountId, {
            requestId: req.requestId,
            localizer: req.localizer,
            identifierType,
            populateGateways: true
        });

        logger.info(fn, 'billingAccount', billingAccount);

        res.status(200).json({
            error: false,
            data: billingAccount
        });
    } catch (e) {
        next(e);
    }
}

export async function ViewBillingAccount(req, res, next) {
    const fn = `[${req.requestId}]${ns}[ViewBillingAccount]`;
    const user = req.userInfo;
    const billingAccountId = req.params.id;
    const identifierType = '_id';
    let countries, states = [];

    logger.info(fn, 'begin');

    try {
        if (!user) {
            // FIXME: this should be handled by middleware
            throw new UnauthorizedError();
        }
        if (!billingAccountId) {
            throw new BadRequestError('Invalid ID');
        }

        const billingAccount = await BillingAccountBackend.findOneByIdentifier(user, billingAccountId, {
            requestId: req.requestId,
            localizer: req.localizer,
            identifierType,
            populateGateways: true
        });

        // get all regions and set the countries
        await RegionBackend.find({ active: true }).then((regions) => {
            countries = regions;
        }).catch((err) => {
            logger.error(req.requestId, ns, 'error', err);
        });

        // get the billing address country
        let country = countries.find((elm) => {
            return elm.name.text == billingAccount.purchaseOrder.billingAddress.country;
        })

        // set the states that match the billing address country
        if (country && country.addressFormClass != 2) {
            await CountryBackend.findByCode(country.shortCode).then(countryObj => {
                states = countryObj.states;
            });
        }

        logger.info(fn, 'billingAccount', billingAccount);
        logger.info(fn, 'states', states[0]);
        logger.info(fn, 'countries', countries[0]);

        res.render('purchase-orders/poAccountSummary', {
            account: billingAccount,
            countries: countries,
            states: states
        });
    } catch (e) {
        next(e);
    }
}

export async function ViewBillingAccounts(req, res, next) {
    const fn = `[${req.requestId}]${ns}[ViewBillingAccounts]`;
    const user = req.userInfo;

    logger.info(fn, 'begin');

    try {
        if (!user) {
            // FIXME: this should be handled by middleware
            throw new UnauthorizedError();
        }

        const billingAccounts = await BillingAccountBackend.listPurchaseOrders({
            requestId: req.requestId,
            localizer: req.localizer,
            populateGateways: true
        });

        //logger.info(fn, 'billingaccounts:', billingAccounts);

        res.render('purchase-orders/poList', {
            pos: billingAccounts
        });
    } catch (e) {
        next(e);
    }
}

export async function DeletePurchaseOrder(req, res, next) {
    const fn = `[${req.requestId}]${ns}[DeletePurchaseOrder]`;
    const user = req.userInfo;
    const billingAccountId = req.params.id;

    logger.info(fn, 'begin');

    try {
        if (!user) {
            // FIXME: this should be handled by middleware
            throw new UnauthorizedError();
        }
        if (!billingAccountId) {
            throw new BadRequestError('Invalid ID');
        }

        const billingAccount = await BillingAccountBackend.deletePurchaseOrder(user, billingAccountId, {
            requestId: req.requestId,
            localizer: req.localizer
        });

        logger.info(fn, 'billingAccount', billingAccount);

        res.status(200).json({
            error: false,
            data: billingAccount
        });
    } catch (e) {
        next(e);
    }
}

export async function SavePurchaseOrder(req, res, next) {
    const fn = `[${req.requestId}]${ns}[SavePurchaseOrder]`;
    const user = req.userInfo;
    const billingAccountId = req.params.id;
    const payload = req.body;

    logger.info(fn, 'begin');

    try {
        if (!user) {
            // FIXME: this should be handled by middleware
            throw new UnauthorizedError();
        }
        if (!billingAccountId) {
            throw new BadRequestError('Invalid ID');
        }

        let options = {
            requestId: req.requestId,
            localizer: req.localizer,
        };

        let errors = await validatePO(payload, options);

        if (errors.length > 0) {
            logger.info(fn, 'validation errors:', errors);

            return res.status(400).json({
                error: true,
                errors: errors
            });
        }

        const updatedBillingAccount = await BillingAccountBackend.savePurchaseOrder(user, billingAccountId, payload, {
            requestId: req.requestId,
            localizer: req.localizer,
            baseUrl: getBaseURL(req)
        });

        res.status(200).json({
            error: false,
            data: updatedBillingAccount
        });
    } catch (e) {
        next(e);
    }
}