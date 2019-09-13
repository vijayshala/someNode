const ns = '[quote.controller]';

import logger from 'applogger';
import constants from '../../config/constants'
import {

} from './quote.constants';
const {QuoteBackend} = require('./quote.backend');
import { UserBackend } from '../user/user.backend';
const { CartBackend } = require('../cart/cart.backend');
const { PartnerAgentBackend } = require('../partner/partner-agent.backend');
import { UnauthorizedError } from '../modules/error';
import LookupModel, { getLookup } from '../../models/LookupModel'
import config from '../../config';

export const getQuote = async (req, res, next) => {
    const fn = `[${req.requestId}]${ns}[getQuote]`;
    const id = req.params.id;
      
    try {      
        let quote = await QuoteBackend.findOne({ _id: id });
        logger.info(fn, 'quote:', quote && quote._id);
        console.info(fn, 'user:', req.userInfo);
        if (quote) {
            //need to resolve partner and associate cookie            
            try {
                await PartnerAgentBackend.setPartnerCookie(req, res, {
                    partner: quote.partner,
                    partnerAgent: quote.partnerAgent
                });         
            }
            catch (errPartnerCookie) {
                logger.warn(fn, 'errPartnerCookie:', errPartnerCookie);
            }
        }
  
        res.status(200).json({
            error: false,
            data: quote,
        });
    } catch (error) {
        next(error);
    }
};

export const getQuotes = async (req, res, next) => {
    const fn = `[${req.requestId}]${ns}[getQuotes]`;
    const user = req.userInfo;

    try {
        if (!user) {
            throw new UnauthorizedError();
        }


    } catch (e) {
        next(e);
    }
};

export const deleteQuote = async (req, res, next) => {
    const fn = `[${req.requestId}]${ns}[deleteQuote]`;
    const user = req.userInfo;
    const quoteId = req.params.id;

    //try {
        if (!user) {
            throw new UnauthorizedError();
        }

        const result = await QuoteBackend.cancelQuote(quoteId);

        logger.info(fn, 'result:', result);

        res.status(200).json({
            error: false,
            data: result
        });

};

export const createQuote = async (req, res, next) => {
    const fn = `[${req.requestId}]${ns}[createQuote]`;
    const { getBaseURL } = require('../../common/Utils');
    const user = req.userInfo;
    const quoteData = req.body;
    // logger.info(fn, 'createQuote Begin====');
    logger.info(fn, 'REQ REGION:', req.region);
    try {
        if (!user) {
            throw new UnauthorizedError();
        }

        let result = await QuoteBackend.createQuote(user, quoteData, {
            requestId: req.requestId,
            baseUrl: getBaseURL(req),
            localizer: req.localizer,
            region: (req.region ? req.region : 'US')
          } );

        // logger.info(fn, 'result:', result);

        let response = {
            error: false,
            data: result.quote,
        };
        if (result.logs && result.logs.warnings && result.logs.warnings.length > 0) {
            response.warnings = result.logs.warnings;
        }

        res.status(200).json(response);
    } catch (e) {
        next(e);
    }
};

export const viewQuote = async (req, res, next) => {
    const fn = `[${req.requestId}]${ns}[viewQuote]`;
    const user = req.userInfo;
    let cart = {}
    try {
        if (user) {
            // throw new UnauthorizedError();
            cart = await CartBackend.findByUser(user, {
                requestId: req.requestId,
                localizer: req.localizer,
                region: req.region
            });
        }

        let countriesFilter = ['United States'];
        if (req.hasAdminPermission) {
          countriesFilter.push('Canada');
        }
        let countries = await getLookup(req, {
          type: constants.LOOKUP_TYPES.COUNTRIES,
          keyValue: {
            $in: countriesFilter
          }
        });
  
        let states = await getLookup(req, {
          type: constants.LOOKUP_TYPES.STATES
        });

        res.render('webapp/AppView', {
            preloadedData: {
                cart, user,
                configurations: {
                    urls: res.locals.urls
                },
                countries,
                states
            },
            error: false,
        });


    } catch (e) {
        next(e);
    }
}

export const viewQuotes = async (req, res, next) => {
    const fn = `[${req.requestId}]${ns}[viewQuotes]`;
    const user = req.userInfo;

    try {
        if (!user) {
            throw new UnauthorizedError();
        }


    } catch (e) {
        next(e);
    }
};