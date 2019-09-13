const ns = '[cart-salesmodel-rules][rules][universal-adjust-discount-price]';

const { findCartItemContext } = require('../utils');

/**
 * This rule will update price for discount line items
 */

const processEvent = function(params) {
  return function(context) {
    const _this = this;
    const fn = `${ns}[processEvent]`;
    const event = context.event;
    const { ErrorMessage, SALESMODELRULES } = require('../../error');
    const { findCartItemsBySalesModelAndTags } = require('../utils');

    console.log(fn, 'started');

    let cart = context.cart;

    for (let item of cart.items) {
      if (!item.price || !item.quantity) {
        continue;
      }
      const itemContext = findCartItemContext(item);
      const title = (item.title && item.title.text) || item.identifier;

      const itemTags = itemContext && itemContext.tags;
      const maxDiscountAmountTag = item && item.references && item.references.maxDiscountAmountTag;
      if (!itemTags || itemTags.indexOf('discount') === -1) {
        continue;
      }
      if (!maxDiscountAmountTag) {
        // nothing to do at this stage
        continue;
      }

      const currentDiscount = (item.price || 0) * (item.quantity || 0);
      console.log(fn, 'current discount:', currentDiscount);

      const discountOnItems = findCartItemsBySalesModelAndTags(cart, item.salesModel.identifier, maxDiscountAmountTag);
      const maxDiscount = -1 * discountOnItems.reduce((sum, one) => sum + ((one.price || 0) * (one.quantity || 0)), 0);
      console.log(fn, `max discount from tag "${maxDiscountAmountTag}":`, maxDiscount);

      if (currentDiscount < maxDiscount) {
        item.quantity = 1;
        item.price = maxDiscount;

        console.log(fn, `"${title}" discount is changed from ${currentDiscount} to ${maxDiscount}`);
        _this.info(event, new ErrorMessage(fn, SALESMODELRULES.DISCOUNT_AUTO_ADJUSTED, {
          text: `"${title}" discount is changed from ${currentDiscount} to ${maxDiscount}`,
          resource: ['SALESMODELRULE.DISCOUNT_AUTO_ADJUSTED', title, currentDiscount, maxDiscount],
        }, item.identifier));
      } else {
        console.log(fn, 'discount amount is ok');
      }
    }

    console.log(fn, 'done');
  };
};

module.exports = processEvent;
