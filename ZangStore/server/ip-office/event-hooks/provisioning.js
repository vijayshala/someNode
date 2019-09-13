const ns = '[ip-office][event-hooks][provisioning]';
const logger = require('applogger');
const util = require('util');

const config = require('../../../config');
const { ServerInternalError } = require('../../modules/error');
const { PRODUCT_ENGINE_NAME, IPOFFICE_CONTAINER_FLAG, IPOFFICE_VM_FLAG } = require('../constants');

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const Utils = require('../../../common/Utils');
  const U = require('../../modules/utils');
  const {
    cartHasProductsOf,
    generateSubscriptionIdentifier,
    findCartItemContext,
  } = require('../../modules/cart-salesmodel-rules/utils');
  const { PurchasedPlanBackend } = require('../../purchased-plan/purchased-plan.backend');
  const { ORDER_STATUS_TYPES, TECH_SUPPORT } = require('../../../config/constants');
  const ZCloudAPI = require('../../../models/zcloud/API');
  let purchasedPlan = context.purchasedPlan;
  const ipofficeItemIndexes = purchasedPlan && cartHasProductsOf(purchasedPlan, PRODUCT_ENGINE_NAME);

  logger.info(fn, 'started', 'purchased plan id=', purchasedPlan && purchasedPlan._id);
  if (purchasedPlan && !ipofficeItemIndexes) {
    logger.info(fn, `No "${PRODUCT_ENGINE_NAME}" product found in purchased plan, skipped`);
    return next();
  }
  const ipofficeItemIndex = ipofficeItemIndexes[0];
  logger.info(fn, 'ipofficeItemIndex=', ipofficeItemIndex);
  const ipofficeItem = purchasedPlan.items[ipofficeItemIndex];
  logger.info(fn, 'ipofficeItem=', ipofficeItem && ipofficeItem.identifier);
  const ipofficeItemSubscription = ipofficeItem && ipofficeItem.salesModel.subscription;
  logger.info(fn, 'ipofficeItemSubscription=', ipofficeItemSubscription);
  const ipofficeItemSubscriptionIdentifier = ipofficeItem && generateSubscriptionIdentifier(ipofficeItem.salesModel.subscription);
  logger.info(fn, 'ipofficeItemSubscriptionIdentifier=', ipofficeItemSubscriptionIdentifier);
  const purchasedPlanSubscription = purchasedPlan.subscriptions.find((one) => one.identifier === ipofficeItemSubscriptionIdentifier);
  logger.info(fn, 'purchasedPlanSubscription=', purchasedPlanSubscription && purchasedPlanSubscription.identifier);

  let req = {
    requestId: context.requestId,
    userInfo: context.user,
  };
  const options = {
    requestId: context.requestId,
  };
  let progress = {
    IPODefaultUserPassword: Utils.generateRandomString(10),
    SubscriptionID: null,
    sipDomain: null,
    phoneNumber: null,
  };

  U.P()
    .then(async() => {
      //get incremental subscription ID

      const { getIPOfficeNextSubscriptionTrackId } = require('../utils');

      const subscriptionId = await getIPOfficeNextSubscriptionTrackId(req);
      progress.SubscriptionID = subscriptionId;
      if (!progress.SubscriptionID) {
        throw new ServerInternalError('Counld NOT create subscription ID');
      }
      logger.info(fn, `incremental subscription ID created: ${progress.SubscriptionID}`);
      // backward-compatible
      req.SubscriptionID = progress.SubscriptionID;
    })
    .then(async() => {
      //create SIP Domain
      try {
        await PurchasedPlanBackend.log(purchasedPlan, false, ORDER_STATUS_TYPES.IP_OFFICE_CREATING_SIP_DOMAIN, null, context.user, options);

        const createSIPDomain = util.promisify(ZCloudAPI.createSIPDomain);
        const resultSIPDomain = await createSIPDomain(req, progress.SubscriptionID, "", "GET");
        progress.sipDomain = {
          sid: resultSIPDomain.sid,
          domain: resultSIPDomain.domain_sip_url
        };
        logger.info(fn, `SIP domain created:`, JSON.stringify(progress.sipDomain));

        const createCredentialList = util.promisify(ZCloudAPI.createCredentialList);
        const resultCredentialList = await createCredentialList(req, progress.SubscriptionID);
        progress.credentialList = {
          sid: resultCredentialList.sid
        };
        logger.info(fn, `Credential list created:`, JSON.stringify(progress.credentialList));


        const { generatePassword } = require('../utils');
        const username = generatePassword(12);
        const password = generatePassword(12);
        const createCredential = util.promisify(ZCloudAPI.createCredential);
        const resultCredential = await createCredential(req, progress.SubscriptionID, progress.credentialList.sid, username, password);
        progress.sipCredential = {
          sid: resultCredential.sid,
          username: username,
          password: password
        };
        logger.info(fn, 'Credential created:', JSON.stringify(progress.sipCredential));

        await PurchasedPlanBackend.log(purchasedPlan, false, ORDER_STATUS_TYPES.IP_OFFICE_CREATE_SIP_DOMAIN_SUCCESS, null, context.user, options);

        // backward-compatible
        req.sipDomain = progress.sipDomain;
      } catch (err) {
        await PurchasedPlanBackend.log(purchasedPlan, true, ORDER_STATUS_TYPES.IP_OFFICE_CREATE_SIP_DOMAIN_ERROR, err, context.user, options);
        //throw err;
      }
      let updates = {};
      updates[`items.${ipofficeItemIndex}.metadata.sipDomain`] = progress.sipDomain;
      updates[`items.${ipofficeItemIndex}.metadata.sipCredList`] = progress.credentialList;
      updates[`items.${ipofficeItemIndex}.metadata.sipCred`] = progress.sipCredential;

      //update contract with temp phone number
      await PurchasedPlanBackend.findOneAndUpdate({ _id: purchasedPlan._id }, {
        '$set': updates,
      }, options);
    })
    .then(async() => {
      //attach/buy phone number
      const tagsToFind = {
        main: 'did-main',
        existing: 'did-existing',
        tollfree: 'did-tollfree',
        local: 'did-local',
      };
      let itemContextFound = null;
      let did = null;
      let isDidExisting = false;
      let isDidTollfree = false;
      let isDidLocal = false;
      let itemFoundIndex = null;
      for (let ci in purchasedPlan.items) {
        const item = purchasedPlan.items[ci];
        const itemContext = findCartItemContext(item);
        const tags = itemContext && itemContext.tags;
        const isIPOffice = item && item.engines && item.engines.indexOf(PRODUCT_ENGINE_NAME) > -1;
        if (isIPOffice && tags && tags.indexOf(tagsToFind.main) > -1) {
          itemFoundIndex = ci;
          itemContextFound = itemContext;
          did = itemContext.helper && itemContext.helper.number;
          isDidExisting = tags.indexOf(tagsToFind.existing) > -1;
          isDidTollfree = tags.indexOf(tagsToFind.tollfree) > -1;
          isDidLocal = tags.indexOf(tagsToFind.local) > -1;
          break;
        }
      }

      if (!did) {
        throw new Error('No phone number selected, this should have been caught by validation rule');
      }
      logger.info(fn, `phone number: ${did}, existing=${isDidExisting}, tollfree=${isDidTollfree}, local=${isDidLocal}`);

      let updates = {};

      if (isDidExisting) {
        const { findTemporaryPhoneNumber } = require('../utils');
        try {
          const result = await findTemporaryPhoneNumber(req, did, (purchasedPlan && purchasedPlan.contact && purchasedPlan.contact.phone) || '', purchasedPlan, progress.SubscriptionID);
          progress.tempPhoneNumber = {
            sid: result.sid,
            phone_number: result.phone_number
          };
          progress.phoneNumber = did;

          logger.info(fn, 'find temp number:', JSON.stringify(progress.tempPhoneNumber));

          itemContextFound.helper.tempPhoneNumber = progress.tempPhoneNumber.phone_number;

          updates[`items.${itemFoundIndex}.salesModelItem.helper.tempPhoneNumber`] = itemContextFound.helper.tempPhoneNumber;
        } catch (err) {
          logger.error(fn, 'find temp number failed', err);
        }
      } else {
        try {
          await PurchasedPlanBackend.log(purchasedPlan, false, ORDER_STATUS_TYPES.ZCLOUD_PURCHASING_PHONE_NUMBER, null, context.user, options);

          let result;
          try{
            const addPhoneNumber = util.promisify(ZCloudAPI.addPhoneNumber);
            result = await addPhoneNumber(req, did, '', '', progress.SubscriptionID);
          } catch(err)  {
            logger.warn(fn, 'Unable to find chosen number, attempting to find similar number');

            const { findTemporaryPhoneNumber } = require('../utils');

            result = await findTemporaryPhoneNumber(req, did, (purchasedPlan && purchasedPlan.contact && purchasedPlan.contact.phone) || '', purchasedPlan, progress.SubscriptionID);
          }
          progress.phoneNumber = {
            sid: result.sid,
            phone_number: result.phone_number
          };
          logger.info(fn, `Phone number activated:`, JSON.stringify(progress.phoneNumber));
          itemContextFound.helper.activated = true;

          await PurchasedPlanBackend.log(purchasedPlan, false, ORDER_STATUS_TYPES.ZCLOUD_PURCHASE_PHONE_NUMBER_SUCCESS, null, context.user, options);

          // backward-compatible
          req.phoneNumber = progress.phoneNumber;
        } catch (err) {
          itemContextFound.helper.activated = false;
          await PurchasedPlanBackend.log(purchasedPlan, true, ORDER_STATUS_TYPES.ZCLOUD_PURCHASE_PHONE_NUMBER_ERROR, err, context.user, options);
        }
        updates[`items.${itemFoundIndex}.salesModelItem.helper.activated`] = itemContextFound.helper.activated;
      }

      updates[`items.${ipofficeItemIndex}.metadata.phoneNumber`] = progress.phoneNumber;
      if (progress.tempPhoneNumber) {
        updates[`items.${ipofficeItemIndex}.metadata.tempPhoneNumber`] = progress.tempPhoneNumber;
      }

      //update contract with temp phone number
      await PurchasedPlanBackend.findOneAndUpdate({ _id: purchasedPlan._id }, {
        '$set': updates,
      }, options);
    })
    .then(async() => {
      //provision subscription
      const { IPOFFICE_SETTINGXML_NOT_CREATIION } = require('../../../modules/constants');
      const moment = require('moment');

      try {
        await PurchasedPlanBackend.log(purchasedPlan, false, ORDER_STATUS_TYPES.IP_OFFICE_PROVISIONING_SUBSCRIPTION, null, context.user, options);

        const date = new Date();
        const SubscriptionEndDate = ipofficeItemSubscription && moment(date).add(ipofficeItemSubscription.billingInterval, ipofficeItemSubscription.billingPeriod);

        const isContainer = (purchasedPlan && purchasedPlan.notes ? purchasedPlan.notes.indexOf(IPOFFICE_VM_FLAG) == -1 : true);

        let newSubscriptionRecord = {
          OrderID: '' + purchasedPlan._id,
          SubscriptionID: progress.SubscriptionID,
          SubscriptionDesc: purchasedPlan.company && purchasedPlan.company.name,
          SubscriptionType: 'IPO',
          SubscriptionLabel: purchasedPlan.company && purchasedPlan.company.name,
          SubscriptionStartDate: date,
          SubscriptionEndDate: SubscriptionEndDate,
          SubscriptionModifiedDate: date,
          AccountName: purchasedPlan.company && purchasedPlan.company.name + '-' + purchasedPlan._id,
          AccountAddress: {
            AddressLine1: purchasedPlan.billingAddress.address1,
            AddeessLine2: purchasedPlan.billingAddress.address2,
            AddressLine3: '',
            City: purchasedPlan.billingAddress.city,
            State: purchasedPlan.billingAddress.state,
            Country: purchasedPlan.billingAddress.country,
            PostalCode: purchasedPlan.billingAddress.zip,
          },
          TechnicalContact: {
            FirstName: purchasedPlan.contact.firstName,
            LastName: purchasedPlan.contact.lastName,
            PhoneNumber: purchasedPlan.contact.phone,
            Email: purchasedPlan.contact.email
          },
          DeploymentNotes: isContainer ? IPOFFICE_CONTAINER_FLAG : IPOFFICE_VM_FLAG,
          SubscriptionLocation: 'Primary',
          settingxml_creation_meta: {
            order_id: '' + purchasedPlan._id,
            status: IPOFFICE_SETTINGXML_NOT_CREATIION,
            extraData: {
              subscriptionId: progress.SubscriptionID,
              sipDomainSid: progress.sipDomain && progress.sipDomain.sid,
              sipDomain: progress.sipDomain && progress.sipDomain.domain,
              sipCredList: progress.credentialList && progress.credentialList.sid,
              sipCred: progress.sipCredential,
              contractId: '' + purchasedPlan._id,
              IPODefaultUserPassword: progress.IPODefaultUserPassword,
              isContainer: isContainer,
              phoneNumber: progress.tempPhoneNumber ? progress.tempPhoneNumber && progress.tempPhoneNumber.phone_number : progress.phoneNumber && progress.phoneNumber.phone_number,
              phoneNumberSid: progress.tempPhoneNumber ? progress.tempPhoneNumber && progress.tempPhoneNumber.sid : progress.phoneNumber && progress.phoneNumber.sid,
              isDidExisting: !!progress.tempPhoneNumber,
              existingNumber: progress.tempPhoneNumber ? progress.phoneNumber : '',
              user: {
                _id: context.user.userId,
                username: context.user.username,
                firstName: context.user.firstName,
                lastName: context.user.lastName,
                language: context.user.language
              },
            }
          }
        };
        logger.info(fn, `ipoffice subscription original:`, JSON.stringify(newSubscriptionRecord));

        const { IPOfficeSubscriptionTrackBackend } = require('../models/ipoffice-subscription-track.backend');

        const saved = await IPOfficeSubscriptionTrackBackend.create(newSubscriptionRecord, options);
        logger.info(fn, `ipoffice subscription track:`, JSON.stringify(saved));

        const { triggerProvisionSubscriptionTask } = require('../utils');
        await triggerProvisionSubscriptionTask(req);
        logger.info(fn, `tracking added`);

        await PurchasedPlanBackend.log(purchasedPlan, false, ORDER_STATUS_TYPES.IP_OFFICE_PROVISION_SUBSCRIPTION_SUCCESS, null, context.user, options);
      } catch (err) {
        await PurchasedPlanBackend.log(purchasedPlan, true, ORDER_STATUS_TYPES.IP_OFFICE_PROVISION_SUBSCRIPTION_ERROR, err, context.user, options);
        throw err;
      }
    })
    .then(async() => {
      //provision customer settings
      logger.info(fn, 'start provision customer settings')

      const { triggerProvisionCustomerSettingsTask } = require('../utils');
      await triggerProvisionCustomerSettingsTask(req);
    })
    .then(() => {
      next();
    })
    .catch((err) => {
      const { triggerProvisionFailEmailTask } = require('../utils');

      logger.error(fn, 'Error:', err);
      const emailData = {
        ...progress,
        user: context.user,
        purchasedPlan,
        isDidExisting: !!progress.tempPhoneNumber,
        error: err,
      };

      triggerProvisionFailEmailTask(req, emailData);
      next();
    });
};

module.exports = processEvent;
