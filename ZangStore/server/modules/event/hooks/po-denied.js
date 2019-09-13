const ns = '[event.hooks.po-denied]';
const logger = require('applogger');
const { ASEventEmitter } = require('../index');

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const { BadRequestError } = require('../../error');
  const { 
      PURCHASED_PLAN_STATUS_SUCCESS, 
      PURCHASED_PLAN_STATUS_FAILED,
      PURCHASED_PLAN_SUBSCRIPTION_STATUS_CANCELED
    } = require('../../../purchased-plan/purchased-plan.constants');
  const { PurchasedPlanBackend } = require('../../../purchased-plan/purchased-plan.backend');
  const { UserBackend } = require('../../../user/user.backend');
  const U = require('../../utils');
  const billingAccount = context.billingAccount;
  const userId = context.userId;

  logger.info(fn, 'started');
  if (!billingAccount) {
    return next(new BadRequestError('Cannot find billing account payload'));
  }

  const options = {
    requestId: context.requestId,
    localizer: context.localizer,
    baseUrl: context.baseUrl
  };

  U.P()
    .then(async() => {
        const activePurchasedPlans = await PurchasedPlanBackend.update({
            billingAccountId: billingAccount._id,
            'payment.billingEngine': 'NATIVE',
            'payment.metadata.paymentType': 'PURCHASE_ORDER',
            status: PURCHASED_PLAN_STATUS_SUCCESS
        }, {
          $set: {
            status: PURCHASED_PLAN_STATUS_FAILED,
            'subscriptions.0.status': PURCHASED_PLAN_SUBSCRIPTION_STATUS_CANCELED  //FIX ME: Array all update operator does not work. Use index 0 for now since its 1 to 1
          }
        }, options);

        logger.info(fn, 'purchasedPlans updated');
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
