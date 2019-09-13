const ns = '[cart-salesmodel-rules][rules][universal-remove-0qty-items]';

/**
 * This rule will remove all items and their belongs which quantity is 0.
 */

const processEvent = function(params) {
  return function(context) {
    const fn = `${ns}[processEvent]`;

    console.log(fn, 'started');

    let cart = context.cart;
    let count = 0;

    // set children items quantity to 0 if parent is 0
    let lastIdentifier = '';
    for (let ci in cart.items) {
      let item = cart.items[ci];

      if (lastIdentifier && item.identifier.substr(0, lastIdentifier.length) === lastIdentifier) {
        item.quantity = 0;
      } else {
        if (!item.quantity) {
          lastIdentifier = item.identifier;
        }
      }
    }
    // remove items quantity is zero
    cart.items = cart.items.filter((one) => {
      if (!one.quantity) {
        count++;
      }
      return one.quantity;
    });

    console.log(fn, `${count} item(s) removed`);
  };
};

module.exports = processEvent;
