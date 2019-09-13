const ns = '[event.hooks.process-quote-to-order]';
const {QuoteBackend} = require('../../../quote/quote.backend');  
import {
  QUOTE_STATUS_FULFILLED
} from '../../../quote/quote.constants';
const logger = require('applogger');
const { ASEventEmitter } = require('../index');

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const { BadRequestError } = require('../../error');


  const U = require('../../utils');
  let payload = context.order;
  const userId = context.userId;

  logger.info(fn, 'started');
  if (!payload || !payload.quote) {
    //we by pass
    return next();
  }

  const options = {
    requestId: context.requestId,
    localizer: context.localizer,
    baseUrl: context.baseUrl
  };

  U.P()
    .then(async() => {        
          logger.info(fn, 'orderId:', payload._id, 'quoteId', payload.quote);
          const purchasedPlan = await QuoteBackend.findOneAndUpdate({
            _id: payload.quote
          }, {
              status: QUOTE_STATUS_FULFILLED
            }, options);        
    })
    .then(() => {
      next();
    })
    .catch(async(err) => {
      logger.error(fn, 'Error:', err);
      next(err);
    });
};

module.exports = processEvent;
