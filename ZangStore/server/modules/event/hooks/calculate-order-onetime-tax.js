const ns = '[event.hooks.calculate-order-onetime-tax]';
const logger = require('applogger');

const { BadRequestError, InternalServerError } = require('../../error');

/**
 * FIXME: this should be removed to optimize the after ordering process
 *
 * We should create a unique tax processing ID before ordering, when calculating cart tax.
 * So we don't need to calculate again.
 */

const PrepareItems = (order, context) => {
  const fn = `[${context.requestId}]${ns}[PrepareItems]`;
  let onetime = [];

  if (order && order.items && order.items.length > 0) {
    order.items.forEach((item) => {
      if (!item.price || !item.quantity) {
        return;
      }

      const sku = item.references && item.references.sku;

      if (!sku) {
        if (order.region != 'DE') {
          logger.error(fn, `Order item (${item.identifier}) doesn't have product code`);
          throw new InternalServerError('Order item doesn\'t have product code');
        }
      }

      if (item.isOneTimeCharge) {
        onetime.push({
          sku: sku,
          price: item.price,
          quantity: item.quantity,
          isDiscount: item.price < 0,
        });
      }
    });
  } else {
    logger.info(fn, 'Order is empty');
  }

  return onetime;
};

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const U = require('../../utils');
  const { OrderBackend } = require('../../../order/order.backend');
  const { ORDER_STATUS_FAILED } = require('../../../order/order.constants');
  let order = context.order;

  logger.info(fn, 'started', 'order id=', order && order._id);
  if (!order) {
    return next(new BadRequestError('Cannot find order payload'));
  }

  if (!order.billingAddress ||
    !order.billingAddress.address1 ||
    !order.billingAddress.city ||
    !order.billingAddress.zip ||
    !order.billingAddress.country) {
    // return next(new BadRequestError('Billing address, city, state, zip, or country is missing'));
    // ignore errors here, and leave it to validation rules
    logger.info(fn, 'skipped - no billing information');
    return next();
  }

  let region = (context.currentRegion ? context.currentRegion.countryISO : 'USA');
  let gateway = (region == 'DE' ? 'NATIVE' : 'AVALARA')
  let taxCodes = (context.currentRegion ? context.currentRegion.taxCodes : undefined);

  logger.info(fn, 'Current Region One Time: ', context.currentRegion);

  let req = {
    requestId: context.requestId,
    userInfo: context.user,
  };
  const options = {
    requestId: context.requestId,
  };
  const billingAddress = {
    street: order.billingAddress.address1,
    city: order.billingAddress.city,
    state: order.billingAddress.state,
    zip: order.billingAddress.zip,
    country: order.billingAddress.country
  };
  const shippingAddress = {
    street: order.shippingAddress.address1,
    city: order.shippingAddress.city,
    state: order.shippingAddress.state,
    zip: order.shippingAddress.zip,
    country: order.shippingAddress.country
  };
  const company = {
    isIncorporated: order.company.isIncorporated
  };
  let taxableItems;

  U.P()
    .then(() => {
      taxableItems = PrepareItems(order, context);
    })
    .then(async() => {
      logger.info(fn, 'calculate onetime tax started', JSON.stringify(taxableItems));

      const { CalculateTax } = require('../../../billing/Tax');

      const updates = {};

      //calculate one time tax
      if (taxableItems.length > 0) {
        const oneTimeTax = await CalculateTax(req, billingAddress, shippingAddress, taxableItems, company.isIncorporated, `${order._id}_order`, gateway, taxCodes);
        logger.info(fn, 'one time tax result', JSON.stringify(oneTimeTax));

        // update taxDetails
        let taxDetails = []
        for (let tti in oneTimeTax.taxTypes) {
          const tt = oneTimeTax.taxTypes[tti];
          taxDetails.push({
            title: {
              text: tt.name,
            },
            tid: tti,
            amount: tt.tax,
          });
        }
        updates['onetime.taxDetails'] = taxDetails;
      }

      // update order with tax items detail
      logger.info(fn, `updating order ${order._id}...`, JSON.stringify(updates));
      await OrderBackend.findOneAndUpdate({
        _id: order._id
      }, {
        $set: updates
      }, options);

      logger.info(fn, 'calculate order onetime tax done');
    })
    .then(async() => {
      // reload order
      context.order = await OrderBackend.findOneById(order._id, options);
    })
    .then(() => {
      next();
    })
    .catch(async(err) => {
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
