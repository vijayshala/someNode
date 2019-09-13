const ns = '[cart-salesmodel-rules][rules][universal-quantity-restriction]';

const { findCartItemContext } = require('../utils');

/**
 * This rule checks if there is minQuantity, maxQuantity or followParentQuantity defined for the cart SalesModel item
 *
 * If there is, the rule will enforce it.
 */

const processEvent = function(params) {

  return function(context) {
    const _this = this;
    const fn = `${ns}[processEvent]`;
    const event = context.event;
    const { ErrorMessage, SALESMODELRULES } = require('../../error');

    console.log(fn, `start`);
    // context suppose to have event, cart
    // console.log(fn, 'context:', JSON.stringify(context));

    let cart = context.cart;

    let parent = null;
    for (let ci in cart.items) {
      let item = cart.items[ci];
      if (!item.quantity) {
        continue;
      }

      const itemContext = findCartItemContext(item);
      const title = (item.title && item.title.text) || item.identifier || `cart item ${ci}`;

      if (itemContext.minQuantity && (!item.quantity || item.quantity < itemContext.minQuantity)) {
        _this.info(event, new ErrorMessage(fn, SALESMODELRULES.QUANTITY_AUTO_ADJUSTED, {
          text: `"${title}" quantity is increased from ${item.quantity} to ${itemContext.minQuantity}`,
          resource: ['SALESMODELRULE.QUANTITY_AUTO_ADJUSTED', title, item.quantity, parent.quantity],
        }, item.identifier));
        item.quantity = itemContext.minQuantity;
      }
      if (itemContext.maxQuantity && (!item.quantity || item.quantity > itemContext.maxQuantity)) {
        _this.info(event, new ErrorMessage(fn, SALESMODELRULES.QUANTITY_AUTO_ADJUSTED, {
          text: `"${title}" quantity is decreased from ${item.quantity} to ${itemContext.maxQuantity}`,
          resource: ['SALESMODELRULE.QUANTITY_AUTO_ADJUSTED', title, item.quantity, parent.quantity],
        }, item.identifier));
        item.quantity = itemContext.maxQuantity;
      }
      if (itemContext.followParentQuantity) {
        const parent = cart.items.find((one) => {
          if (item.level > 0 && one.level === item.level - 1) {
            if (item.identifier.indexOf(one.identifier + '..') === 0) {
              return true;
            }
          }

          return false;
        });
        if (parent && item.quantity !== parent.quantity) {
          _this.info(event, new ErrorMessage(fn, SALESMODELRULES.QUANTITY_AUTO_ADJUSTED, {
            text: `"${title}" quantity is adjusted from ${item.quantity} to ${parent.quantity} to match parent`,
            resource: ['SALESMODELRULE.QUANTITY_AUTO_ADJUSTED', title, item.quantity, parent.quantity],
          }, item.identifier));
          item.quantity = parent.quantity;
        }
      }
    }

    console.log(fn, 'done');
  };
};

module.exports = processEvent;
