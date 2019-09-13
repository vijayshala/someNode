const ns = '[zang-spaces][event-hooks][unprovision]';
const logger = require('applogger');
const util = require('util');

const config = require('../../../config');
const { PRODUCT_ENGINE_NAME } = require('../constants');
const { nonBlockify } = require('../../modules/utils');

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const U = require('../../modules/utils');
  const {
    cartHasProductsOf,
    findCartItemContext,
  } = require('../../modules/cart-salesmodel-rules/utils');

  let purchasedPlan = context.purchasedPlan;
  const spacesItemIndexes = purchasedPlan && cartHasProductsOf(purchasedPlan, PRODUCT_ENGINE_NAME);

  logger.info(fn, 'started', 'purchased plan id=', purchasedPlan && purchasedPlan._id);
  if (purchasedPlan && !spacesItemIndexes) {
    logger.info(fn, `No "${PRODUCT_ENGINE_NAME}" product found in purchased plan, skipped`);
    return next();
  }

  const spacesItemIndex = spacesItemIndexes[0];
  logger.info(fn, 'spacesItemIndex=', spacesItemIndex);
  const spacesItem = purchasedPlan.items[spacesItemIndex];
  logger.info(fn, 'spacesItem=', spacesItem && spacesItem.identifier);

  let req = {
    requestId: context.requestId,
    userInfo: context.user,
  };
  const options = {
    requestId: context.requestId,
  };

  U.P()
    .then(async()  =>  {
      const { getActiveLicenses, createUpdateActiveLicense } = require('../../modules/zang-accounts');

      let parent = null;
      if (purchasedPlan.company && purchasedPlan.company.nid) {
        // company license
        parent = {
          parentid: purchasedPlan.company.nid,
          parent_type: 'company',
          parentType: 'companies',
          parent_displayname: purchasedPlan.company.name,
        };
      } else {
        // personal license
        parent = {
          parentid: purchasedPlan.company.nid, // FIXME: use user ID?
          parent_type: 'user',
          parentType: 'users',
          parent_displayname: [purchasedPlan.contact.lastName, purchasedPlan.contact.firstName].join(' '),
        };
      }

      const activeLicenses = await getActiveLicenses(req.requestId, parent.parent_type, parent.parentid, 'zangspaces');

      let spacesLicense = activeLicenses && activeLicenses[0];

      if (!spacesLicense || !spacesLicense.services)  {
        logger.warn(fn, 'spaces licenses not found');
        return;
      }

      const expireServices = nonBlockify((service) =>  {
        service.expiration = new Date();
      });

      for (let service of spacesLicense.services) {
        await expireServices(service);
      }

      await createUpdateActiveLicense(context.requestId, spacesLicense);
      
      logger.info(fn, 'expired spaces licenses');
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
