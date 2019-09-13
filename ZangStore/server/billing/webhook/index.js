const ns = '[billing.webhook]';

import logger from 'applogger';
import config from '../../../config';
import * as constants from '../Constants';
import global_constants from '../../../config/constants';


import { processWebhook as ProcessStripeWebhook } from './stripe';
const {
    isStripeGateway
} = require('../integrations/stripe');

export default async function processWebhook(req, res)    {
    let func = `[${req.requestId}]${ns}[processWebhook]`;

    let gateway = req.params.gateway.toUpperCase();

    if (!constants.PAYMENT_GATEWAYS.hasOwnProperty(gateway))  {
        logger.error(func, 'gateway does not exist', gateway);
        throw ("Gateway does not exist");
    }

    logger.info(func, 'begin', gateway);

    if (isStripeGateway(gateway))   {
        await ProcessStripeWebhook(req, res, gateway);
    } else  {
        res.status(400).end();
    }
}