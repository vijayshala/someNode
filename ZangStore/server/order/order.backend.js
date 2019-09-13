const ns = '[order.backend]';
const logger = require('applogger');

const { CreateOrderConfirmationNumber } = require('./order.utils');
const { DbBase } = require('../modules/db/index');
const globalcontants = require('../../config/constants');
const { OrderSchema } = require('./order.model');
const {
  ORDER_STATUS_NEW,
  ORDER_STATUS_FAILED,
  ORDER_STATUS_SUCCESS,
  ORDER_PROCESSING_NOT_STARTED,
  ORDER_STATUS_PENDING_APPROVAL
} = require('./order.constants');
const { SalesModelBackend } = require('../salesmodel/salesmodel.backend');
const { ProcessLogBackend } = require('../process-log/process-log.backend');
const { PROCESS_LOG_REFERENCE_ORDER } = require('../process-log/process-log.constants');
const { PURCHASED_PLAN_STATUS_FAILED } = require('../purchased-plan/purchased-plan.constants');
const { CartBackend } = require('../cart/cart.backend');
const { PurchasedPlanBackend } = require('../purchased-plan/purchased-plan.backend');
const { UserBackend } = require('../user/user.backend');
const { RegionBackend } = require('../region/region.backend');
const { ASEventEmitter } = require('../modules/event');
const { IsImmediatePaymentType, SendPOEmailConfirmation, SendPOPendingEmail } = require('../billingaccount/billingaccount.utils')
const {
  ASEVENT_ORDER_BEFORE_CREATE,
  ASEVENT_ORDER_CREATED,
  ASEVENT_ORDER_SUCCESS,
  ASEVENT_CHANGE_ORDER_SUCCESS,
  ASEVENT_ORDER_FAILED,
  ASEVENT_ORDER_BILLING,
  ASEVENT_CHANGE_ORDER_CREATED,
  ASEVENT_CHANGE_ORDER_BEFORE_CREATE,
  ASEVENT_CHANGE_ORDER_BILLING,
} = require('../modules/event/constants');

