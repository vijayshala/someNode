const logger = require('applogger');

const { CartBackend } = require('../../cart/cart.backend');

const initCart = async(options) => {
  const fn = `[initCart]`;
  const collection = 'cart';
  options = Object.assign({
    // emptyCollection: true,
  }, options);

  if (options.emptyCollection) {
    logger.info(fn, `empty ${collection}s collection...`);
    //TODO: we need to add logic to remove cart items that are invalidated, instead of removing the cart
    await CartBackend.remove();
  }
};

module.exports = initCart;
