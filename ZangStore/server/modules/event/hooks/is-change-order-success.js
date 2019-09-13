const ns = '[event.hooks.is-change-order-success]';
const logger = require('applogger');

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const { BadRequestError, InternalServerError } = require('../../error');
  const U = require('../../utils');
  const { OrderBackend } = require('../../../order/order.backend');
  const { isOrderProcessingCompleted } = require('../../../order/order.utils');
  const { ORDER_STATUS_FAILED, ORDER_STATUS_SUCCESS } = require('../../../order/order.constants');
  let order = context.order;

  logger.info(fn, 'started', 'order id=', order && order._id);
  if (!order) {
    return next(new BadRequestError('Cannot find order payload'));
  }

  U.P()
    .then(async() => {
      //FIX ME: Change order processing should not always be complete, since Kazoo is only change order it it simplified for now
      if (true) {
        try { // update the order as success
          await OrderBackend.setOrderStatus(order, ORDER_STATUS_SUCCESS, context, true);
        } catch (err1) {
          logger.error(fn, 'Error1:', err1);
        }
      } else {
        throw new InternalServerError('order not completed successfully');
      }
    })
    .then(() => {
      next();
    })
    .catch(async(err) => {
      logger.error(fn, 'Error:', err);

      try { // update the order as failed
        await OrderBackend.setOrderStatus(order, ORDER_STATUS_FAILED, context, true);
      } catch (err2) {
        logger.error(fn, 'Error2:', err2);
      }

      next(err);
    });
};

module.exports = processEvent;
