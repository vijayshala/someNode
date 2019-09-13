const ns = '[billing][Charge]';

import logger from 'applogger';
import config from '../../config';
import { BillingError, ERROR_CODES } from './Error';
import * as constants from './Constants';

const { LoadStripe, isStripeGateway } = require('./integrations/stripe');

/**
 * Create one time charge using payment gateway.
 * @param {*} req 
 * @param {number} amount In cents
 * @param {string} customerId 
 * @param {string} sourceId 
 * @param {string} orderId 
 * @param {string} description 
 * @param {string} gateway 
 */
export async function CreateCharge(req, amount, customerId, sourceId, orderId, gateway = constants.PAYMENT_GATEWAYS.STRIPE)  {
    let func = `[${req.requestId}][${ns}][CreateCharge]`;

    if (!constants.PAYMENT_GATEWAYS.hasOwnProperty(gateway))  {
        logger.error(func, 'gateway does not exist', gateway);
        throw new BillingError("Gateway does not exist", ERROR_CODES.PAYMENT_GATEWAY_NOT_FOUND);
    }

    logger.info(func, 'begin');

    let data = {
        amount: amount,
        customerId: customerId,
        sourceId: sourceId,
        metadata:   {
            AvayaStoreOrderId: orderId.toString(),
            AvayaStoreUserId: req.userInfo.userId.toString(),
            ZAccountUserId: req.userInfo.accountId.toString(),
            AvayaStoreEnvironment: config.environment
        }
    };

    if (!(Math.round(data.amount) > 0))    {
        return null;
    }

    if (isStripeGateway(gateway)) {
        const stripe = LoadStripe(gateway);
        return await stripe.CreateCharge(req, data);
    }
}