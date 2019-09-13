const ns = '[billing][Product]';

import logger from 'applogger';
import stripeInit from 'stripe';
import PaymentGatewaySchema from '../../schemas/PaymentGatewaySchema';
import * as constants from './Constants';

const {
    isStripeGateway,
    LoadStripe
} = require('./integrations/stripe');

/**
 * Retrieve an external product mapping from Store DB.
 * @param {string} sku 
 * @param {string} gateway 
 */
export async function GetProduct(sku, detail = false, gateway = constants.PAYMENT_GATEWAYS.STRIPE)    {
    let func = `[${ns}][GetProduct]`;
    logger.info(func, 'begin gateway:', { gateway, sku });

    const product = await PaymentGatewaySchema.findOne({
        sku: sku,
        gateway: gateway,
        objectType: constants.STRIPE_OBJECTS.product
    });

    if (product && detail)  {
        if (isStripeGateway(gateway)) {
            try {
                let stripe = LoadStripe(gateway);
                return await stripe.getProduct(product.objectId);
            } catch (e) {
                logger.error(func, 'stripe product not found', e);
                return null;
            }
        }
    }

    return product;
}

/**
 * Save a new external product mapping in Store DB.
 * @param {string} sku 
 * @param {string} productId 
 * @param {string} gateway 
 */
export async function SaveProduct(sku, productId, gateway = constants.PAYMENT_GATEWAYS.STRIPE) {
    let func = `[${ns}][SaveProduct]`;
    logger.info(func, 'begin');

    return await PaymentGatewaySchema.findOneAndUpdate({
        sku: sku,
        gateway: gateway,
        objectType: constants.STRIPE_OBJECTS.product,
    },
    {
        sku: sku,
        gateway: gateway,
        objectType: constants.STRIPE_OBJECTS.product,
        objectId: productId
    },
    {
        upsert: true,
        new: true
    });
}