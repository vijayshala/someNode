const ns = '[ip-office][tasks][provision-fail-email]';
const logger = require('applogger');
const config = require('../../../config');
const _ = require('lodash');

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
 * (below are added by provision-sip-initialize.js)
 * - ipOffice: {
 * -   ipAddress: iPOAddress,
 * -   hostName: iPOHost
 * - },
 * - error
 */
const handler = (src, data, cb) => {
  const fn = `[${src.requestId}]${ns}[processEvent]`;
  const U = require('../../modules/utils');
  const localizerUtil = require('../../../localizer/localizerUtil');
  const localizer = localizerUtil(data.user.language);
  const constants = require('../../../config/constants');
  const sendgrid = require('../../modules/email/sendgrid');

  logger.info(fn, 'started, data:', data);

  U.P()
    .then(async() => {
      const purchasedPlan = data.purchasedPlan;
      logger.info(fn, 'prepare email for support, purchased plan=', purchasedPlan.confirmationNumber, ', company=', purchasedPlan.company);
      const user = data.user;

      const summary = `
        <p>${localizer.get('ORDERID')} #: ${purchasedPlan.confirmationNumber}</p>
        <p><strong>${localizer.get('HEY')} ${user.firstName},</strong></p>
        <p>${localizer.get('CUSTOMER_SUCCESS_EMAIL_WELCOME').replace(/{SUPPORT_EMAIL}/g, constants.SUPPORT_EMAILS.CLOUD_SUPPORT)}</p>
        <p>${localizer.get('CUSTOMER_SUCCESS_EMAIL_PROVISION_SUCCESS').replace(/{CUSTOMER_SUCCESS_EMAIL}/g, constants.SUPPORT_EMAILS.CLOUD_CS)}</p>
        <p>${localizer.get('THANK_YOU')}</p>
        <p><em>${constants.CUSTOMER_SUCCESS.FIRST_NAME}</em></p>
          `;

      const emailConfig = {
        requestId: src.requestId,
        toEmail: user.username,
        subject: localizer.get('EXCITING_TIMES_AHEAD'),
        summary,
      };

      await sendgrid.sendIPOfficeProvisioningEmail(emailConfig);

      logger.info(fn, 'customer email sent', JSON.stringify(emailConfig));
    })
    .then(async() => {
      const purchasedPlan = data.purchasedPlan;
      logger.info(fn, 'prepare email for support, purchased plan=', purchasedPlan.confirmationNumber, ', company=', purchasedPlan.company);
      const phoneNumber = data.phoneNumber;
      const err = data.error;
      data.ipOffice = data.ipOffice || {
          hostName: localizer.get('N_A'),
          ipAddress: localizer.get('N_A')
      };

      const url = 'https://' + data.ipOffice.hostName + ':7070/WebManagement/selfadmin.html';

      const temporaryPhoneHtml = (data.isDidExisting && phoneNumber) ? `<tr>
          <th>${localizer.get('TEMPORARY_PHONE_NUMBER')}</th>
          <td>${U.formatUSPhone(phoneNumber)}</td>
      </tr>` : '';


      const summary = `
        <h3>Attention Support!</h3>
        <p>Something happened when setting up an Avaya Cloud Solutions system:</p>
        <h3>Order Details</h3>
        <p>${localizer.get('ORDERID')} #: ${purchasedPlan.confirmationNumber}</p>
        <table align="center" border="0" cellpadding="0" cellspacing="0" id="footer" style="width: 100%; max-width:600px;padding: 30px 10px;" width="100% ">
            <tbody border="1">
                <tr>
                    <th>Order ID</th>
                    <td>${_.get(data, 'purchasedPlan.orderIds[0]')}</td>
                </tr>
                <tr>
                    <th>Subscription ID</th>
                    <td>${data.purchasedPlan._id}</td>
                </tr>
                <tr>
                    <th>Account Name</th>
                    <td>${purchasedPlan.company && purchasedPlan.company.name}</td>
                </tr>
                <tr>
                    <th>Host Name</th>
                    <td>${data.ipOffice.hostName}</td>
                </tr>
                <tr>
                    <th>Admin Portal</th>
                    <td><a href="${url}">${url}</a></td>
                </tr>
                <tr>
                    <th>IP Address</th>
                    <td>${data.ipOffice.ipAddress}</td>
                </tr>
                <tr>
                    <th>Phone Number</th>
                    <td>${U.formatUSPhone(phoneNumber)}</td>
                </tr>
                ${temporaryPhoneHtml}
            </tbody>
        </table>
        <h3>Failure Details:</h3>
        <p><strong>Error code:</strong>: ${err.code}</p>
        <p><strong>Error message:</strong>: ${err.message}</p>
      `;

      const emailConfig = {
        requestId: src.requestId,
        toEmail: config.environment == 'production' ? constants.SUPPORT_EMAILS.CLOUD_SUPPORT : config.currentDeveloperEmails,
        subject: 'Avaya Cloud Solutions Instance Provisioning Failed',
        summary,
      };

      await sendgrid.sendIPOfficeProvisioningEmail(emailConfig);

      logger.info(fn, 'support email sent', JSON.stringify(emailConfig));
    })
    .then(() => {
      cb(undefined);
    })
    .catch((err) => {
      logger.error(fn, 'Error:', err);
      cb(err);
    })
};

module.exports = handler;
