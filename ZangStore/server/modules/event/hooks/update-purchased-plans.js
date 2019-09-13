const ns = '[event.hooks.update-purchased-plans]';
const logger = require('applogger');

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const { BadRequestError } = require('../../error');
  const U = require('../../utils');
  const userId = context.user && (context.user._id || context.user.userId);
  const order = context.order;
  const { OrderBackend } = require('../../../order/order.backend');
  const { ORDER_STATUS_FAILED } = require('../../../order/order.constants');
  const { PurchasedPlanBackend } = require('../../../purchased-plan/purchased-plan.backend');
  const { findCartItemByIdentifier } = require('../../cart-salesmodel-rules/utils');

  logger.info(fn, 'started', 'order id=', order && order._id);
  if (!order) {
    return next(new BadRequestError('Cannot find order payload'));
  }

  const options = {
    requestId: context.requestId,
  };

    const purchasedPlan = context.purchasedPlan;

    logger.info(fn, 'Purchased plan exists (change order), do not create new purchased-plan');

    let updates = {}, newItems = [];

    U.P()
    .then(async() =>  {
        //make changes to purchased plan
        if (order.items)    {
            for (let item of order.items) {
                const purchasedPlanItem = findCartItemByIdentifier(purchasedPlan, item.identifier);

                if (purchasedPlanItem)  {
                    updates[`items.${purchasedPlanItem.index}.quantity`] = purchasedPlanItem.item.quantity + item.quantity;
                } else {
                    newItems.push(item);
                }
            }
        }
    })
    .then(async() =>  {
        await PurchasedPlanBackend.findOneAndUpdate({
            _id: purchasedPlan._id
        }, {
            $set: updates
        }, options);

        await PurchasedPlanBackend.findOneAndUpdate({
            _id: purchasedPlan._id
        }, {
            $push: {
                orderIds: order._id,
                items: {
                    $each: newItems
                }
            }
        }, options);
    })
    .then(()  =>  {
        logger.info(fn, 'added orderId=', order._id, ' to purchased-plan');
        return next();
    }).catch(async(err) => {
        logger.error(fn, 'Error:', err);

        try { // update the order as failed
            await OrderBackend.setOrderStatus(order, ORDER_STATUS_FAILED, context);
        } catch (err2) {
            logger.error(fn, 'Error2:', err);
        }

        next(err);
    });
};

module.exports = processEvent;