class OrderBackend extends DbBase {
  async log(order, error, text, debug, user, options) {
    const fn = `[${options.requestId}]${ns}[log]`;
    const userId = user && (user._id || user.userId);

    let debugInfo = (debug && JSON.parse(JSON.stringify(debug))) || '';
    if (debug && debug instanceof Error) {
      debugInfo.stack = debug.stack;
    }

    let log = {
      refType: PROCESS_LOG_REFERENCE_ORDER,
      refId: order._id,
      status: order.status,
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

  async findOneByIdentifier(user, identifier, options) {
    let fn = `[${options.requestId}]${ns}[findOneByIdentifier]`;

    const { BillingAccountBackend } = require('../billingaccount/billingaccount.backend');

    options = Object.assign({
      identifierType: 'identifier',
      populate: [],
    }, options);
    // logger.info(fn, 'options:', options);

    let query = {};
    if (!(user.accessLevel <= globalcontants.USER_LEVELS.ADMIN)) {
      const billingAccounts = await BillingAccountBackend.findByUser(user, options);
      const billingAccountIds = billingAccounts.map((one) => one._id);

      query = {
        billingAccountId: { '$in': billingAccountIds },
      };
    }
    query[options.identifierType] = identifier;

    logger.info(fn, 'query:', query);
    let order = await this.findOne(query, options);

    logger.debug(fn, 'order:', order);

    return order;
  }

  async findByUser(user, options) {
    let fn = `[${options.requestId}]${ns}[findByUser]`;

    const { BillingAccountBackend } = require('../billingaccount/billingaccount.backend');

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

    logger.info(fn, 'orders:', orders);

    return orders;
  }

  async populateSalesModels(order, options) {
    const { SalesModelMapping } = require('../modules/cart-salesmodel-rules/utils');

    // find all SalesModels used in the order
    let salesModelIds = (order && order.items && order.items.map((one) => {
      return (one && one.salesModel && one.salesModel._id) || null;
    }).filter((one) => {
      return one;
    })) || [];
    let salesModels = [];
    // load SalesModels
    if (salesModelIds && salesModelIds.length) {
      // find unique
      salesModelIds = [...new Set(salesModelIds)];
      salesModels = await SalesModelBackend.findAllByIdentifiers(salesModelIds, { ...options, identifierType: '_id' });
    }
    if (salesModels.length > 0) {
      const salesModelsMap = new SalesModelMapping();
      salesModelsMap.init(salesModels);

      for (let ci in order.items) {
        let item = order.items[ci];
        const salesModelId = item.salesModel && item.salesModel.identifier;
        const salesModelItemId = item.salesModelItem && item.salesModelItem.identifier;
        const salesModelItemAttributesId = item.attribute && item.attribute.identifier;

        // calculate order item identifier
        let identifier = [];
        if (salesModelId) {
          identifier.push(salesModelId);
          item.salesModel = salesModelsMap.getOneByIdentifier(identifier.join('..'));
          if (salesModelItemId) {
            identifier.push(salesModelItemId);
            item.salesModelItem = salesModelsMap.getOneByIdentifier(identifier.join('..'));
            if (salesModelItemAttributesId) {
              const attributeDistinguishInfo = '(' +
                (item.attribute.value ? JSON.stringify(item.attribute.value) : '') +
                ',' +
                (item.attribute.helper ? JSON.stringify(item.attribute.helper) : '') +
                ')';
              identifier.push(salesModelItemAttributesId + attributeDistinguishInfo);
              const originalAttribute = salesModelsMap.getOneByIdentifier(identifier.join('..'));
              item.attribute = { ...originalAttribute, ...item.attribute };
            }
          }
        }
      }
    }

    return order;
  }

  async createOrder(user, order, options) {
    const fn = `[${options.requestId}]${ns}[create]`;
    const userId = user && (user._id || user.userId);

    let rawUser = user;
    options.region = (order.region  || options.region || 'US').toUpperCase();
    if (!user._id) {
      rawUser = await UserBackend.findOneById(userId, options);
    }

    const billingInformation = await UserBackend.getUserBillingInformation(userId, options);
    const cart = await CartBackend.findByUser(user, options);

    let combinedOrder = Object.assign({},
      billingInformation,
      cart,
      order, {
        status: ORDER_STATUS_NEW,
        confirmationNumber: CreateOrderConfirmationNumber(),
        created: {
          by: userId,
          on: new Date(),
        },
      });

    // remove fields
    ['__v', '_id', 'id', 'updated'].forEach((one) => {
      if (combinedOrder.hasOwnProperty(one)) {
        delete combinedOrder[one];
      }
    });

    

    // save order
    logger.info(fn, 'order prepared', combinedOrder);
    let currentRegion = await RegionBackend.findByCode(combinedOrder.region);
    const context1 = {
      requestId: options.requestId,
      baseUrl: options.baseUrl,
      localizer: options.localizer,
      user: user,
      order: combinedOrder,
      purchasedPlan: options.purchasedPlan,
      currentRegion,  // region
    };
    const eventResult1 = await ASEventEmitter.emitPromise(ASEVENT_ORDER_BEFORE_CREATE, context1);
    if (eventResult1 && eventResult1 instanceof Error) {
      throw eventResult1;
    }

    let created = await this.create(combinedOrder, options);
    // reload order from db
    // created = await this.findOneById(created._id, options);
    if (created && created.toObject) {
      // convert to plain object
      created = created.toObject();
    }
    await this.log(created, false, `new order created`, null, user, options);
    logger.info(fn, `new order created`, created);
    // populate order item salesmodels
    // created = await this.populateSalesModels(created, options);
    // emit order created event
    const context2 = {
      requestId: options.requestId,
      baseUrl: options.baseUrl,
      localizer: options.localizer,
      user: user,
      rawUser: rawUser,
      order: created,
      purchasedPlan: options.purchasedPlan,
      processStatus: {
        onetimePayment: ORDER_PROCESSING_NOT_STARTED,
        subscriptionPayment: ORDER_PROCESSING_NOT_STARTED,
        // maybe we add shipping handling here
      },
      currentRegion
    };

    const eventResult2 = await ASEventEmitter.emitPromise(ASEVENT_ORDER_CREATED, context2);
    await this.log(context2.order, !!eventResult2, `${ASEVENT_ORDER_CREATED} process done`, eventResult2, user, options);

    const immediatePayment = IsImmediatePaymentType(created.payment);
    logger.info(fn, 'is immediate payment type', immediatePayment);

    context2.event = null;

    if (immediatePayment) {
      const eventResult3 = await ASEventEmitter.emitPromise(ASEVENT_ORDER_BILLING, context2);
      await this.log(context2.order, !!eventResult3, `${ASEVENT_ORDER_BILLING} process done`, eventResult3, user, options);
    } else {
      await this.setOrderStatus(created, ORDER_STATUS_PENDING_APPROVAL, context2);
    }

    return context2.order;
  }

  async createChangeOrder(user, order, options) {
    const fn = `[${options.requestId}]${ns}[createChangeOrder]`;
    const userId = user && (user._id || user.userId);

    let rawUser = user;
    options.region = (order.region  || options.region || 'US').toUpperCase();
    if (!user._id) {
      rawUser = await UserBackend.findOneById(userId, options);
    }

    let combinedOrder = Object.assign({},
      order, 
      {
        status: ORDER_STATUS_NEW,
        confirmationNumber: CreateOrderConfirmationNumber(),
        created: {
          by: userId,
          on: new Date(),
        },
      });

    // remove fields
    ['__v', '_id', 'id', 'updated'].forEach((one) => {
      if (combinedOrder.hasOwnProperty(one)) {
        delete combinedOrder[one];
      }
    });

    // save order
    logger.info(fn, 'order prepared', combinedOrder);
    logger.info(fn, 'order.region', combinedOrder.region);
    let currentRegion = await RegionBackend.findByCode(combinedOrder.region, options);
    const context1 = {
      requestId: options.requestId,
      baseUrl: options.baseUrl,
      localizer: options.localizer,
      user: user,
      order: combinedOrder,
      purchasedPlan: options.purchasedPlan,
      currentRegion,  // region
    };
    const eventResult1 = await ASEventEmitter.emitPromise(ASEVENT_CHANGE_ORDER_BEFORE_CREATE, context1);
    if (eventResult1 && eventResult1 instanceof Error) {
      throw eventResult1;
    }

    let created;
    if (options.mutex)  {
      //check if order exists for sync_id
      const mutexObj = options.mutex;
      logger.info(fn, 'order pre save', combinedOrder);
      created = await this.findOneAndUpdate({
        'metadata.mutex': mutexObj
      }, {
        'metadata.mutex': mutexObj
      }, {...options, upsert: true, rawResult: true, new: true});

      logger.info(fn, '*** result', created);
      if (created && (created.updatedExisting || (created.lastErrorObject && created.lastErrorObject.updatedExisting))) {
        logger.warn(fn, 'Order already exists for this sync_id');
        return;
      }
      created = created.value;

      created = await this.findOneAndUpdate({
        _id: created._id
      }, combinedOrder, {...options, new: true});
    } else {
      created = await this.create(combinedOrder, options);
    }
    
    // reload order from db
    // created = await this.findOneById(created._id, options);
    if (created && created.toObject) {
      // convert to plain object
      created = created.toObject();
    }
    await this.log(created, false, `new order created`, null, user, options);
    logger.info(fn, `new order created`, created);
    // populate order item salesmodels
    // created = await this.populateSalesModels(created, options);
    // emit order created event
    const context2 = {
      requestId: options.requestId,
      baseUrl: options.baseUrl,
      localizer: options.localizer,
      user: user,
      rawUser: rawUser,
      order: created,
      purchasedPlan: options.purchasedPlan,
      processStatus: {
        onetimePayment: ORDER_PROCESSING_NOT_STARTED,
        subscriptionPayment: ORDER_PROCESSING_NOT_STARTED,
        // maybe we add shipping handling here
      },
      currentRegion
    };

    const eventResult2 = await ASEventEmitter.emitPromise(ASEVENT_CHANGE_ORDER_CREATED, context2);
    await this.log(context2.order, !!eventResult2, `${ASEVENT_CHANGE_ORDER_CREATED} process done`, eventResult2, user, options);

    context2.event = null;

    const eventResult3 = await ASEventEmitter.emitPromise(ASEVENT_CHANGE_ORDER_BILLING, context2);
    await this.log(context2.order, !!eventResult3, `${ASEVENT_CHANGE_ORDER_BILLING} process done`, eventResult3, user, options);

    return context2.order;
  }

  async removeByUser(user, options) {
    let fn = `[${options.requestId}]${ns}[removeByUser]`;

    const { BillingAccountBackend } = require('../billingaccount/billingaccount.backend');

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
   * Update order status
   *
   * @param {Object} order   order object
   * @param {String} status  new status string
   * @param {Object} context the context object passing down from processing order
   */
  async setOrderStatus(order, status, context, isChangeOrder = false) {
    const fn = `[${context.requestId}]${ns}[setOrderStatus]`;

    logger.info(fn, `update order ${order._id} status to ${status}`);


    const options = {
      requestId: context.requestId,
    };

    await this.findOneAndUpdate({
      _id: order._id,
    }, {
      $set: {
        status,
      }
    }, options);

    await this.log(order, false, `order status is updated to ${status}`, null, context.user, options);

    context.event = null;

    let result = null;
    if (status == ORDER_STATUS_SUCCESS && isChangeOrder) {
      result = await ASEventEmitter.emitPromise(ASEVENT_CHANGE_ORDER_SUCCESS, context);
      await this.log(order, !!result, `${ASEVENT_CHANGE_ORDER_SUCCESS} process done`, result, context.user, options);
    } else if (status == ORDER_STATUS_SUCCESS)  {
      result = await ASEventEmitter.emitPromise(ASEVENT_ORDER_SUCCESS, context);
      await this.log(order, !!result, `${ASEVENT_ORDER_SUCCESS} process done`, result, context.user, options);
    } else if (status == ORDER_STATUS_FAILED) {
      result = await ASEventEmitter.emitPromise(ASEVENT_ORDER_FAILED, context);
        await this.log(order, !!result, `${ASEVENT_ORDER_FAILED} process done`, result, context.user, options);

        if (context.purchasedPlan && context.purchasedPlan.orderIds && context.purchasedPlan.orderIds.length === 1) {
          // only update purchased plan to fail if the purchased plan is only from this order
          const { PurchasedPlanBackend } = require('../purchased-plan/purchased-plan.backend');
          await PurchasedPlanBackend.setStatus(context.purchasedPlan, PURCHASED_PLAN_STATUS_FAILED, options);
        }
    }

    logger.info(fn, 'order status updated');
  }

  async triggerOrderBilling(order, context) {
    const fn = `[${context.requestId}]${ns}[triggerOrderBilling]`;

    //logger.info(fn, 'context:', context.purchasedPlan);

    const eventResult = await ASEventEmitter.emitPromise(ASEVENT_ORDER_BILLING, context);
    await this.log(context.order, !!eventResult, `${ASEVENT_ORDER_BILLING} process done`, eventResult, context.rawUser, context);
  }
}

let backend = new OrderBackend(OrderSchema, {});

module.exports = {
  OrderBackend: backend,
};
