const ns = '[cart-salesmodel-rules][rules][remove-other-items]';

const { findCartItemContext } = require('../utils');

/**
 * This rule may remove other cart items which doesn't match the condition
 *
 * If provided parameters.tag, then all items in same level and match the tag
 * will be removed except for the item whiere the rule is defined.
 *
 * If no parameters.tag defined, then all other items in same level will be
 * removed except for the item whiere the rule is defined.
 *
 * @param {String}  tag         optional, remove items based on this tag
 * @param {Boolean} hideFromUI  optional, if also set "hideFromUI" for salesModel mapping.
 *                              This only takes effect if "tag" parameter is set.
 */
const processEvent = function(params) {
  // params suppose to have itemIndex, parameters
  const itemIndex = params && params.itemIndex;
  const ruleOnItem = params && params.item;
  const parameters = params && params.parameters;
  const paramTag = parameters && parameters.tag;
  const paramHideFromUI = paramTag && parameters.hideFromUI;

  return function(context) {
    const _this = this;
    const fn = `${ns}[processEvent]`;
    const event = context.event;
    const { ErrorMessage, SALESMODELRULES } = require('../../error');

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
    const itemQuantity = ruleOnItem && ruleOnItem.quantity;
    const itemLevel = ruleOnItem && ruleOnItem.level;
    const itemIdentifier = ruleOnItem && ruleOnItem.identifier;

    if (itemQuantity) {
      for (let ci in cart.items) {
        let item = cart.items[ci];
        if (item.level >= itemLevel) {
          const itemContext = findCartItemContext(item);
          const title = (itemContext && itemContext.title && itemContext.title.text) || (itemContext && itemContext.identifier) || `cart item ${itemIndex}`;

          if (paramTag) {
            // remove all items with defined tag
            const tags = itemContext && itemContext.tags;
            if (tags && tags.indexOf(paramTag) > -1 && item.identifier !== itemIdentifier) {
              console.log(fn, `"${title}" is removed`);
              _this.info(event, new ErrorMessage(fn, SALESMODELRULES.REMOVE_OTHER_ITEMS, {
                text: `"${title}" is removed`,
                resource: ['SALESMODELRULE.REMOVE_OTHER_ITEMS', title],
              }, item.identifier));
              item.quantity = 0;
            }
          } else {
            // remove all items with similar identifier
            if (item.identifier !== itemIdentifier) {
              console.log(fn, `"${title}" is removed`);
              _this.info(event, new ErrorMessage(fn, SALESMODELRULES.REMOVE_OTHER_ITEMS, {
                text: `"${title}" is removed`,
                resource: ['SALESMODELRULE.REMOVE_OTHER_ITEMS', title],
              }, item.identifier));
              item.quantity = 0;
            }
          }
        }
      }
    }

    if (paramHideFromUI) {
      const salesModelMapping = context.CSMRH && context.CSMRH.salesModelMapping;
      const tagHide = 'hide';
      const hide = !!itemQuantity;

      console.log(fn, `find siblings of "${itemIdentifier}" with tag "${paramTag}"`);
      const siblingsWithTag = salesModelMapping.getSiblingsSync(itemIdentifier, paramTag);

      for (let key in siblingsWithTag) {
        const loc = siblingsWithTag[key].tags.indexOf(tagHide);
        if (hide) {
          if (loc === -1) {
            siblingsWithTag[key].tags.push(tagHide);
          }
        } else {
          if (loc > -1) {
            siblingsWithTag[key].tags.splice(loc, 1);
          }
        }
        console.log(fn, `${key} updated tags:`, siblingsWithTag[key].tags);
      }
    }

    // console.log(fn, 'cart items after adjustment:', context.cart.items.map((one) => {
    //   return {
    //     identifier: one.identifier,
    //     sku: one.references && one.references.sku,
    //     price: one.price,
    //     quantity: one.quantity,
    //   };
    // }));

    console.log(fn, 'done');
  };
};

module.exports = processEvent;
