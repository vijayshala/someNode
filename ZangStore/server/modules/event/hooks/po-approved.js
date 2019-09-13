const ns = '[event.hooks.po-approved]';
const logger = require('applogger');
const { ASEventEmitter } = require('../index');

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const { BadRequestError } = require('../../error');
  const { OrderBackend } = require('../../../order/order.backend');
  const { UserBackend } = require('../../../user/user.backend');
  const { RegionBackend } = require('../../../region/region.backend');
  const { PurchasedPlanBackend } = require('../../../purchased-plan/purchased-plan.backend');
  const {
    ORDER_PROCESSING_NOT_STARTED,
    ORDER_STATUS_PENDING_APPROVAL,
    ORDER_STATUS_FAILED
  } = require('../../../order/order.constants');
  const U = require('../../utils');
  let billingAccount = context.billingAccount;
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
        const pendingOrders = await OrderBackend.find({
            billingAccountId: billingAccount._id,
            'payment.billingEngine': 'NATIVE',
            'payment.metadata.paymentType': 'PURCHASE_ORDER',
            status: { $in: [ORDER_STATUS_PENDING_APPROVAL, ORDER_STATUS_FAILED] }
        });

        for (let order of pendingOrders)    {
          const rawUser = await UserBackend.findOne({
              _id: order.created.by
          });

          const userMeta = UserBackend.getBasicUserInfo(rawUser, options);

          logger.info(fn, 'orderId:', order._id);

          const purchasedPlan = await PurchasedPlanBackend.findOne({
            orderIds: order._id
          }, options);
          let currentRegion = await RegionBackend.findByCode(order.region);
          const context = {
              requestId: options.requestId,
              baseUrl: options.baseUrl,
              localizer: options.localizer,
              user: userMeta,
              rawUser: rawUser,
              order: order,
              purchasedPlan: purchasedPlan,
              processStatus: {
                onetimePayment: ORDER_PROCESSING_NOT_STARTED,
                subscriptionPayment: ORDER_PROCESSING_NOT_STARTED,
                // maybe we add shipping handling here
            },
            currentRegion
          };

          //logger.info(fn, 'trigger order provisioning:', order);
          
          await OrderBackend.triggerOrderBilling(order, context);
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
