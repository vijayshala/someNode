const ns = '[ASEventEmitter]';
const logger = require('applogger');

const ASEventEmitter = require('./emitter');
const {
  ASEVENT_CART_BEFORE_UPDATE,
  ASEVENT_ORDER_BEFORE_CREATE,
  ASEVENT_ORDER_CREATED,
  ASEVENT_QUOTE_CREATED,
  ASEVENT_ORDER_SUCCESS,
  ASEVENT_ORDER_FAILED,
  ASEVENT_QUOTE_BEFORE_CREATE,
  ASEVENT_PO_APPROVED,
  ASEVENT_ORDER_BILLING,
  ASEVENT_PO_REJECTED,
  ASEVENT_CLOCK_TICK_12_HOUR,
  ASEVENT_CHANGE_ORDER_CREATED,
  ASEVENT_CHANGE_ORDER_BEFORE_CREATE,
  ASEVENT_CHANGE_ORDER_BILLING,
} = require('./constants');
const productEnginesRegister = require('../product-engines/register-event-hooks');

const knownHooks = [
  { event: ASEVENT_CART_BEFORE_UPDATE, name: 'process-salesmodel-rules', listener: require('./hooks/process-salesmodel-rules'), },
  { event: ASEVENT_CART_BEFORE_UPDATE, name: 'calculate-cart-tax', listener: require('./hooks/calculate-cart-tax'), },
  { event: ASEVENT_CART_BEFORE_UPDATE, name: 'create-payment-method', listener: require('./hooks/create-payment-method'), },
  { event: ASEVENT_CART_BEFORE_UPDATE, name: 'validate-cart', listener: require('./hooks/validate-cart'), },

  { event: ASEVENT_ORDER_BEFORE_CREATE, name: 'process-salesmodel-rules', listener: require('./hooks/process-salesmodel-rules'), },
  { event: ASEVENT_ORDER_BEFORE_CREATE, name: 'calculate-cart-tax', listener: require('./hooks/calculate-cart-tax'), },
  { event: ASEVENT_ORDER_BEFORE_CREATE, name: 'create-payment-method', listener: require('./hooks/create-payment-method'), },
  { event: ASEVENT_ORDER_BEFORE_CREATE, name: 'process-company', listener: require('./hooks/process-company'), },
  { event: ASEVENT_ORDER_BEFORE_CREATE, name: 'validate-cart', listener: require('./hooks/validate-cart'), },

  { event: ASEVENT_CHANGE_ORDER_BEFORE_CREATE, name: 'process-salesmodel-rules', listener: require('./hooks/process-salesmodel-rules'), },
  { event: ASEVENT_CHANGE_ORDER_BEFORE_CREATE, name: 'calculate-cart-tax', listener: require('./hooks/calculate-cart-tax'), },
  // { event: ASEVENT_CHANGE_ORDER_BEFORE_CREATE, name: 'validate-cart', listener: require('./hooks/validate-cart'), },

  { event: ASEVENT_ORDER_CREATED, name: 'create-purchased-plans', listener: require('./hooks/create-purchased-plans'), },
  { event: ASEVENT_ORDER_CREATED, name: 'calculate-order-onetime-tax', listener: require('./hooks/calculate-order-onetime-tax'), },
  { event: ASEVENT_ORDER_CREATED, name: 'calculate-purchased-plan-subscriptions-tax', listener: require('./hooks/calculate-purchased-plan-subscriptions-tax'), },
  { event: ASEVENT_ORDER_CREATED, name: 'process-partner', listener: require('./hooks/process-partner'), },
  { event: ASEVENT_ORDER_CREATED, name: 'update-user-info', listener: require('./hooks/update-user-info'), },
  { event: ASEVENT_ORDER_CREATED, name: 'empty-cart', listener: require('./hooks/empty-cart'), },
  { event: ASEVENT_ORDER_CREATED, name: 'process-qoute-to-order', listener: require('./hooks/process-qoute-to-order'), },

  { event: ASEVENT_CHANGE_ORDER_CREATED, name: 'update-purchased-plans', listener: require('./hooks/update-purchased-plans'), },
  { event: ASEVENT_CHANGE_ORDER_CREATED, name: 'calculate-order-onetime-tax', listener: require('./hooks/calculate-order-onetime-tax'), },
  { event: ASEVENT_CHANGE_ORDER_CREATED, name: 'update-purchased-plan-subscriptions-tax', listener: require('./hooks/calculate-purchased-plan-subscriptions-tax'), },
  
  { event: ASEVENT_ORDER_BILLING, name: 'process-order-onetime-payment', listener: require('./hooks/process-order-onetime-payment'), },
  { event: ASEVENT_ORDER_BILLING, name: 'process-purchased-plan-subscriptions-payment', listener: require('./hooks/process-purchased-plan-subscriptions-payment'), },
  { event: ASEVENT_ORDER_BILLING, name: 'is-order-success', listener: require('./hooks/is-order-success'), },

  // { event: ASEVENT_CHANGE_ORDER_BILLING, name: 'process-order-onetime-payment', listener: require('./hooks/process-order-onetime-payment'), },
  // { event: ASEVENT_CHANGE_ORDER_BILLING, name: 'process-purchased-plan-subscriptions-update-payment', listener: require('./hooks/process-purchased-plan-subscriptions-update-payment'), },
  { event: ASEVENT_CHANGE_ORDER_BILLING, name: 'is-change-order-success', listener: require('./hooks/is-change-order-success'), },

  { event: ASEVENT_ORDER_SUCCESS, name: 'send-new-order-email', listener: require('./hooks/send-new-order-email'), },

  { event: ASEVENT_ORDER_FAILED, name: 'refund-failed-order', listener: require('./hooks/refund-failed-order'), },

  { event: ASEVENT_QUOTE_BEFORE_CREATE, name: 'process-salesmodel-rules', listener: require('./hooks/process-salesmodel-rules'), },
  { event: ASEVENT_QUOTE_BEFORE_CREATE, name: 'calculate-cart-tax', listener: require('./hooks/calculate-cart-tax'), },
  { event: ASEVENT_QUOTE_BEFORE_CREATE, name: 'validate-quote', listener: require('./hooks/validate-quote'), },
  
  { event: ASEVENT_QUOTE_CREATED, name: 'send-new-quote-email', listener: require('./hooks/send-new-quote-email'), },
  
  { event: ASEVENT_PO_APPROVED, name: 'po-approved', listener: require('./hooks/po-approved'), },
  { event: ASEVENT_PO_REJECTED, name: 'po-denied', listener: require('./hooks/po-denied'), },

  { event: ASEVENT_CLOCK_TICK_12_HOUR, name: 'po-bill-recurring', listener: require('./hooks/po-bill-recurring'), },

  ...productEnginesRegister(),
];

const asee = new ASEventEmitter();
asee.setMaxListeners(100);

// register hooks
knownHooks.forEach((hook) => {
  logger.info(ns, 'register', hook.event, 'to', hook.name);
  asee.on(hook.event, hook.listener);
});

let totalListeners = 0;
let listenerCountByEvent = {};
asee.eventNames().map(one => {
  const cnt = asee.listenerCount(one);
  totalListeners += cnt;
  listenerCountByEvent[one] = cnt;
});
logger.info(ns, 'total', totalListeners, '/', asee.getMaxListeners(), 'listeners registered', listenerCountByEvent);

module.exports = {
  ASEventEmitter: asee,
};
