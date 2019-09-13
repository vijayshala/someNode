const ns = '[event.hooks.refund-failed-order]';
const logger = require('applogger');

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const { BadRequestError } = require('../../error');
  const U = require('../../utils');
  // const { OrderBackend } = require('../../../order/order.backend');
  const { ORDER_PROCESSING_SUCCEED } = require('../../../order/order.constants');
  // const { PurchasedPlanBackend } = require('../../../purchased-plan/purchased-plan.backend');
  const { CHARGE_STATUS } = require('../../../billing/Constants');
  let order = context.order;
  let purchasedPlan = context.purchasedPlan;

  logger.info(fn, 'started', 'order id=', order && order._id);
  if (!order) {
    return next(new BadRequestError('Cannot find order payload'));
  }

  // const options = {
  //   requestId: context.requestId,
  // };

  U.P()
    .then(() => {
      // check onetime payment
      if (order.onetime && order.onetime.payment && order.onetime.payment.status === ORDER_PROCESSING_SUCCEED) {
        // FIXME: refund onetime charge
      }
    })
    .then(() => {
      // check purchased plan payments
      if (purchasedPlan && purchasedPlan.subscriptions) {
        for (let subscription of purchasedPlan.subscriptions) {
          if (subscription && subscription.payment && subscription.payment.status === CHARGE_STATUS.CHARGED) {
            // FIXME: reset subscription
          }
        }
      }
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
