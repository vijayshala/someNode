const ns = '[cart-salesmodel-rules][rules][universal-calculate-total]';

/**
 * This rule recalculates onetime and subscriptions subTotal and total.
 */

const processEvent = function(params) {
  return function(context) {
    const fn = `${ns}[processEvent]`;

    console.log(fn, 'started');

    let cart = context.cart;

    // calculate one time
    cart.onetime.total = cart.onetime.subTotal + cart.onetime.tax + cart.onetime.shipping;

    // calculate subscriptions
    for (let subscription of cart.subscriptions) {
      subscription.total = subscription.subTotal + subscription.tax + subscription.shipping;
    }

    console.log(fn, 'done');
  };
};

module.exports = processEvent;
