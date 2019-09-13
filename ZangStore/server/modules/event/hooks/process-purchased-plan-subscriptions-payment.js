const ns = '[event.hooks.process-purchased-plan-subscriptions-payment]';
const logger = require('../../../../modules/logger');

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const emitter = this;
  const { BadRequestError } = require('../../error');
  const moment = require('moment');
  const U = require('../../utils');
  const { ORDER_STATUS_FAILED, ORDER_PROCESSING_SUCCEED, ORDER_PROCESSING_FAILED } = require('../../../order/order.constants');
  const {
    ASEVENT_ORDER_SUBSCRIPTIONS_BILLING_SUCCESS,
    ASEVENT_ORDER_SUBSCRIPTIONS_BILLING_FAILED,
  } = require('../constants');
  const { CHARGE_STATUS, PAYMENT_GATEWAYS } = require('../../../billing/Constants');
  const { PurchasedPlanBackend } = require('../../../purchased-plan/purchased-plan.backend');
  const { OrderBackend } = require('../../../order/order.backend');
  const { BillingAccountBackend } = require('../../../billingaccount/billingaccount.backend');
  const TransactionBackend = require('../../../transaction/transaction.backend');
  const { STATUS } = require('../../../transaction/transaction.constants');
  const { PURCHASED_PLAN_STATUS_SUCCESS, PURCHASED_PLAN_SUBSCRIPTION_STATUS_ACTIVE } = require('../../../purchased-plan/purchased-plan.constants');
  const { CommitTransaction } = require('../../../billing/Tax');
  const { CheckPOLimit } = require('../../../billingaccount/billingaccount.utils');
  const { PO_STATUS_APPROVED } = require('../../../billingaccount/billingaccount.constants');
  const { isStripeGateway } = require('../../../billing/integrations/stripe');
  let purchasedPlan = context.purchasedPlan;
  const user = context.user;
  const userId = user && (user._id || user.userId);
  let currentRegion = context.currentRegion;

  logger.info(fn, 'started', 'purchased plan id=', purchasedPlan && purchasedPlan._id);
  if (!purchasedPlan) {
    return next(new BadRequestError('Cannot find purchased plan payload'));
  }

  let req = {
    requestId: context.requestId,
    userInfo: context.user,
    baseUrl: context.baseUrl
  };
  const options = {
    requestId: context.requestId,
  };

  const billingEngine = purchasedPlan.payment && purchasedPlan.payment.billingEngine;
  const customerId = purchasedPlan.payment && purchasedPlan.payment.metadata && purchasedPlan.payment.metadata.customerId;

  if (currentRegion.countryISO == 'DE' && billingEngine != PAYMENT_GATEWAYS.GSMB
    || currentRegion.countryISO != 'DE' && billingEngine == PAYMENT_GATEWAYS.GSMB) {
      return next(new BadRequestError('Invalid payment gateway.'));
  }

  U.P()
    .then(async() => {
      // process subscriptions
      if (!purchasedPlan.subscriptions || !purchasedPlan.subscriptions.length) {
        logger.info(fn, 'no recurring charges, skipped');
        return;
      }

      if (billingEngine == PAYMENT_GATEWAYS.GSMB) {
        return;
      }

      const { generateSubscriptionIdentifier } = require('../../cart-salesmodel-rules/utils');
      const { CreateSubscription } = require('../../../billing/Subscription');
      const { GetPlan } = require('../../../billing/Plan');

      let paymentStatus = {};

      for (let subscriptionIndex in purchasedPlan.subscriptions) {
        const subscription = purchasedPlan.subscriptions[subscriptionIndex];
        logger.info(fn, `start process payment for subscription "${subscription.identifier}"`);
        paymentStatus[subscription.identifier] = false;

        const tax = (subscription.tax && Math.round(subscription.tax * 100)) || 0;

        let transaction = null;

        try {
          let subscriptionResult = null;
          let updates = {
            status: PURCHASED_PLAN_STATUS_SUCCESS,
          };
          if (isStripeGateway(billingEngine))  {
            let plans = [];
            for (let item of purchasedPlan.items) {
              if (item.isOneTimeCharge || !item.salesModel || !item.salesModel.subscription) {
                continue;
              }
              const subscriptionIdentifier = generateSubscriptionIdentifier(item.salesModel.subscription);
              if (subscriptionIdentifier !== subscription.identifier) {
                continue;
              }
    
              const sku = item.references && item.references.sku;
              if (!sku) {
                continue;
              }
              logger.info(fn, `purchased plan item "${item.identifier}" sku >>>>>> "${sku}"`);
    
              const planId = await GetPlan(sku);
              logger.info(fn, `sku "${sku}" plan id is "${planId}"`);
              if (!planId) {
                continue;
              }
    
              
              logger.info(fn, `sku "${sku}"`);
              plans.push({
                plan: planId.objectId,
                sku: sku,
                quantity: item.quantity
              });
            }
            logger.info(fn, `plans for ${subscription.identifier}:`, JSON.stringify(plans));

            subscriptionResult = await CreateSubscription(req, customerId, plans, tax, subscription._id, billingEngine);
            logger.info(fn, `created subscription for "${subscription.identifier}" result:`, subscriptionResult);

            transaction = await TransactionBackend.startTransaction('purchasedplan.subscriptions', subscription._id, {
              payment: {
                billingEngine: purchasedPlan.payment.billingEngine,
                metadata: { 
                  ...purchasedPlan.payment.metadata, 
                  invoiceId: null, 
                  subscriptionId: subscriptionResult.id,
                  periodStart: subscriptionResult.current_period_start,
                  periodEnd: subscriptionResult.current_period_end,

                }
              },
  
              amount: subscription.total,
              currency: purchasedPlan.currency,
  
              tax: {
                taxDetails: subscription.taxDetails,
                amount: subscription.tax,
                // FIXME: hardcoded for now
                taxEngine: 'AVALARA', //e.g.: AVALARA
                metadata: {
                  documentCode: `${subscription._id}_purchasedplan.subscriptions`,
                  commit: false
                }
                // metadata: {} //e.g.: document code, commit: true or false
              },
            }, userId, options);
            logger.info(fn, 'transaction created:', transaction._id);

            updates[`subscriptions.${subscriptionIndex}.payment.metadata.subscriptionId`] = subscriptionResult.id;
            
            let commitTaxResultRecurring = await CommitTransaction(req, `${subscription._id}_purchasedplan.subscriptions`);
            logger.info(fn, `tax committed for ${subscription.identifier}:`, commitTaxResultRecurring);
          } else if (billingEngine == PAYMENT_GATEWAYS.NATIVE)  {
            const billingAccount = await BillingAccountBackend.findOneByIdentifier(user, purchasedPlan.billingAccountId, options);

            const purchaseOrder = billingAccount && billingAccount.purchaseOrder;

            logger.info(fn, 'PO:', purchaseOrder);

            if (!purchaseOrder || purchaseOrder.status != PO_STATUS_APPROVED) {
              throw new Error('Purchase order not approved.')
            }
            transaction = await TransactionBackend.startTransaction('purchasedplan.subscriptions', subscription._id, {
              payment: {
                billingEngine: purchasedPlan.payment.billingEngine,
                metadata: { 
                  ...purchasedPlan.payment.metadata, 
                }
              },
  
              amount: subscription.total,
              currency: purchasedPlan.currency,
  
              tax: {
                taxDetails: subscription.taxDetails,
                amount: subscription.tax,
                // FIXME: hardcoded for now
                taxEngine: 'AVALARA', //e.g.: AVALARA
                metadata: {
                  documentCode: `${subscription._id}_purchasedplan.subscriptions`,
                  commit: false
                }
                // metadata: {} //e.g.: document code, commit: true or false
              },
            }, userId, options);

            logger.info(fn, 'transaction created:', transaction._id);

            const withinLimit = await CheckPOLimit(billingAccount);

            if (!withinLimit)  {
              throw new Error('PO limit exceeded.');
            }
            let commitTaxResultRecurring = await CommitTransaction(req, `${subscription._id}_purchasedplan.subscriptions`);
            logger.info(fn, `tax committed for ${subscription.identifier}:`, commitTaxResultRecurring);
          }

          updates[`subscriptions.${subscriptionIndex}.status`] = PURCHASED_PLAN_SUBSCRIPTION_STATUS_ACTIVE;
          updates[`subscriptions.${subscriptionIndex}.payment.status`] = CHARGE_STATUS.CHARGED;
          updates[`subscriptions.${subscriptionIndex}.payment.on`] = new Date();
          updates[`subscriptions.${subscriptionIndex}.payment.billingEngine`] = billingEngine;
          updates[`subscriptions.${subscriptionIndex}.payment.next`] = moment().add(subscription.billingInterval, subscription.billingPeriod);
          await PurchasedPlanBackend.findOneAndUpdate({
            _id: purchasedPlan._id
          }, {
            $set: updates,
          }, options);
          logger.info(fn, 'purchased plan subsctiption status updated');

          if (transaction && transaction._id) {
            const now = new Date();
            await TransactionBackend.endTransaction(transaction._id, STATUS.SUCCESS, {
              'payment.attempts': 1,
              'payment.lastAttempt': now,
              'tax.metadata.commit': true,
              'payment.metadata.periodStart': subscriptionResult ? subscriptionResult.current_period_start : now,
              'payment.metadata.periodEnd': subscriptionResult ? subscriptionResult.current_period_end : moment(now).add(1, 'months'),
            }, options);
            logger.info(fn, 'transaction status updated to success');
          }

          // write order process log
          await PurchasedPlanBackend.log(context.purchasedPlan, false, 'order subscription charge completed', {
            _id: subscription._id,
            identifier: subscription.identifier,
          }, context.user, options);
          logger.info(fn, `subscription "${subscription._id}" - "${subscription.identifier}" payment success`);

          // mark as succeed
          paymentStatus[subscription.identifier] = true;
        } catch (e) {
          logger.error(fn, 'processing payment error:', e);
          if (transaction && transaction._id) {
            await TransactionBackend.endTransaction(transaction._id, STATUS.FAIL, null, options);
            logger.info(fn, 'order transaction status updated to fail');
          }

          // write order process log
          await PurchasedPlanBackend.log(context.purchasedPlan, false, 'order subscription charge failed', {
            _id: subscription._id,
            identifier: subscription.identifier,
            error: e,
          }, context.user, options);
          logger.info(fn, `subscription "${subscription._id}" - "${subscription.identifier}" payment failed`);

          // move to next subscription
        }
      }

      logger.info(fn, 'payment status:', paymentStatus);
      if (Object.values(paymentStatus).indexOf(false) > -1) {
        throw new Error('Not all subscription payment success');
      }

      const result1 = await emitter.emitPromise(ASEVENT_ORDER_SUBSCRIPTIONS_BILLING_SUCCESS, context);
      await PurchasedPlanBackend.log(context.purchasedPlan, !!result1, `${ASEVENT_ORDER_SUBSCRIPTIONS_BILLING_SUCCESS} process done`, result1, context.user, options);
    })
    .then(async() =>  {
      if (billingEngine != PAYMENT_GATEWAYS.GSMB)  {
        return;
      }

      const { SendOrderPayload } = require('../../../billing/gsmb/gsmb.backend');

      await SendOrderPayload(purchasedPlan, options);

      let updates = {
        status: PURCHASED_PLAN_STATUS_SUCCESS,
      };
      
      updates[`payment.metadata.billingSent`] = true;

      if (purchasedPlan.subscriptions && purchasedPlan.subscriptions.length) {
        for (let subscriptionIndex in purchasedPlan.subscriptions) {
          updates[`subscriptions.${subscriptionIndex}.status`] = PURCHASED_PLAN_SUBSCRIPTION_STATUS_ACTIVE;
          updates[`subscriptions.${subscriptionIndex}.payment.billingEngine`] = billingEngine;
        }
      }

      await PurchasedPlanBackend.findOneAndUpdate({
        _id: purchasedPlan._id
      }, {
        $set: updates,
      }, options);
      
      logger.info(fn, 'purchased plan subsctiption status updated');
    })
    .then(async() => {
      // reload order
      context.purchasedPlan = await PurchasedPlanBackend.findOneById(purchasedPlan._id, options);
    })
    .then(() => {
      // mark payment done
      if (context.processStatus) {
        context.processStatus.subscriptionPayment = ORDER_PROCESSING_SUCCEED;
      }

      next();
    })
    .catch(async(err) => {
      logger.error(fn, 'Error:', err);

      // mark payment failed
      if (context.processStatus) {
        context.processStatus.subscriptionPayment = ORDER_PROCESSING_FAILED;
      }

      try { // update the order as failed
        await OrderBackend.setOrderStatus(context.order, ORDER_STATUS_FAILED, context);

        // emit billing failed event
        const result2 = await emitter.emitPromise(ASEVENT_ORDER_SUBSCRIPTIONS_BILLING_FAILED, context);
        await PurchasedPlanBackend.log(context.purchasedPlan, !!result2, `${ASEVENT_ORDER_SUBSCRIPTIONS_BILLING_FAILED} process done`, err, context.user, options);
      } catch (err2) {
        logger.error(fn, 'Error2:', err2);
      }

      next(err);
    });
};

module.exports = processEvent;