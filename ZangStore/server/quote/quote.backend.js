const ns = '[quote.backend]';

import logger from 'applogger';
const { DbBase } = require( '../modules/db/index');
import QuoteSchema from './quote.model';
import {
    QUOTE_STATUS_CLOSED,
    QUOTE_STATUS_NEW,
    QUOTE_EXPIRE_DAYS
} from './quote.constants';
const { UserBackend } = require('../user/user.backend');
const { BadRequestError } = require( '../modules/error');
const { RegionBackend } = require('../region/region.backend');
import { addDays } from '../utils/serverHelper'
const { CreateOrderConfirmationNumber } = require('../order/order.utils');
const { ASEVENT_QUOTE_BEFORE_CREATE, ASEVENT_QUOTE_CREATED } = require('../modules/event/constants');

class QuoteBackend extends DbBase {
    async cancelQuote(quoteId, options) {
        const fn = `[${options.requestId}]${ns}[deleteQuote]`;

        const result = await this.findOneAndUpdate({
            _id: quoteId
        },
            {
                status: QUOTE_STATUS_CLOSED
            });

        return result && result.result;
    }

    async createQuote(user, quote, options) {
        const fn = `[${options.requestId}]${ns}[createQuote]`;
        const { ASEventEmitter } = require('../modules/event');
        const userId = user && (user._id || user.userId);

        options = Object.assign({

        }, options);
        options.region = (quote.region  || options.region || 'US').toUpperCase();

        logger.info(fn, 'region:', options.region);
        // logger.error(fn, 'about to call ASEventEmitter ASEVENT_QUOTE_BEFORE_CREATE:', ASEVENT_QUOTE_BEFORE_CREATE);
        quote = Object.assign({
            status: QUOTE_STATUS_NEW,
            quoteNumber: CreateOrderConfirmationNumber(),
            expireOn: addDays(Date.now(), QUOTE_EXPIRE_DAYS),
            created: {
                by: userId,
                on: new Date(),
            }
        }, quote);

        let rawUser = user;
        if (!user._id) {
            rawUser = await UserBackend.findOneById(userId, options);
        }
        let currentRegion = await RegionBackend.findByCode(options.region);
        const context = {
            requestId: options.requestId,
            baseUrl: options.baseUrl,
            localizer: options.localizer,
            user,
            rawUser,
            quote,
            currentRegion
        };
        if (!ASEventEmitter) {
            logger.info(fn, 'ASEventEmitter is NULL');
        }
        
        const eventResult = await ASEventEmitter.emitPromise(ASEVENT_QUOTE_BEFORE_CREATE, context);
        const logs = {
            infos: ASEventEmitter.getInfos(ASEVENT_QUOTE_BEFORE_CREATE),
            warnings: ASEventEmitter.getWarnings(ASEVENT_QUOTE_BEFORE_CREATE),
            errors: ASEventEmitter.getErrors(ASEVENT_QUOTE_BEFORE_CREATE),
        };
        if (logs.errors && logs.errors.length) {
            throw new BadRequestError('Quote create failed', logs.errors);
        }


        let createdQuote = null;
        if (!logs || !logs.warnings || logs.warnings.length == 0) {
            createdQuote = await this.create(quote);
            // emit order created event
            const context2 = {
                requestId: options.requestId,
                baseUrl: options.baseUrl,
                localizer: options.localizer,
                user: user,
                rawUser: rawUser,
                quote: createdQuote,
                currentRegion
            };
            const result = await ASEventEmitter.emitPromise(ASEVENT_QUOTE_CREATED, context2);
            await logger.info(context2.quote, !!result, `${ASEVENT_QUOTE_CREATED} process done`, user, options);
            if (createdQuote && createdQuote.toObject) {
                // convert to plain object
                createdQuote = createdQuote.toObject();
            }
        }
        

        // logger.info(fn, 'createdQuote:', createdQuote);
        return {
            quote: createdQuote, 
            logs,
        };
    }
}

let backend = new QuoteBackend(QuoteSchema, {});


module.exports = {
    QuoteBackend: backend,
  };
  