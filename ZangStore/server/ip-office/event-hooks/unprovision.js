const ns = '[ip-office][event-hooks][unprovision]';
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
  const ZCloudAPI = require('../../../models/zcloud/API');
  const { PurchasedPlanBackend } = require('../../purchased-plan/purchased-plan.backend');

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

  let progress = ipofficeItem && ipofficeItem.metadata || {};

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
        const { IPOfficeSubscriptionTrackBackend } = require('../models/ipoffice-subscription-track.backend');
        const IpOfficeSubscriptionTrackSchema = require('../../../schemas/IpOfficeSubscriptionTrackSchema');

        await Promise.all([
            IpOfficeSubscriptionTrackSchema.remove({
              OrderID: purchasedPlan._id
            }), 
            IPOfficeSubscriptionTrackBackend.remove({
              OrderID: purchasedPlan._id
            }, options)
        ]);

        const { triggerProvisionSubscriptionTask } = require('../utils');
        await triggerProvisionSubscriptionTask(req);
    })
    .then(async()   =>  {
        const domainSID = progress.sipDomain && progress.sipDomain.sid;
        if (!domainSID) {
            return;
        }
        const DeleteSIPDomain = util.promisify(ZCloudAPI.deleteSIPDomain);
        try{
            await DeleteSIPDomain(req, domainSID);
        } catch(err){
            logger.warn(fn, 'error:', err);
        }
        

        delete progress.sipDomain;
        
        updates[`items.${ipofficeItemIndex}.metadata.sipDomain`] = '';
    })
    .then(async()   =>  {
        const phoneNumberSID = (progress.phoneNumber && progress.phoneNumber.sid) || (progress.tempPhoneNumber && progress.tempPhoneNumber.sid);
        if (!phoneNumberSID) {
            return;
        }
        const DeletePhoneNumber = util.promisify(ZCloudAPI.deletePhoneNumber);
        try{
            await DeletePhoneNumber(req, phoneNumberSID);
        } catch(err){
            logger.warn(fn, 'error:', err);
        }

        delete progress.phoneNumber;
        delete progress.tempPhoneNumber;

        updates[`items.${ipofficeItemIndex}.metadata.phoneNumber`] = '';
        updates[`items.${ipofficeItemIndex}.metadata.tempPhoneNumber`] = '';
    })
    .then(async()   =>  {
        const applicationSID = progress.applicationSID;
        if (!applicationSID) {
            return;
        }
        const DeleteApplication = util.promisify(ZCloudAPI.deleteApplication);
        try{
            await DeleteApplication(req, applicationSID);
        } catch(err){
            logger.warn(fn, 'error:', err);
        }

        delete progress.applicationSID;

        updates[`items.${ipofficeItemIndex}.metadata.applicationSID`] = '';
    })
    .then(async()   =>  {
        const ipaclSID = progress.ipaclSID;
        if (!ipaclSID) {
            return;
        }
        const DeleteACLIP = util.promisify(ZCloudAPI.deleteACLIP);
        try{
            await DeleteACLIP(req, ipaclSID);
        } catch(err){
            logger.warn(fn, 'error:', err);
        }

        delete progress.ipaclSID;

        updates[`items.${ipofficeItemIndex}.metadata.ipaclSID`] = '';
    })
    .then(async()   =>  {
        const sipCredListSID = progress.sipCredList && progress.sipCredList.sid;
        if (!sipCredListSID) {
            return;
        }
        const DeleteCredentialList = util.promisify(ZCloudAPI.deleteCredentialList);
        try{
            await DeleteCredentialList(req, sipCredListSID);
        } catch(err){
            logger.warn(fn, 'error:', err);
        }

        delete progress.sipCredList;

        updates[`items.${ipofficeItemIndex}.metadata.sipCredList`] = '';
    })
    .then(async()   =>  {
        await PurchasedPlanBackend.findOneAndUpdate({
            _id: purchasedPlan._id
        }, {
            $unset: updates
        }, options);
    })
    .then(() => {
      next();
    })
    .catch(async (err) => {
        logger.error(fn, 'Error:', err);

        await PurchasedPlanBackend.findOneAndUpdate({
            _id: purchasedPlan._id
        }, {
            $unset: updates
        }, options);
        
        next();
    });
};

module.exports = processEvent;
