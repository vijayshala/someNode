const ns = '[billing][helper]';

import request from 'request';

export async function asyncRequest(options) {
    return new Promise((resolve, reject)    =>  {
        request(options, (err, response, data)  =>  {
            if (err)    {
                reject(err);
            }   else    {
                resolve(data);
            }
        })
    });
}

export async function SelectPaymentGateway(currency, paymentType, region, options)  {
    const fn = `[${options.requestId}]${ns}[SelectPaymentGateway]`;
    const { PAYMENT_GATEWAYS, PAYMENT_METHODS } = require('./Constants');

    if (currency === 'CAD' && paymentType === PAYMENT_METHODS.CREDIT_CARD) {
        return PAYMENT_GATEWAYS.STRIPE_CA;
    } else if (currency === 'USD' && paymentType === PAYMENT_METHODS.CREDIT_CARD) {
        return PAYMENT_GATEWAYS.STRIPE;
    } else if (region && region.toUpperCase() === 'DE' && currency === 'EUR' && paymentType === PAYMENT_METHODS.IBAN) {
        return PAYMENT_GATEWAYS.GSMB;
    } else if (paymentType === PAYMENT_METHODS.PURCHASE_ORDER)  {
        return PAYMENT_GATEWAYS.NATIVE;
    }
}
