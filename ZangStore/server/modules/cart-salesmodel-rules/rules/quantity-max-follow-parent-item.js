const ns = '[cart-salesmodel-rules][rules][quantity-max-follow-parent-item]';

/**
 * This rule makes sure the item's quantity does not exceed parent quantity
 *
 * @param {String}  identifier         required, add item with this identifier
 * @param {String}  quantityTag        optional, find total quantity of the items with this tag
 * @param {Boolean} copyReference      optional, if copy the reference from the item which this rule is defined
 * @param {Mixed}   extraReferences    optional, setup extra references to help in following validation/provisioning, etc
 */
const processEvent = function(params) {
  // params suppose to have itemIndex, parameters
  const ruleOnItem = params && params.item;

  return function(context) {
    const _this = this;
    const fn = `${ns}[processEvent]`;
    const event = context.event;
    const { ErrorMessage, SALESMODELRULES } = require('../../error');
  
    console.log(fn, `start (ruleOnItem=${ruleOnItem.identifier})`);
    let cart = context.cart;
    let foundItems = cart.items.filter((item) => {
      return item.offer && item.offer.identifier == ruleOnItem.offer.identifier
        && item.salesModel && item.salesModel.identifier == ruleOnItem.salesModel.identifier
        && item.salesModelItem && item.salesModelItem.identifier == ruleOnItem.salesModelItem.identifier
        && !item.attribute
    });
    if (foundItems.length) {
      let parent = foundItems[0];
      if (parent.quantity < ruleOnItem.quantity) {
        console.warn(fn, 'item quantity larger than parent', {
          parent,
          ruleOnItem, 
          parentQty: parent.quantity,
          qty: ruleOnItem.quantity
        } )
        ruleOnItem.quantity = parent.quantity;
      }
    }
    console.log(fn, 'done');
  };
};

module.exports = processEvent;