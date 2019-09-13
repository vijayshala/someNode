const ns = '[event.hooks.empty-cart]';
const logger = require('applogger');

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const { BadRequestError } = require('../../error');
  const U = require('../../utils');
  const { OrderBackend } = require('../../../order/order.backend');
  const { ORDER_STATUS_FAILED } = require('../../../order/order.constants');
  let order = context.order;

  logger.info(fn, 'started', 'order id=', order && order._id);
  if (!order) {
    return next(new BadRequestError('Cannot find order payload'));
  }

  const options = {
    requestId: context.requestId,
    region: order.region
  };

  U.P()
    .then(async() => {
      const { CartBackend } = require('../../../cart/cart.backend');

      const result = await CartBackend.removeByUser(context.user, options);

      logger.info(fn, 'empty cart done', result);
    })
    .then(() => {
      next();
    })
    .catch(async(err) => {
      logger.error(fn, 'Error:', err);
      next(err);
    });
};

module.exports = processEvent;
