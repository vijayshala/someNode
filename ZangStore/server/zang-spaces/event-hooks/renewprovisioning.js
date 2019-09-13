const ns = '[zang-spaces][event-hooks][renewprovisioning]';
const logger = require('applogger');

const {
  PRODUCT_ENGINE_NAME,
  SPACES_LICENSETYPE_BASIC,
  SPACES_LICENSETYPES,
} = require('../constants');

const findLicenseByServiceType = (licenses, service_type) =>  {
  if (licenses && licenses.length) {
    for (let license of licenses) {
      if (license.service_type == service_type) {
        return license;
      }
    }
  }
};

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const U = require('../../modules/utils');
  const moment = require('moment');
  const { cartHasProductsOf } = require('../../modules/cart-salesmodel-rules/utils');
  const purchasedPlan = context.purchasedPlan;
  const spacesItemIndexes = purchasedPlan && cartHasProductsOf(purchasedPlan, PRODUCT_ENGINE_NAME);
  const user = context.user;
  const userId = user && (user.accountId || user._id || user.userId);

  logger.info(fn, 'started', 'purchased plan id=', purchasedPlan && purchasedPlan._id);
  if (purchasedPlan && !spacesItemIndexes) {
    logger.info(fn, `No "${PRODUCT_ENGINE_NAME}" product found in purchased plan, skipped`);
    return next();
  }

  const options = {
    requestId: context.requestId,
  };
  const progress = {
    licenses: [],
    maxExpirationDate: null,
  };
  let parent = null;

  U.P()
    .then(async() => {
      const { getActiveLicenses } = require('../../modules/zang-accounts');

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

      const accountsSpacesLicenses = await getActiveLicenses(options.requestId, parent.parent_type, parent.parentid, 'zangspaces');

      let existingLicenses = [];
      if (accountsSpacesLicenses && accountsSpacesLicenses[0] && accountsSpacesLicenses[0].services) {
        existingLicenses = accountsSpacesLicenses[0].services;
      }

      // aggregare license quantity
      for (let oi of spacesItemIndexes) {
        const item = purchasedPlan.items[oi];
        logger.info(fn, `checking licnese type of #${oi}: ${item.identifier}`);
        const licenseType = item && item.references && item.references.licenseType;
        if (!licenseType) {
          logger.warn(fn, `No license type found on ${item.identifier}`);
          continue;
        }
        if (licenseType && SPACES_LICENSETYPES.indexOf(licenseType) === -1) {
          logger.warn(fn, `Invalid Spaces license ${licenseType} on ${item.identifier}`);
          continue;
        }
        // NOTE: we don't create free user license
        if (licenseType === SPACES_LICENSETYPE_BASIC) {
          logger.info(fn, `Skip basic user on ${item.identifier}`);
          continue;
        }

        const license = findLicenseByServiceType(existingLicenses, licenseType);

        if (license)  {
          const subscription = purchasedPlan.subscriptions && purchasedPlan.subscriptions[0];

          const createdOn = purchasedPlan && purchasedPlan.created && purchasedPlan.created.on;
          const lastPaymentDate = subscription && subscription.payment && subscription.payment.on;
          let servicesExpirationDate;

          if (moment().subtract(subscription.contractLength, subscription.contractPeriod).isBefore(createdOn))  {
            servicesExpirationDate = moment(createdOn).add(subscription.contractLength, subscription.contractPeriod).add(7, 'd').toJSON().slice(0, -1);
          } else if (moment().subtract(subscription.contractLength, subscription.contractPeriod).isAfter(createdOn)) {
            servicesExpirationDate = moment(lastPaymentDate).add(subscription.billingInterval, subscription.billingPeriod).add(7, 'd').toJSON().slice(0, -1);
          }

          if (!servicesExpirationDate)  {
            continue;
          }

          if (!progress.maxExpirationDate || servicesExpirationDate > progress.maxExpirationDate) {
            progress.maxExpirationDate = servicesExpirationDate;
          }

          progress.licenses.push({
            service_type: licenseType,
            expiration: servicesExpirationDate,
            term_days: 0,
            quantity: license.quantity,
          });
        }
      }
      logger.info(fn, 'Spaces licenses', JSON.stringify(progress.licenses));
    })
    .then(async() => {
      if (!progress.maxExpirationDate || progress.licenses.length === 0) {
        logger.info(fn, 'no licenses need to create, skipped');
        return;
      }

      const { createUpdateActiveLicense } = require('../../modules/zang-accounts');

      logger.info(fn, 'creating Spaces licenses ...');

      let license = {
        id: '',
        ...parent,
        instance_no: '',
        product_type: 'zangspaces',
        trial: false,
        created_by: userId,
        modified_by: '',
        services: [{
            service_type: 'zangspaces',
            expiration: progress.maxExpirationDate,
            term_days: 0,
            quantity: 1,
          },
          ...progress.licenses
        ],
        expire_type: 'subscription',
        order_number: purchasedPlan.confirmationNumber,
      }

      // FIXME: do we give out addons? if so, should add addon license below

      logger.info(fn, 'license prepare:', license);

      try {
        await createUpdateActiveLicense(context.requestId, license);

        logger.info(fn, 'spaces license created');
      } catch (err) {
        logger.info(fn, 'creating spaces license failed');
        throw err;
      }
    })
    .then(() => {
      next();
    })
    .catch((err) => {
      logger.error(fn, 'Error:', err);
      next(err);
    });
};

module.exports = processEvent;
