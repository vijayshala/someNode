const ns = '[cart-salesmodel-rules][rules][universal-calculate-subtotal]';

/**
 * This rule recalculates onetime and subscriptions subTotal.
 */

const processEvent = function(params) {
  return function(context) {
    const fn = `${ns}[processEvent]`;
    const { generateSubscriptionIdentifier } = require('../utils');

    console.log(fn, 'started');

    let cart = context.cart;

    // reset subTotal
    cart.onetime = {
      subTotal: 0,
      discount: 0,
      tax: 0,
      shipping: 0,
      total: 0,
    };
    cart.subscriptions = [];
    // calculate subTotal
    cart.items.forEach((one) => {
      if (!one.price || !one.quantity) {
        return;
      }
      if (one.isOneTimeCharge) {
        cart.onetime.subTotal += one.price * one.quantity;
      } else {
        if (one && one.salesModel && one.salesModel.subscription) {
          const subscriptionIdentifier = generateSubscriptionIdentifier(one.salesModel.subscription);
          let existedSubscription = cart.subscriptions.findIndex((one) => {
            return subscriptionIdentifier === one.identifier;
          });
          if (existedSubscription === -1) {
            cart.subscriptions.push({
              identifier: subscriptionIdentifier,
              ...one.salesModel.subscription,
              subTotal: 0,
              discount: 0,
              tax: 0,
              shipping: 0,
              total: 0,
            });
            existedSubscription = cart.subscriptions.length - 1;
          }

          cart.subscriptions[existedSubscription].subTotal += one.price * one.quantity;
        }
      }
    });

    // discount shouldn't be greater than subTotal
    // reset one time
    if (cart.onetime.subTotal < 0) {
      cart.onetime.subTotal = 0;
    }
    // reset subscriptions
    for (let subscription of cart.subscriptions) {
      if (subscription.subTotal < 0) {
        subscription.subTotal = 0;
      }
    }

    console.log(fn, 'done');
  };
};

module.exports = processEvent;
