const ns = '[billing][german.billing.backend]';
const logger = require('applogger');

export async function SendOrderPayload(data, options)   {
    const fn = `[${options.requestId}]${ns}[SendOrderPayload]`;

    const request = require('../../modules/http/request');
    const config = require('../../../config');

    if (!config.germanyBilling) {
        logger.warn(fn, 'Skip sending to GSMB billing engine since no config value.');
        return;
    }

    let reqOptions = {
        method: 'POST',
        url: `${config.germanyBilling.apiURL}/kazoo/api/account`,
        headers: {
            APIKey: config.germanyBilling.apiKey
        },
        json: true,
        body: data
    };

    logger.info(fn, 'request:', reqOptions);

    const result = await request(fn, reqOptions);

    logger.info(fn, 'response:', result);

    return result;
}

export async function SendServicePlanPayload(data, options)   {
    const fn = `[${options.requestId}]${ns}[SendServicePlanPayload]`;

    const request = require('../../modules/http/request');
    const config = require('../../../config');

    if (!config.germanyBilling) {
        logger.warn(fn, 'Skip sending to GSMB billing engine since no config value.');
        return;
    }

    let reqOptions = {
        method: 'POST',
        url: `${config.germanyBilling.apiURL}/kazoo/api/serviceplan`,
        headers: {
            APIKey: config.germanyBilling.apiKey
        },
        json: true,
        body: data
    };

    logger.info(fn, 'request:', reqOptions);

    const result = await request(fn, reqOptions);

    logger.info(fn, 'response:', result);

    return result;
}