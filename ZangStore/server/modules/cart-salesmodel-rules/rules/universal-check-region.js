const ns = '[cart-salesmodel-rules][rules][universal-check-region]';

/**
 * This rule will update cart region based on the first allowed_region of first cart item.
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

      if (item.salesModel && item.salesModel.allowed_regions && item.salesModel.allowed_regions.length) {
        if (!cart.region) {
          cart.region = item.salesModel.allowed_regions[0];
          console.log(fn, 'find regions', item.salesModel.allowed_regions);
        } else if (item.salesModel.allowed_regions.indexOf(cart.region) === -1) {
          item.quantity = 0;
          _this.error(event, new ErrorMessage(fn, SALESMODELRULES.NOT_SAME_REGION, {
            text: `Cannot add item with ${item.salesModel.allowed_regions} regions to cart with ${cart.region} region`,
            resource: ['SALESMODELRULE.NOT_SAME_REGION', item.salesModel.allowed_regions, cart.region],
          }));
        }
      } else {
        _this.error(event, new ErrorMessage(fn, SALESMODELRULES.INVALID_PARAMETER, {
            text: `Cannot add item with ${item.salesModel.allowed_regions} no regions to cart`,
            resource: ['SALESMODELRULE.INVALID_PARAMETER'],
        }));
      }
    }

    console.log(fn, 'done');
  };
};

module.exports = processEvent;
