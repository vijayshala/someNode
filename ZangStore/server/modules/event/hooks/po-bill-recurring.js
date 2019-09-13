const ns = '[event.hooks.po-bill-recurring]';
const logger = require('applogger');
const { ASEventEmitter } = require('../index');

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const { BadRequestError } = require('../../error');
  const { PurchasedPlanBackend } = require('../../../purchased-plan/purchased-plan.backend');
  const { ProcessRecurringPO } = require('../../../billingaccount/billingaccount.utils');
  const U = require('../../utils');

  logger.info(fn, 'started');

  const options = {
    requestId: context.requestId,
    baseUrl: context.baseUrl
  };

  U.P()
    .then(async() => {
        const purchasedPlansToBill = await PurchasedPlanBackend.findByDuePO(options);

        for (let pp of purchasedPlansToBill)    {
          try{
            await ProcessRecurringPO(pp, options);
          } catch(err)  {
            logger.error(fn, 'failed to process PO recurring', JSON.stringify(err));
          } 
        }

        logger.info(fn, 'All due POs processed');
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
