const ns = '[cart-salesmodel-rules][rules][universal-update-currency]';

/**
 * This rule will update cart currency based on the currency of first cart item.
 */

const processEvent = function(params) {
  return function(context) {
    const _this = this;
    const fn = `${ns}[processEvent]`;
    const event = context.event;
    const { ErrorMessage, SALESMODELRULES } = require('../../error');

    console.log(fn, 'started');

    let cart = context.cart;

    // find order currency
    for (let ci in cart.items) {
      let item = cart.items[ci];

      if (item.salesModel && item.salesModel.currency) {
        if (!cart.currency) {
          cart.currency = item.salesModel.currency;
          console.log(fn, 'find currency', item.salesModel.currency);
        } else if (cart.currency !== item.salesModel.currency) {
          item.quantity = 0;
          _this.error(event, new ErrorMessage(fn, SALESMODELRULES.NOT_SAME_CURRENCY, {
            text: `Cannot add item with ${item.salesModel.currency} currency to cart with ${cart.currency} currency`,
            resource: ['SALESMODELRULE.NOT_SAME_CURRENCY', item.salesModel.currency, cart.currency],
          }));
        }
      }
    }

    console.log(fn, 'done');
  };
};

module.exports = processEvent;
