const ns = '[kazoo][event-hooks][unprovision]';
const logger = require('applogger');
const util = require('util');

const config = require('../../../config');
const { PRODUCT_ENGINE_NAME } = require('../constants');

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const U = require('../../modules/utils');
  const {
    cartHasProductsOf,
    findCartItemContext,
  } = require('../../modules/cart-salesmodel-rules/utils');
  const { PurchasedPlanBackend } = require('../../purchased-plan/purchased-plan.backend');

  let purchasedPlan = context.purchasedPlan;
  const kazooItemIndexes = purchasedPlan && cartHasProductsOf(purchasedPlan, PRODUCT_ENGINE_NAME);

  logger.info(fn, 'started', 'purchased plan id=', purchasedPlan && purchasedPlan._id);
  if (purchasedPlan && !kazooItemIndexes) {
    logger.info(fn, `No "${PRODUCT_ENGINE_NAME}" product found in purchased plan, skipped`);
    return next();
  }

  const kazooItemIndex = kazooItemIndexes[0];
  logger.info(fn, 'kazooItemIndex=', kazooItemIndex);
  const kazooItem = purchasedPlan.items[kazooItemIndex];
  logger.info(fn, 'kazooItem=', kazooItem && kazooItem.identifier);

  let progress = kazooItem && kazooItem.metadata && kazooItem.metadata.kazoo || {};

  let updates = {};

  let req = {
    requestId: context.requestId,
    userInfo: context.user,
  };
  const options = {
    requestId: context.requestId,
  };

  U.P()
    .then(async()  =>  {
      if (!progress.account_id)    {
        return;
      }
      const { UpdateAccount } = require('../models/kazoo.backend');
      const { PROVISION_STATUS_DISABLED } = require('../constants');

      const data = {
        enabled: false
      };

      const result = await UpdateAccount(progress.account_id, data, options);

      progress.account = result && result.data;

      updates[`items.${kazooItemIndex}.metadata.kazoo.account`] = progress.account;

      updates[`items.${kazooItemIndex}.metadata.provisionStatus`] = PROVISION_STATUS_DISABLED;

      logger.info(fn, 'Kazoo account disabled');
    })
    .then(async()  =>  {
      if (!progress.account_id) {
        return;
      }
      const { triggerUnprovisionKazoo } = require('../utils');

      const data = {
        purchasedPlanId: purchasedPlan._id,
        account_id: config.environment == 'production' ? null : progress.account_id
      };

      await triggerUnprovisionKazoo(options, data);
    })
    .then(async() =>  {
      await PurchasedPlanBackend.findOneAndUpdate({
        _id: purchasedPlan._id
      }, {
        $set: updates
      }, options);
    })
    .then(() => {
      next();
    })
    .catch((err) => {
      logger.error(fn, 'Error:', err);
      next();
    });
};

module.exports = processEvent;
