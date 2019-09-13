const ns = '[cart-salesmodel-rules][rules][quantity-match-item]';

/**
 * This rule may add another cart item which match the condition
 *
 * @param {String}  identifier         required, add item with this identifier
 * @param {String}  quantityTag        optional, find total quantity of the items with this tag
 * @param {Boolean} copyReference      optional, if copy the reference from the item which this rule is defined
 * @param {Mixed}   extraReferences    optional, setup extra references to help in following validation/provisioning, etc
 */
const processEvent = function(params) {
  // params suppose to have itemIndex, parameters
  const ruleOnItem = params && params.item;
  const parameters = params && params.parameters;
  const paramQuantityTag = parameters && parameters.quantityTag;

  return function(context) {
    const _this = this;
    const fn = `${ns}[processEvent]`;
    const event = context.event;
    const { ErrorMessage, SALESMODELRULES } = require('../../error');
    const { findCartItemsBySalesModelAndTags } = require('../utils');

    const parametersJson = JSON.stringify(parameters);
    console.log(fn, `start (ruleOnItem=${ruleOnItem.identifier}, parameters=${parametersJson})`);
    // context suppose to have event, cart
    // console.log(fn, 'context:', JSON.stringify(context));
    // console.log(fn, 'cart items:', context.cart.items.map((one) => {
    //   return {
    //     identifier: one.identifier,
    //     sku: one.references && one.references.sku,
    //     price: one.price,
    //     quantity: one.quantity,
    //   };
    // }));

    let cart = context.cart;
    // const ruleOnItem = cart.items[itemIndex];
    // const itemQuantity = ruleOnItem && ruleOnItem.quantity;

    // if (!itemQuantity) {
    //   console.log(fn, 'item quantity is 0, skipped');
    //   return;
    // }

    let newItemQuantity = 1;
    if (paramQuantityTag) {
      const itemsWithQuantityTag = findCartItemsBySalesModelAndTags(cart, ruleOnItem.salesModel.identifier, paramQuantityTag);
      newItemQuantity = itemsWithQuantityTag.reduce((sum, one) => sum + (one.quantity || 0), 0);
      console.log(fn, `total quantity of tag ${paramQuantityTag}: ${newItemQuantity}`);
    }

    console.log(fn, `new quantity: ${newItemQuantity}`);
    if (newItemQuantity && ruleOnItem) {
      ruleOnItem.quantity = newItemQuantity;
    }

    console.log(fn, 'done');
  };
};

module.exports = processEvent;
