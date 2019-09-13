const ns = '[purchased-plan.backend]';
const logger = require('applogger');

const { DbBase } = require('../modules/db/index');
const globalcontants = require('../../config/constants');
const { PurchasedPlanSchema } = require('./purchased-plan.model');
const { 
  PURCHASED_PLAN_STATUS_CANCELED, 
  PURCHASED_PLAN_STATUS_FAILED, 
  PURCHASED_PLAN_SUBSCRIPTION_STATUS_ACTIVE, 
  PURCHASED_PLAN_STATUS_SUCCESS,
  PURCHASED_PLAN_STATUS_REQUESTED_CANCEL,
  PURCHASED_PLAN_SUBSCRIPTION_STATUS_REQUESTED_CANCEL,
  PURCHASED_PLAN_SUBSCRIPTION_STATUS_CANCELED
} = require('./purchased-plan.constants');
const { BillingAccountBackend } = require('../billingaccount/billingaccount.backend');
const { ProcessLogBackend } = require('../process-log/process-log.backend');
const { PROCESS_LOG_REFERENCE_PURCHASED_PLAN } = require('../process-log/process-log.constants');
const { PAYMENT_GATEWAYS } = require('../billing/Constants');

class PurchasedPlanBackend extends DbBase {
  async log(purchasedPlan, error, text, debug, user, options) {
    const fn = `[${options.requestId}]${ns}[log]`;
    const userId = user && (user._id || user.userId);

    let debugInfo = (debug && JSON.parse(JSON.stringify(debug))) || '';
    if (debug && debug instanceof Error) {
      debugInfo.stack = debug.stack;
    }

    let log = {
      refType: PROCESS_LOG_REFERENCE_PURCHASED_PLAN,
      refId: purchasedPlan._id,
      status: purchasedPlan.status,
      error: !!error,
      text,
      debug: debugInfo,
      created: {
        by: userId,
        on: new Date(),
      },
    };

    return await ProcessLogBackend.create(log, options);
  }

  async findByOrderId(orderId, options) {
    return await this.find({
      orderIds: orderId,
    }, options);
  }

  async findOneByIdMSA(partnerId, ppid, options)  {
    const fn = `[${options.requestId}]${ns}[findOneByIdMSA]`;
    const { PartnerBackend } = require('../partner/partner.backend');

    let subpartnerIds = await PartnerBackend.find({
      parent: partnerId
    }, {...options, select: {_id: 1}});

    subpartnerIds = subpartnerIds.map(item => item._id);

    logger.info(fn, 'subpartnerIds', subpartnerIds);

    let query = {
      $or: [
        {
          partner: partnerId
        },
        {
          partner: {
            $in: subpartnerIds
          }
        }
      ],
      _id: ppid
    };

    logger.info(fn, 'query', query);

    const purchasedPlan = await this.findOne(query, options);

    return purchasedPlan;
  }

  async findOneByBillingEngineIdentifier(identifier, options) {
    let fn = `[${options && options.requestId}]${ns}[findOneByBillingEngineIdentifier]`;

    options = Object.assign({
      // gateway: PAYMENT_GATEWAYS.STRIPE,
      identifierType: 'subscriptionId',
      ignoreNotFoundError: true
    }, options);
    logger.info(fn, 'options:', options);

    let metadataPath = `subscriptions.payment.metadata.${options.identifierType}`;
    let query = {
      'subscriptions.payment.billingEngine': options.gateway,
      [metadataPath]: identifier
    };
    let purchasedPlan = await this.findOne(query, options);

    logger.info(fn, 'purchased-plan', purchasedPlan);

    return purchasedPlan;
  }

  async findOneByIdentifier(user, identifier, options) {
    let fn = `[${options.requestId}]${ns}[findOneByIdentifier]`;

    options = Object.assign({
      identifierType: 'identifier',
      populate: [],
    }, options);
    logger.debug(fn, 'options:', options);

    let query = {};
    if (!(user.accessLevel <= globalcontants.USER_LEVELS.ADMIN)) {
      const billingAccounts = await BillingAccountBackend.findByUser(user, options);
      const billingAccountIds = billingAccounts.map((one) => one._id);

      query = {
        billingAccountId: { '$in': billingAccountIds },
      };
    }

    query[options.identifierType] = identifier;
    let order = await this.findOne(query, options);

    logger.info(fn, 'order:', order);

    return order;
  }

  async findByUser(user, options) {
    let fn = `[${options.requestId}]${ns}[findByUser]`;

    options = Object.assign({
      populate: [],
      sort: { 'created.on': -1 },
      query: {}
    }, options);
    // logger.info(fn, 'options:', options);

    const billingAccounts = await BillingAccountBackend.findByUser(user, options);
    const billingAccountIds = billingAccounts.map((one) => one._id);

    let query = Object.assign(options.query, {
      billingAccountId: { '$in': billingAccountIds },
    });
    let orders = await this.find(query, options);

    logger.debug(fn, 'orders:', orders);

    return orders;
  }

  async findByCompanyAndProduct(companyNid, productEngines, options) {
    if (!Array.isArray(productEngines)) {
      productEngines = [productEngines];
    }

    const query = {
      'company.nid': companyNid,
      'items.engines': { $in: productEngines },
      status: {
        $nin: [
          PURCHASED_PLAN_STATUS_CANCELED,
          PURCHASED_PLAN_STATUS_FAILED,
        ]
      },
    };

    return await this.find(query, options);
  }

