const ns = '[cart-salesmodel-rules][rules][quantity-based-price]';

const { findCartItemContext } = require('../utils');

/**
 * This rules allows the SalesModel defines a price table based on total quantity of
 * selected products. The SalesModels can be just the item where the rule is applied, or
 * all SalesModels with specified tag.
 *
 * @param  {String} tag     optional, aggregate quantities based on this tag
 * @param  {Array}  prices  required. define the price table array in this format:
 *                          [{
 *                             minQuantity:        minimum quantity
 *                             maxQuantity:        maximum quantity
 *                             price:              exact new price
 *                             discountPecentage:  apply a discount percentage on REGULAR price
 *                             references:         if updating cart item references
 *                          }]
 *                          All quantities which cannot find match in the price table will be
 *                          treated to use REGULAR price.
 */
const processEvent = function(params) {
  // params suppose to have itemIndex, parameters
  const ruleOnItem = params && params.item;
  const parameters = params && params.parameters;

  return function(context) {
    const fn = `${ns}[processEvent]`;

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
    // const ruleOnItem = cart && cart.items && cart.items[itemIndex];
    const itemLevel = ruleOnItem && ruleOnItem.level;
    const itemIdentifier = ruleOnItem && ruleOnItem.identifier;
    console.log(fn, `working on ${itemIdentifier} of level ${itemLevel}...`);
    const ruleOnItemContext = findCartItemContext(ruleOnItem);

    // calculate total quantity
    let totalQuantity = 0;
    for (let ci in cart.items) {
      let item = cart.items[ci];
      if (item.level >= itemLevel) {
        const itemContext = findCartItemContext(item);

        if (parameters && parameters.tag) {
          // remove all items with defined tag
          const tags = itemContext && itemContext.tags;
          if (tags && tags.indexOf(parameters.tag) > -1) {
            totalQuantity += item.quantity || 0;
          }
        } else {
          // remove all items with similar identifier
          if (item.identifier === itemIdentifier) {
            totalQuantity += item.quantity || 0;
          }
        }
      }
    }
    console.log(fn, `total quantity: ${totalQuantity}`);

    // calculate new price
    let regularPrice = ruleOnItemContext && ruleOnItemContext.regularPrice;
    let newPrice = null,
      newReferences = null;

    if (parameters && parameters.prices && Array.isArray(parameters.prices)) {
      for (let priceLine of parameters.prices) {
        let match = true;
        if (priceLine.minQuantity && totalQuantity < priceLine.minQuantity) {
          match = false;
        }
        if (priceLine.maxQuantity && totalQuantity > priceLine.maxQuantity) {
          match = false;
        }

        if (match) {
          if (priceLine.price) {
            newPrice = priceLine.price;
          } else if (priceLine.discountPecentage && regularPrice) {
            newPrice = regularPrice * (1 - priceLine.discountPecentage);
          } else if (priceLine.priceQuantityOnetoTone)  {
            newPrice = regularPrice * totalQuantity;
          }
          newReferences = priceLine.references;
          break;
        }
      }
    }

    console.log(fn, `estimate price: ${newPrice}`);
    if (newPrice && ruleOnItem) {
      ruleOnItem.price = newPrice;
      if (newReferences) {
        console.log(fn, `update references:`, newReferences);
        ruleOnItem.references = { ...ruleOnItem.references, ...newReferences };
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
