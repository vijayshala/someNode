const ns = '[kazoo][event-hooks][provisioning]';
const logger = require('applogger');
const util = require('util');

const config = require('../../../config');
const { ServerInternalError } = require('../../modules/error');
const { PRODUCT_ENGINE_NAME, PROVISION_STATUS_TRIGGERED } = require('../constants');

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const U = require('../../modules/utils');
  const { PurchasedPlanBackend } = require('../../purchased-plan/purchased-plan.backend');
  const _ = require('lodash');
  const {
    cartHasProductsOf,
    findCartItemContext,
  } = require('../../modules/cart-salesmodel-rules/utils');
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

  // let progress = kazooItem && kazooItem.metadata && kazooItem.metadata.kazoo || {};

  let req = {
    requestId: context.requestId,
    userInfo: context.user,
    baseUrl: context.baseUrl,
    region: context.currentRegion && context.currentRegion.countryISO
  };
  // const options = {
  //   requestId: context.requestId,
  // };

  //let updates = {};

  U.P()
    .then(async() => {
      const { triggerProvisionKazoo } = require('../utils');
      logger.info(fn, 'start provision kazoo')
      
      let data = {
        purchasedPlanId: purchasedPlan._id
      };

      await triggerProvisionKazoo(req, data);
    })
    // .then(async()  =>  {
    //   if (progress.account_id)    {
    //     return;
    //   }
    //   const { CreateAccount } = require('../models/kazoo.backend');
    //   const Utils = require('../../../common/Utils');

    //   const data = {
    //     accountName: `${purchasedPlan && purchasedPlan.company && purchasedPlan.company.name}_${Utils.generateRandomString(4)}`,
    //     timezone: 'Europe/Berlin',
    //     call_restriction: {
    //       germany_international: {
    //         action: 'inherit'
    //       },
    //       germany_premium:  {
    //         action: 'deny'
    //       },
    //       germany_special:  {
    //         action: 'deny'
    //       },
    //       germany_government: {
    //         action: 'inherit'
    //       },
    //       germany_social: {
    //         action: 'inherit'
    //       },
    //       germany_emergency:  {
    //         action: 'inherit' //DO NOT DISABLE THIS UNDER ANY CIRCUMSTANCE!!!
    //       },
    //       unknown:  {
    //         action: 'inherit'
    //       },
    //       germany_mobile: {
    //         action: 'inherit'
    //       }
    //     }
    //   };

    //   const result = await CreateAccount(data, options);

    //   progress.account_id = result.data.id;
    //   progress.account = result.data;

    //   updates[`items.${kazooItemIndex}.metadata.kazoo.account_id`] = progress.account_id;
    //   updates[`items.${kazooItemIndex}.metadata.kazoo.account`] = progress.account;
    // })
    // .then(async() =>  {
      // Disable for now since phone number not implemented on Kazoo
      // return;
      // if (progress.phoneNumber) {
      //   return;
      // }
      // const { BuyPhoneNumber } = require('../models/kazoo.backend');

      // const tagsToFind = {
      //   main: 'did-main',
      //   existing: 'did-existing',
      //   local: 'did-local',
      // };
      // let itemContextFound = null;
      // let did = null;
      // let isDidExisting = false;
      // let isDidTollfree = false;
      // let isDidLocal = false;
      // let itemFoundIndex = null;
      // for (let ci in purchasedPlan.items) {
      //   const item = purchasedPlan.items[ci];
      //   const itemContext = findCartItemContext(item);
      //   const tags = itemContext && itemContext.tags;
      //   const isKazoo = item && item.engines && item.engines.indexOf(PRODUCT_ENGINE_NAME) > -1;
      //   if (isKazoo && tags && tags.indexOf(tagsToFind.main) > -1) {
      //     itemFoundIndex = ci;
      //     itemContextFound = itemContext;
      //     did = itemContext.helper && itemContext.helper.number;
      //     isDidExisting = tags.indexOf(tagsToFind.existing) > -1;
      //     isDidLocal = tags.indexOf(tagsToFind.local) > -1;
      //     break;
      //   }
      // }

      // if (!did) {
      //   throw new Error('No phone number selected, this should have been caught by validation rule');
      // }

      // if (isDidLocal) {
      //   const result = await BuyPhoneNumber(progress.account_id, did, options);

      //   progress.phoneNumber = result;

      //   updates[`items.${kazooItemIndex}.metadata.kazoo.phoneNumber`] = progress.phoneNumber;
      // }
    // })
    // .then(async() =>  {
    //   purchasedPlan = await PurchasedPlanBackend.findOneAndUpdate({
    //       _id: purchasedPlan._id
    //   }, {
    //       $set: updates,
    //   }, {...options, new: true});

    //   updates = {};

    //   logger.info(fn, 'purchased plan metadata updated');
    // })
    // .then(async()   =>  {
    //   const kazooIdSent = kazooItem.metadata && kazooItem.metadata.kazooIdSent;
    //   if (kazooIdSent) {
    //     return;
    //   }
    //   const { SendOrderPayload } = require('../../billing/gsmb/gsmb.backend');

    //   await SendOrderPayload(purchasedPlan, options);

    //   updates[`items.${kazooItemIndex}.metadata.kazooIdSent`] = true;
    // })
    // .then(async() =>  {
    //   updates[`items.${kazooItemIndex}.metadata.provisionStatus`] = PROVISION_STATUS_TRIGGERED;

    //   purchasedPlan = await PurchasedPlanBackend.findOneAndUpdate({
    //       _id: purchasedPlan._id
    //   }, {
    //       $set: updates,
    //   }, options);
    // })
    .then(() => {
      next();
    })
    .catch((err) => {
      logger.error(fn, 'Error:', err);
      const { triggerProvisionFailedEmail } = require('../../modules/utils/index');

      triggerProvisionFailedEmail(req, {
        purchasedPlanId: purchasedPlan._id
      });
      next(err);
    });
};

module.exports = processEvent;