  async removeByUser(user, options) {
    let fn = `[${options.requestId}]${ns}[removeByUser]`;

    options = Object.assign({
      populate: []
    }, options);
    logger.info(fn, 'options:', options);

    const billingAccounts = await BillingAccountBackend.findByUser(user, options);
    const billingAccountIds = billingAccounts.map((one) => one._id);

    let query = {
      billingAccountId: { '$in': billingAccountIds },
    };
    let result = await this.remove(query, options);

    return result && result.result;
  }

  /**
   * Update purchased plan status
   *
   * @param {Object} purchasedPlan   purchased plan object
   * @param {String} status          new status string
   * @param {Object} context         the context object passing down from processing purchasedPlan
   */
  async setStatus(purchasedPlan, status, context) {
    const fn = `[${context.requestId}]${ns}[setPurchasedPlanStatus]`;

    if (!purchasedPlan || !purchasedPlan._id) {
      return;
    }

    logger.info(fn, `update purchased plan ${purchasedPlan._id} status to ${status}`);

    const options = {
      requestId: context.requestId,
    };

    await this.findOneAndUpdate({
      _id: purchasedPlan._id,
    }, {
      $set: {
        status,
      }
    }, options);

    await this.log(purchasedPlan, false, `purchased plan status is updated to ${status}`, null, context.user, options);

    // should we trigger more events?

    logger.info(fn, 'purchased plan status updated');
  }

  async findByDuePO(options) {
    const fn = `[${options && options.requestId}][findByDuePO]`;

    options = Object.assign({}, options);

    const purchaseOrders = await this.find({
      'payment.billingEngine': 'NATIVE',
      'payment.metadata.paymentType': 'PURCHASE_ORDER',
      status: PURCHASED_PLAN_STATUS_SUCCESS,
      'subscriptions.status': PURCHASED_PLAN_SUBSCRIPTION_STATUS_ACTIVE,
      'subscriptions.payment.next': {
        $lte: new Date()
      }
    }, options);

    return purchaseOrders;
  }

  async cancel(user, pp, options)  {
    const fn = `[${options.requestId}]${ns}[cancel]`;
    const purchasedPlan = pp._id ? pp : await this.findOneById(pp, options);
    const userId = user && (user._id || user.userId);
    const { CancelBilling } = require('../billingaccount/billingaccount.utils');
    const { ASEventEmitter } = require('../modules/event');
    const { ASEVENT_ORDER_BEFORE_DELETE } = require('../modules/event/constants');
    const { CanceledEmail } = require('./purchased-plan.utils');

    options = Object.assign({

    }, options);

    if (!purchasedPlan || purchasedPlan.status === PURCHASED_PLAN_STATUS_CANCELED)  {
      //already canceled
      logger.info(fn, 'purchased plan canceled already');
      //return;
    }

    //cancel billing
    await CancelBilling(purchasedPlan, options);

    //unprovision
    const context = {
      requestId: options.requestId,
      user: user,
      purchasedPlan: purchasedPlan,
    };

    const eventResult = await ASEventEmitter.emitPromise(ASEVENT_ORDER_BEFORE_DELETE, context);
    if (eventResult && eventResult instanceof Error) {
      throw eventResult;
    }

    let updates = {
      status: PURCHASED_PLAN_STATUS_CANCELED
    };
    for (let subscriptionIndex in purchasedPlan.subscriptions) {
      updates[`subscriptions.${subscriptionIndex}.status`] = PURCHASED_PLAN_SUBSCRIPTION_STATUS_CANCELED
    }

    const purchasedPlanCanceled = await this.findOneAndUpdate({
      _id: purchasedPlan._id
    }, {
      $set: updates
    }, {...options, new: true});

    logger.info(fn, 'purchased-plan canceled');

    await CanceledEmail(purchasedPlan, options);

    return purchasedPlanCanceled;
  }

  async requestCancel(user, ppId, options) {
    const fn = `[${options.requestId}]${ns}[requestCancel]`;
    const userId = user && (user._id || user.userId);
    const { RequestCancelEmail } = require('./purchased-plan.utils');
    const { PAYMENT_GATEWAYS } = require('../billing/Constants');

    options = Object.assign({

    }, options);

    const oldPurchasedPlan = await this.findOne({
      _id: ppId
    }, options);

    let updates = {
      status: PURCHASED_PLAN_STATUS_REQUESTED_CANCEL
    };
    for (let subscriptionIndex in oldPurchasedPlan.subscriptions) {
      updates[`subscriptions.${subscriptionIndex}.status`] = PURCHASED_PLAN_SUBSCRIPTION_STATUS_REQUESTED_CANCEL
    }

    const purchasedPlan = await this.findOneAndUpdate({
      _id: ppId
    }, {
      $set: updates
    }, {...options, new: true});

    const isGsmb = purchasedPlan && purchasedPlan.payment && purchasedPlan.payment.billingEngine == PAYMENT_GATEWAYS.GSMB;

    if (isGsmb) {
      const { SendOrderPayload } = require('../billing/gsmb/gsmb.backend');

      const result = await SendOrderPayload(purchasedPlan, options);
      
      logger.info(fn, 'send cancel request to GSMB');
    }

    await RequestCancelEmail(purchasedPlan, options);

    logger.info(fn, 'requested plan cancel');

    return purchasedPlan;
  }
}

let backend = new PurchasedPlanBackend(PurchasedPlanSchema, {});

module.exports = {
  PurchasedPlanBackend: backend,
};
