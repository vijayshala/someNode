const ns = '[event.hooks.calculate-purchased-plan-subscriptions-tax]';
const logger = require('applogger');

const { BadRequestError, InternalServerError } = require('../../error');

/**
 * FIXME: this should be removed to optimize the after ordering process
 *
 * We should create a unique tax processing ID before ordering, when calculating cart tax.
 * So we don't need to calculate again.
 */

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const U = require('../../utils');
  const { PurchasedPlanBackend } = require('../../../purchased-plan/purchased-plan.backend');
  const { OrderBackend } = require('../../../order/order.backend');
  const { ORDER_STATUS_FAILED } = require('../../../order/order.constants');
  let purchasedPlan = context.purchasedPlan;
  logger.info(fn, 'started', 'purchased plan id=', purchasedPlan && purchasedPlan._id);
  if (!purchasedPlan) {
    return next(new BadRequestError('Cannot find purchased plan payload'));
  }

  if (!purchasedPlan.billingAddress ||
    !purchasedPlan.billingAddress.address1 ||
    !purchasedPlan.billingAddress.city ||
    !purchasedPlan.billingAddress.zip ||
    !purchasedPlan.billingAddress.country) {
    // return next(new BadRequestError('Billing address, city, state, zip, or country is missing'));
    // ignore errors here, and leave it to validation rules
    logger.info(fn, 'skipped - no billing information');
    return next();
  }

  let region = (context.currentRegion.countryISO ? context.currentRegion.countryISO : 'USA');
  let gateway = (region == 'DE' ? 'NATIVE' : 'AVALARA')
  let taxCodes = context.currentRegion.taxCodes;

  let req = {
    requestId: context.requestId,
    userInfo: context.user,
  };
  const options = {
    requestId: context.requestId,
  };
  const billingAddress = {
    street: purchasedPlan.billingAddress.address1,
    city: purchasedPlan.billingAddress.city,
    state: purchasedPlan.billingAddress.state,
    zip: purchasedPlan.billingAddress.zip,
    country: purchasedPlan.billingAddress.country
  };
  const shippingAddress = {
    street: purchasedPlan.shippingAddress.address1,
    city: purchasedPlan.shippingAddress.city,
    state: purchasedPlan.shippingAddress.state,
    zip: purchasedPlan.shippingAddress.zip,
    country: purchasedPlan.shippingAddress.country
  };
  const company = {
    isIncorporated: purchasedPlan.company.isIncorporated
  };
  let taxableItems;

  U.P()
    .then(() => {
      const { PrepareItems } = require('../../../billing/Tax');
      
      taxableItems = PrepareItems(purchasedPlan, context);
    })
    .then(async() => {
      logger.info(fn, 'calculate purchased plan subscriptions tax started', JSON.stringify(taxableItems));

      const { CalculateTax } = require('../../../billing/Tax');

      const updates = {};

      //calculate recurring tax
      for (let subscriptionId in taxableItems) {
        if (taxableItems[subscriptionId].length > 0) {
          const recurringTax = await CalculateTax(req, billingAddress, shippingAddress, taxableItems[subscriptionId], company.isIncorporated, `${subscriptionId}_purchasedplan.subscriptions`, gateway, taxCodes);
          logger.info(fn, `recurring tax "${subscriptionId}" result`, JSON.stringify(recurringTax));

          // update taxItems
          for (let subscriptionIndex in purchasedPlan.subscriptions) {
            if ('' + purchasedPlan.subscriptions[subscriptionIndex]._id === subscriptionId) {
              let taxDetails = []
              for (let tti in recurringTax.taxTypes) {
                const tt = recurringTax.taxTypes[tti];
                taxDetails.push({
                  title: {
                    text: tt.name,
                  },
                  tid: tti,
                  amount: tt.tax,
                });
              }
              updates[`subscriptions.${subscriptionIndex}.taxDetails`] = taxDetails;
            }
          }
        }
      }

      // update purchased plan with tax items detail
      logger.info(fn, `updating purchased plan ${purchasedPlan._id}...`, JSON.stringify(updates));
      await PurchasedPlanBackend.findOneAndUpdate({
        _id: purchasedPlan._id
      }, {
        $set: updates
      }, options);

      logger.info(fn, 'calculate purchased plan subscriptions tax done');
    })
    .then(async() => {
      // reload purchased plan
      context.purchasedPlan = await PurchasedPlanBackend.findOneById(purchasedPlan._id, options);
    })
    .then(() => {
      next();
    })
    .catch(async(err) => {
      logger.error(fn, 'Error:', err);

      try { // update the order as failed
        await OrderBackend.setOrderStatus(context.order, ORDER_STATUS_FAILED, context);
      } catch (err2) {
        logger.error(fn, 'Error2:', err);
      }

      next(err);
    });
};

module.exports = processEvent;
