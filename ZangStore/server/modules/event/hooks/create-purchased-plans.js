const ns = '[event.hooks.create-purchased-plans]';
const logger = require('applogger');

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const { BadRequestError } = require('../../error');
  const U = require('../../utils');
  const userId = context.user && (context.user._id || context.user.userId);
  const order = context.order;
  const { OrderBackend } = require('../../../order/order.backend');
  const { ORDER_STATUS_FAILED } = require('../../../order/order.constants');
  const { PO_STATUS_PENDING } = require('../../../billingaccount/billingaccount.constants');
  const { PurchasedPlanBackend } = require('../../../purchased-plan/purchased-plan.backend');

  logger.info(fn, 'started', 'order id=', order && order._id);
  if (!order) {
    return next(new BadRequestError('Cannot find order payload'));
  }

  const options = {
    requestId: context.requestId,
  };

  U.P()
    .then(async() => { // convert order to purchased plan
      const { 
        PURCHASED_PLAN_STATUS_NEW, 
        PURCHASED_PLAN_SUBSCRIPTION_STATUS_NEW, 
        PURCHASED_PLAN_STATUS_PENDING_APPROVAL, 
        PURCHASED_PLAN_SUBSCRIPTION_STATUS_PENDING_APPROVAL 
      } = require('../../../purchased-plan/purchased-plan.constants');
      const { CreateContractNumber } = require('../../../purchased-plan/purchased-plan.utils');

      const isPurchaseOrderPending = order && order.payment && order.payment.billingEngine === 'NATIVE' 
        && order.payment.metadata && order.payment.metadata.purchaseOrder && order.payment.metadata.purchaseOrder.status === PO_STATUS_PENDING;

      let purchasedPlan = {
        ...order,

        orderIds: [order._id],
        status: isPurchaseOrderPending ? PURCHASED_PLAN_STATUS_PENDING_APPROVAL : PURCHASED_PLAN_STATUS_NEW,
        confirmationNumber: CreateContractNumber(),

        metadata: {},

        created: {
          by: userId,
          on: new Date()
        },
        updated: {}
      };
      delete purchasedPlan._id;
      delete purchasedPlan.id;

      for (let subscription of purchasedPlan.subscriptions) {
        subscription.status = isPurchaseOrderPending ? PURCHASED_PLAN_SUBSCRIPTION_STATUS_PENDING_APPROVAL : PURCHASED_PLAN_SUBSCRIPTION_STATUS_NEW;
      }

      let purchasedPlanCreated = await PurchasedPlanBackend.create(purchasedPlan, options);
      purchasedPlanCreated = purchasedPlanCreated.toObject();

      // pass back to context
      context.purchasedPlan = purchasedPlanCreated;

      logger.info(fn, 'purchased plan created', purchasedPlanCreated.confirmationNumber);
      // write order process log
      await OrderBackend.log(order, false, 'order purchased plan created', { confirmationNumber: purchasedPlanCreated.confirmationNumber }, context.user, options);
      // write purchased plan process log
      await PurchasedPlanBackend.log(purchasedPlanCreated, false, 'purchased plan created', {
        confirmationNumber: purchasedPlanCreated.confirmationNumber
      }, context.user, options);
    })
    .then(() => {
      next();
    })
    .catch(async(err) => {
      logger.error(fn, 'Error:', err);

      try { // update the order as failed
        await OrderBackend.setOrderStatus(order, ORDER_STATUS_FAILED, context);
      } catch (err2) {
        logger.error(fn, 'Error2:', err);
      }

      next(err);
    });
};

module.exports = processEvent;
