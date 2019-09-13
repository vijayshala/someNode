const ns = '[CartMiddleware]'
import logger from 'applogger'
const { CartBackend } = require('../server/cart/cart.backend');
import Utils from '../common/Utils'

module.exports = async (req, res, next) => {
  const fn = `[${req.requestId}]${ns}[getCart]`;
  const user = req.userInfo;
  // logger.info(fn, 'user:', user);

  try {
    if (!user) {
      // FIXME: this should be handled by middleware
      // throw new UnauthorizedError();
      return next();
    }
    let region = req.region;
    logger.info(ns, 'region', region)
    //region has to be defined
    if (region) {
      let cart = await CartBackend.findByUser(user, {
        requestId: req.requestId,
        localizer: req.localizer,
        region: region
      });
      logger.info(ns, 'cart region items:', cart.items.length);
      req.cart = cart;
      res.locals.cart = cart;
    }
    else {
      logger.info(ns, 'no region')
    }


  } catch (error) {
    logger.warn(fn, error);
  }
  next();


};
