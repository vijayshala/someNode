const ns = '[ip-office][tasks][provision-customer-settings]';
const logger = require('applogger');
const config = require('../../../config');

const handler = (src, data, cb) => {
  const fn = `[${src.requestId}]${ns}[processEvent]`;
  const U = require('../../modules/utils');
  const _ = require('lodash');
  const { TaskHelper } = require('../../modules/utils/task-helper');
  const { IPOfficeSubscriptionTrackBackend } = require('../models/ipoffice-subscription-track.backend');
  const {
    IPOFFICE_SETTINGXML_TASK_STATUS,
    IPOFFICE_SETTINGXML_TASK_IDLE,
    IPOFFICE_SETTINGXML_TASK_INPROCESS,
  } = require('../constants');

  logger.info(fn, 'started, data:', data);

  const options = {
    requestId: src.requestId,
  };

  U.P()
    .then(async() => {
      const { getWeblsmid, createCustomerSettingXml, triggerProvisionSIPTrunkingTask } = require('../utils');
      const { PurchasedPlanBackend } = require('../../purchased-plan/purchased-plan.backend');
      const subscriptions = await IPOfficeSubscriptionTrackBackend.findAllOfCustomerSettingNotCreated(options);

      for (let subscription of subscriptions) {
        if (!subscription.SubscriptionID) {
          logger.info(fn, `subscription ${subscription._id} doesn't have SubscriptionID`);
          // mark this subscription as finished
          await IPOfficeSubscriptionTrackBackend.markCustomerSettingCreated(subscription._id, options);
          continue;
        }

        const purchasedPlan = await PurchasedPlanBackend.findOneById(subscription.settingxml_creation_meta.order_id, { ...options, ignoreNotFoundError: true });

        if (purchasedPlan) {
          const weblsmid = await getWeblsmid(options, subscription.SubscriptionID, _.get(subscription, 'settingxml_creation_meta.extraData.isContainer', false));
          if (!weblsmid) {
            logger.info(fn, `The subscription ${subscription._id} need get weblsmid in next loop!`);
            continue;
          }

          const result = await createCustomerSettingXml(options, purchasedPlan, weblsmid, subscription.settingxml_creation_meta.extraData);
          // result may include these data
          // - phoneNumber,
          // - isDidExisting,
          // - existingNumber,
          // - userTotals,
          // - users,
          // - stgadminpassword,

          await IPOfficeSubscriptionTrackBackend.findOneAndUpdate({
            _id: subscription._id
          }, {
            $set: {
              'settingxml_creation_meta.extraData.users': result.users,
              'settingxml_creation_meta.extraData.stgadminpassword': result.stgadminpassword
            }
          });

          // trigger create SIPTrunking task
          await triggerProvisionSIPTrunkingTask(options);
          //   options, purchasedPlan, weblsmid, {
          //   ...subscription.settingxml_creation_meta.extraData,
          //   ...result,
          // }
          // );
        } else {
          logger.warn(fn, `purchased plan "${subscription.settingxml_creation_meta.order_id}" not found`);
        }

        // mark this subscription as finished
        if (purchasedPlan) {
          // FIXME: added "if (purchasedPlan) {" by jack @ 05/10/2018
          // the purpose is we need to make new version compatible with old one
          // the old version settingxml_creation_meta.order_id is from OrderSchema
          // if the order_id doesn't exist, it means this subscription is created by new version
          // the settingxml_creation_meta.order_id could be from PurchasedPlanSchema
          await IPOfficeSubscriptionTrackBackend.markCustomerSettingCreated(subscription._id, options);
        }
      }
    })
    .then(async() => {
      // Check is there any more request not processed.
      const needTriggerAnotherTask = await IPOfficeSubscriptionTrackBackend.existsCustomerSettingNotCreated(options);
      logger.info(fn, 'need to trigger another IPOfficeProvisionCustomerSettingsTask task?', needTriggerAnotherTask);

      if (needTriggerAnotherTask) {
        logger.info(fn, 'Trigger a task to create customer setting xml!');
        const taskqueue = require('../../../modules/taskqueue');
        taskqueue.launchDefer(options, 'IPOfficeProvisionCustomerSettingsTask', {}, {
          defferOption: true,
          backoff_seconds: 300,
          attempts: 3,
          delay: 120
        });
      } else {
        await TaskHelper.markTaskAsIdle(IPOFFICE_SETTINGXML_TASK_STATUS, IPOFFICE_SETTINGXML_TASK_IDLE, IPOFFICE_SETTINGXML_TASK_INPROCESS, options);
      }
    })
    .then(() => {
      cb(undefined);
    })
    .catch(async(err) => {
      try {
        await TaskHelper.markTaskAsIdle(IPOFFICE_SETTINGXML_TASK_STATUS, IPOFFICE_SETTINGXML_TASK_IDLE, IPOFFICE_SETTINGXML_TASK_INPROCESS, options);
      } catch (err2) {}
      logger.error(fn, 'Error:', err);
      cb(err);
    });
};

module.exports = handler;
