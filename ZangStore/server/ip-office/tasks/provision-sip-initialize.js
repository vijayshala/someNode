const ns = '[ip-office][tasks][provision-sip-initialize]';
const logger = require('applogger');
const esErr = require('../../../modules/errors');

/**
 * data may include these properties
 * - ...subscription.settingxml_creation_meta.extraData,
 * (below are added by createCustomerSettingXml)
 * - phoneNumber,
 * - isDidExisting,
 * - existingNumber,
 * - userTotals,
 * - users,
 * (below are added by triggerProvisionSIPTrunkingTask)
 * - subscriptionID,
 * - purchasedPlan,
 */
const handler = (src, data, cb) => {
  const fn = `[${src.requestId}]${ns}[processEvent]`;
  const U = require('../../modules/utils');
  const util = require('util');
  const moment = require('moment');
  const { triggerProvisionSuccessEmailTask, triggerProvisionFailEmailTask, triggerMSAProvisionEmailTask } = require('../utils');
  const { PurchasedPlanBackend } = require('../../purchased-plan/purchased-plan.backend');

  logger.info(fn, 'started, data:', data);

  const config = require('../../../config');

  const ZCloud = require('../../../models/zcloud/API');

  const { IPOfficeSubscriptionTrackBackend } = require('../models/ipoffice-subscription-track.backend');

  const inboundXMLUrl = config.IPOFFICE && config.IPOFFICE.ZCLOUD_GLOBAL_INBOUND_XML;
  const outboundXMLUrl = config.IPOFFICE && config.IPOFFICE.ZCLOUD_GLOBAL_OUTBOUND_XML;

  const req = {
    requestId: src.requestId,
  };

  U.P()
    .then(async() =>  {
      const subscriptions = await IPOfficeSubscriptionTrackBackend.findAllOfReadyToProvision(req);

      for (let subscription of subscriptions) {
        if (!subscription.SubscriptionID) {
          logger.info(fn, `subscription ${subscription._id} doesn't have SubscriptionID`);
          // mark this subscription as finished
          await IPOfficeSubscriptionTrackBackend.markProvisioningCompleted(subscription._id, req);
          continue;
        }

        const purchasedPlan = await PurchasedPlanBackend.findOneById(subscription.settingxml_creation_meta.order_id, { ...req, ignoreNotFoundError: true });

        if (!purchasedPlan) {
          logger.warn(fn, 'Purchased plan not found:', subscription.settingxml_creation_meta.order_id);
          await IPOfficeSubscriptionTrackBackend.markProvisioningCompleted(subscription._id, req);
          continue;
        }

        logger.info(fn, 'purchasedplan id=', purchasedPlan._id);

        const extraData = subscription.settingxml_creation_meta.extraData;

        const subscriptionId = extraData.subscriptionId;
        const sipDomainSid = extraData.sipDomainSid;
        const phoneNumber = extraData.phoneNumber;
        const credListSid = extraData.sipCredList;
        const phoneNumbersid = extraData.phoneNumberSid;

        const isContainer = extraData.isContainer || false;

        let domainSID, ipACLID, iPOAddress, iPOHost, customInboundXmlUrl, applicationSID;

        const { getInstanceDetails } = require('../utils');
        const instanceInfo = await getInstanceDetails(req, subscriptionId, isContainer);

        if (!instanceInfo)  {
          await IPOfficeSubscriptionTrackBackend.findOneAndUpdate({
            _id: subscription._id,
            'settingxml_creation_meta.extraData.firstOSSPoll': null
          },{
            '$set': { 'settingxml_creation_meta.extraData.firstOSSPoll': new Date() },
          });

          if (extraData.firstOSSPoll) {
            const firstOSSPoll = moment(extraData.firstOSSPoll).add(1, 'hour');

            logger.info(fn, 'firstOSSPoll:', firstOSSPoll);

            if (moment().isAfter(firstOSSPoll)) {
              logger.error(fn, 'timeout exceeded for OSS');

              await IPOfficeSubscriptionTrackBackend.markProvisioningCompleted(subscription._id, req);

              try {
                const emailData = {
                  ...extraData,
                  purchasedPlan,
                  ipOffice: {
                    ipAddress: iPOAddress,
                    hostName: iPOHost,
                    instance: instanceInfo.instance
                  },
                  error: new esErr.ESErrors('oss_publicip_unavailable', 'OSS publicIp unavailable'),
                };

                triggerProvisionFailEmailTask(req, emailData);
                triggerMSAProvisionEmailTask(req, emailData);
              } catch (err2) {
                logger.error(fn, 'Error2:', err2);
              }
            }
          }
          continue;
        }

        iPOAddress = instanceInfo.ipAddress;
        iPOHost = instanceInfo.host;

        await U.P()
          .then(async() => { // Update SIP domain
            const updateSIPDomain = util.promisify(ZCloud.updateSIPDomain);
            const resp = await updateSIPDomain(req, sipDomainSid, outboundXMLUrl, 'GET');
            domainSID = resp.sid;
          })
          .then(async() => {
            const mapCredentialtoSIPDomain = util.promisify(ZCloud.mapCredentialList);
            const resp = await mapCredentialtoSIPDomain(req, subscriptionId, sipDomainSid, credListSid);
          })
          .then(async() => { // Create application
            customInboundXmlUrl = `${inboundXMLUrl}?ipoaddr=${iPOAddress}`;
            const createApplication = util.promisify(ZCloud.createApplication);
            const resp = await createApplication(req, subscriptionId, customInboundXmlUrl, 'GET');
            applicationSID = resp.sid;
          })
          .then(async() => { // Update Phone Number Url
            const updatePhoneNumberBySid = util.promisify(ZCloud.updatePhoneNumberBySid);
            await updatePhoneNumberBySid(req, phoneNumbersid, applicationSID, '', '');
          })
          .then(async() => { // update purchased plan subscription metadata
            const { cartHasProductsOf } = require('../../modules/cart-salesmodel-rules/utils');
            const { PRODUCT_ENGINE_NAME } = require('../constants');
            const ipofficeItemIndexes = purchasedPlan && cartHasProductsOf(purchasedPlan, PRODUCT_ENGINE_NAME);

            logger.info(fn, 'prepare to update purchased plan id=', purchasedPlan && purchasedPlan._id);
            if (purchasedPlan && !ipofficeItemIndexes) {
              logger.info(fn, `No "${PRODUCT_ENGINE_NAME}" product found in purchased plan, skipped`);
              return;
            }
            const ipofficeItemIndex = ipofficeItemIndexes[0];
            logger.info(fn, 'ipofficeItemIndex=', ipofficeItemIndex);

            const { PurchasedPlanBackend } = require('../../purchased-plan/purchased-plan.backend');
            let updates = {};
            updates[`items.${ipofficeItemIndex}.metadata.IPO_IPAddress`] = iPOAddress;
            updates[`items.${ipofficeItemIndex}.metadata.IPO_HostName`] = iPOHost;
            updates[`items.${ipofficeItemIndex}.metadata.IPO_InstanceNAme`] = instanceInfo.instance;
            updates[`items.${ipofficeItemIndex}.metadata.applicationSID`] = applicationSID;
            updates[`items.${ipofficeItemIndex}.metadata.ipaclSID`] = ipACLID;
            await PurchasedPlanBackend.findOneAndUpdate({ _id: purchasedPlan._id }, {
              '$set': updates,
            }, req);
          })
          .then(async () => { // send success email
            const emailData = {
              ...extraData,
              purchasedPlan,
              ipOffice: {
                ipAddress: iPOAddress,
                hostName: iPOHost,
                instance: instanceInfo.instance
              },
            };

            await IPOfficeSubscriptionTrackBackend.markProvisioningCompleted(subscription._id, req);

            if (!extraData.isContainer)  {
              triggerProvisionSuccessEmailTask(req, emailData);
            }
            triggerMSAProvisionEmailTask(req, emailData);
          })
          .catch(async (err) => {
            logger.error(fn, 'Error3:', err);

            await IPOfficeSubscriptionTrackBackend.markProvisioningCompleted(subscription._id, req);

            try {
              const emailData = {
                ...extraData,
                purchasedPlan,
                ipOffice: {
                  ipAddress: iPOAddress,
                  hostName: iPOHost,
                  instance: instanceInfo.instance
                },
                error: err,
              };

              triggerProvisionFailEmailTask(req, emailData);
              triggerMSAProvisionEmailTask(req, emailData);
            } catch (err2) {
              logger.error(fn, 'Error2:', err);
            }
          })
      }
    })
    .then(async() =>  {
      // Check is there any more request not processed.
      const needTriggerAnotherTask = await IPOfficeSubscriptionTrackBackend.existsReadyToProvision(req);
      logger.info(fn, 'need to trigger another IPOfficeProvisionSIPInitializeTask task?', needTriggerAnotherTask);

      const {
        IPOFFICE_SIP_PROVISION_TASK_STATUS,
        IPOFFICE_SIP_PROVISION_TASK_INPROCESS,
        IPOFFICE_SIP_PROVISION_TASK_IDLE,
        IPOFFICE_SIP_PROVISION_TASK_LOCKTM,
      } = require('../constants');
      const { TaskHelper } = require('../../modules/utils/task-helper');

      if (needTriggerAnotherTask) {
        logger.info(fn, 'Trigger a task to sip provision!');
        const taskqueue = require('../../../modules/taskqueue');
        taskqueue.launchDefer(req, 'IPOfficeProvisionSIPInitializeTask', {}, {
          defferOption: true,
          backoff_seconds: 300,
          attempts: 1,
          delay: 120
        });
      } else {
        await TaskHelper.markTaskAsIdle(IPOFFICE_SIP_PROVISION_TASK_STATUS, IPOFFICE_SIP_PROVISION_TASK_IDLE, IPOFFICE_SIP_PROVISION_TASK_INPROCESS, req);
      }
    })
    .then(()  =>  {
      cb();
    })
    .catch(async(err) =>  {
      const {
        IPOFFICE_SIP_PROVISION_TASK_STATUS,
        IPOFFICE_SIP_PROVISION_TASK_INPROCESS,
        IPOFFICE_SIP_PROVISION_TASK_IDLE,
        IPOFFICE_SIP_PROVISION_TASK_LOCKTM,
      } = require('../constants');
      const { TaskHelper } = require('../../modules/utils/task-helper');
      try {
        await TaskHelper.markTaskAsIdle(IPOFFICE_SIP_PROVISION_TASK_STATUS, IPOFFICE_SIP_PROVISION_TASK_IDLE, IPOFFICE_SIP_PROVISION_TASK_INPROCESS, req);
      } catch (err2) {}
      logger.error(fn, 'Error:', err);
      cb(err);
    });
};

module.exports = handler;
