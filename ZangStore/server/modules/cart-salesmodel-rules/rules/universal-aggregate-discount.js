const ns = '[cart-salesmodel-rules][rules][universal-aggregate-discount]';

/**
 * This rule will aggregate all discount amount and update:
 * - cart.onetime.discount
 * - cart.subscriptions.*.discount
 */

const processEvent = function(params) {
  return function(context) {
    const fn = `${ns}[processEvent]`;
    const { generateSubscriptionIdentifier } = require('../utils');

    console.log(fn, 'started');

    let cart = context.cart;

    for (let one of cart.items) {
      if (!one.price || !one.quantity || one.price > 0) {
        continue;
      }

      if (one.isOneTimeCharge) {
        cart.onetime.discount += -one.price * one.quantity;
      } else {
        if (one && one.salesModel && one.salesModel.subscription) {
          const subscriptionIdentifier = generateSubscriptionIdentifier(one.salesModel.subscription);
          let existedSubscription = cart.subscriptions.findIndex((one) => {
            return subscriptionIdentifier === one.identifier;
          });
          cart.subscriptions[existedSubscription].discount += -one.price * one.quantity;
        }
      }
    };

    console.log(fn, 'done');
  };
};

module.exports = processEvent;
