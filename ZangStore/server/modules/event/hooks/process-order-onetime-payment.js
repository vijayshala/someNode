const ns = '[event.hooks.process-order-onetime-payment]';
const logger = require('applogger');

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const emitter = this;
  const { BadRequestError } = require('../../error');
  const U = require('../../utils');
  const {
    ORDER_STATUS_FAILED,
    ORDER_PROCESSING_SUCCEED,
    ORDER_PROCESSING_FAILED
  } = require('../../../order/order.constants');
  const {
    ASEVENT_ORDER_ONETIME_BILLING_SUCCESS,
    ASEVENT_ORDER_ONETIME_BILLING_FAILED,
  } = require('../constants');
  const { CHARGE_STATUS, PAYMENT_GATEWAYS } = require('../../../billing/Constants');
  const { OrderBackend } = require('../../../order/order.backend');
  const TransactionBackend = require('../../../transaction/transaction.backend');
  const { STATUS } = require('../../../transaction/transaction.constants');
  const { CommitTransaction } = require('../../../billing/Tax');
  const { BillingAccountBackend } = require('../../../billingaccount/billingaccount.backend');
  const { CheckPOLimit } = require('../../../billingaccount/billingaccount.utils');
  const { PO_STATUS_APPROVED } = require('../../../billingaccount/billingaccount.constants');
  const { isStripeGateway } = require('../../../billing/integrations/stripe');
  let order = context.order;
  const user = context.user;
  const userId = user && (user._id || user.userId);
  let currentRegion = context.currentRegion;

  logger.info(fn, 'started', 'order id=', order && order._id);
  if (!order) {
    return next(new BadRequestError('Cannot find order payload'));
  }

  let req = {
    requestId: context.requestId,
    userInfo: context.user,
  };
  const options = {
    requestId: context.requestId,
  };
  const billingEngine = order.payment && order.payment.billingEngine;

  U.P()
    .then(async() => {
      // process one time charge
      logger.info(fn, 'order.onetime', order.onetime);
      let total = order.onetime.total  || 0;
      const charge = Math.round(total * 100);
      if (!charge) {
        logger.info(fn, 'no one time charge, skipped');
        return;
      }
      if (!isStripeGateway(billingEngine))  {
        return;
      }
      
      const customerId = order.payment && order.payment.metadata && order.payment.metadata.customerId;
      const sourceId = order.payment && order.payment.metadata && order.payment.metadata.sourceId;

      if (!billingEngine || !customerId || !sourceId) {
        throw new BadRequestError('Order doesn\'t have sucessfull payment method');
      }

      logger.info(fn, `start process one time payment`);

      const { CreateCharge } = require('../../../billing/Charge');

      // FIXME: use currency module to convert to integer
      
      let transaction = null;
      try {
        transaction = await TransactionBackend.startTransaction('order', order._id, {
          payment: {
            billingEngine: billingEngine,
            metadata: order.payment.metadata,
          },

          amount: order.onetime.total,
          currency: order.currency,

          tax: {
            taxDetails: order.onetime.taxDetails,
            amount: order.onetime.tax,
            // FIXME: hardcoded for now
            taxEngine: 'AVALARA', //e.g.: AVALARA
            metadata: {
              documentCode: `${order._id}_order`,
              commit: false
            }
            // metadata: {} //e.g.: document code, commit: true or false
          },
        }, userId, options);
        logger.info(fn, 'transaction created:', transaction._id);

        const chargeResult = await CreateCharge(req, charge, customerId, sourceId, order._id, billingEngine);
        logger.info(fn, 'one time charge result:', chargeResult);
        if (currentRegion.canCommitTax) {
          let commitTaxResultOneTime = await CommitTransaction(req, `${order._id}_order`);
          logger.info(fn, 'tax committed onetime', commitTaxResultOneTime);
        }        

        await OrderBackend.findOneAndUpdate({
          _id: order._id,
        }, {
          $set: {
            'onetime.payment.status': CHARGE_STATUS.CHARGED,
            'onetime.payment.on': new Date(),
            'onetime.payment.billingEngine': billingEngine,
            'onetime.payment.metadata.paymentId': chargeResult.id,
          }
        });
        logger.info(fn, 'order onetime payment status updated');

        if (transaction && transaction._id) {
          await TransactionBackend.endTransaction(transaction._id, STATUS.SUCCESS, {
            'payment.attempts': 1,
            'payment.lastAttempt': new Date(),
            'tax.metadata.commit': true,
            'payment.metadata.paymentId': chargeResult.id
          }, options);
          logger.info(fn, 'order transaction status updated to success');
        }

        // write order process log
        await OrderBackend.log(order, false, 'order one time charge completed', null, context.user, options);

        const result1 = await emitter.emitPromise(ASEVENT_ORDER_ONETIME_BILLING_SUCCESS, context);
        await OrderBackend.log(context.order, !!result1, `${ASEVENT_ORDER_ONETIME_BILLING_SUCCESS} process done`, result1, context.user, options);
      } catch (err) {
        logger.info(fn, 'process one time payment failed', err);

        if (transaction && transaction._id) {
          await TransactionBackend.endTransaction(transaction._id, STATUS.FAIL, null, options);
          logger.info(fn, 'order transaction status updated to fail');
        }

        const result2 = await emitter.emitPromise(ASEVENT_ORDER_ONETIME_BILLING_FAILED, context);
        await OrderBackend.log(context.order, !!result2, `${ASEVENT_ORDER_ONETIME_BILLING_FAILED} process done`, err, context.user, options);

        // fail the order
        throw err;
      }
    })
    .then(async() =>  {
      if (!order.onetime.total) {
        logger.info(fn, 'no one time charge, skipped');
        return;
      }
      if (billingEngine != PAYMENT_GATEWAYS.NATIVE)  {
        return;
      }

      const billingAccount = await BillingAccountBackend.findOneByIdentifier(user, order.billingAccountId, options);
      const purchaseOrder = billingAccount && billingAccount.purchaseOrder;

      if (!purchaseOrder || purchaseOrder.status != PO_STATUS_APPROVED) {
        throw new BadRequestError('Order doesn\'t have sucessful payment method');
      }

      const withinLimit = await CheckPOLimit(billingAccount);

      if (!withinLimit)  {
        throw new Error('PO limit exceeded.');
      }

      let transaction = null;
      try {
        transaction = await TransactionBackend.startTransaction('order', order._id, {
          payment: {
            billingEngine: billingEngine,
            metadata: order.payment.metadata,
          },

          amount: order.onetime.total,
          currency: order.currency,

          tax: {
            taxDetails: order.onetime.taxDetails,
            amount: order.onetime.tax,
            // FIXME: hardcoded for now
            taxEngine: 'AVALARA', //e.g.: AVALARA
            metadata: {
              documentCode: `${order._id}_order`,
              commit: false
            }
            // metadata: {} //e.g.: document code, commit: true or false
          },
        }, userId, options);
        logger.info(fn, 'transaction created:', transaction._id);
        if (currentRegion.canCommitTax) {
          let commitTaxResultOneTime = await CommitTransaction(req, `${order._id}_order`);
          logger.info(fn, 'tax committed onetime', commitTaxResultOneTime);
        }

        await OrderBackend.findOneAndUpdate({
          _id: order._id,
        }, {
          $set: {
            'onetime.payment.status': CHARGE_STATUS.CHARGED,
            'onetime.payment.on': new Date(),
            'onetime.payment.billingEngine': billingEngine,
          }
        });
        logger.info(fn, 'order onetime payment status updated');

        if (transaction && transaction._id) {
          await TransactionBackend.endTransaction(transaction._id, STATUS.SUCCESS, {
            'payment.attempts': 1,
            'payment.lastAttempt': new Date(),
            'tax.metadata.commit': true,
          }, options);
          logger.info(fn, 'order transaction status updated to success');
        }

        // write order process log
        await OrderBackend.log(order, false, 'order one time charge completed', null, context.user, options);

        const result1 = await emitter.emitPromise(ASEVENT_ORDER_ONETIME_BILLING_SUCCESS, context);
        await OrderBackend.log(context.order, !!result1, `${ASEVENT_ORDER_ONETIME_BILLING_SUCCESS} process done`, result1, context.user, options);
      } catch (err) {
        logger.info(fn, 'process one time payment failed', err);

        if (transaction && transaction._id) {
          await TransactionBackend.endTransaction(transaction._id, STATUS.FAIL, null, options);
          logger.info(fn, 'order transaction status updated to fail');
        }

        const result2 = await emitter.emitPromise(ASEVENT_ORDER_ONETIME_BILLING_FAILED, context);
        await OrderBackend.log(context.order, !!result2, `${ASEVENT_ORDER_ONETIME_BILLING_FAILED} process done`, err, context.user, options);

        // fail the order
        throw err;
      }
    })
    .then(async() => {
      if (Object.keys(PAYMENT_GATEWAYS).indexOf(billingEngine) == -1)  {
        throw new BadRequestError('Order doesn\'t have sucessfull payment method');
      }
      // reload order
      context.order = await OrderBackend.findOneById(order._id, options);
    })
    .then(() => {
      // mark payment done
      if (context.processStatus) {
        context.processStatus.onetimePayment = ORDER_PROCESSING_SUCCEED;
      }

      next();
    })
    .catch(async(err) => {
      logger.error(fn, 'Error:', err);

      // mark payment failed
      if (context.processStatus) {
        context.processStatus.onetimePayment = ORDER_PROCESSING_FAILED;
      }

      try { // update the order as failed
        await OrderBackend.setOrderStatus(order, ORDER_STATUS_FAILED, context);
      } catch (err2) {
        logger.error(fn, 'Error2:', err);
      }

      next(err);
    });
};

module.exports = processEvent;
