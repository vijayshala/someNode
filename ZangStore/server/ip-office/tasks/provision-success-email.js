const ns = '[ip-office][tasks][provision-success-email]';
const logger = require('applogger');

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
  const { nonBlockify } = require('../../modules/utils');
  const { IPOFFICE_USER_TYPE_NAMES } = require('../constants');

  logger.info(fn, 'started, data:', data);

  U.P()
    .then(async() => {
      const purchasedPlan = data.purchasedPlan;
      const user = data.user;
      const phoneNumber = data.phoneNumber;
      const existingNumber = data.existingNumber;
      const url = 'https://' + data.ipOffice.hostName + ':7070/WebManagement/selfadmin.html';

      const temporaryPhoneHtml = (data.isDidExisting && phoneNumber) ? `<tr>
          <th>${localizer.get('TEMPORARY_PHONE_NUMBER')}</th>
          <td>${U.formatUSPhone(phoneNumber)}</td>
      </tr>` : '';

      const transferNumberInstructions = data.isDidExisting ? `<p>${localizer.get('ORDER_OFFICE_TRANSFER_INSTRUCTIONS').replace(/\{SUPPORT_EMAIL\}/g, constants.SUPPORT_EMAILS.CLOUD_SUPPORT).replace('{LNP_FORM_LINK}', 'https://storage.googleapis.com/avayastore/downloads/Avaya-Blank-LOA-Form.pdf').replace('{RODAA_LINK}', 'https://storage.googleapis.com/avayastore/downloads/Avaya-RODAA-Form.pdf')}</p>` : '';

      let usersTableContent = [];
      const appendUserTable = nonBlockify((user) => {
        usersTableContent.push(`<tr>
            <td>${user.name}</td>
            <td>${user.password}</td>
            <td>${user.ext}</td>
            <td>${user.pin}</td>
            <td>${IPOFFICE_USER_TYPE_NAMES[user.type] && localizer.get(IPOFFICE_USER_TYPE_NAMES[user.type].resource)}</td>
            <td>${user.device}</td>
        </tr>`);
      });

      for (let user of data.users) {
        await appendUserTable(user);
      }
      usersTableContent = usersTableContent.join('');

      const summary = `
          <h3>${localizer.get('CONGRATULATIONS_YOUR_IP_OFFICE_ACCOUNT_IS_SETUP_SUCCESSFULLY')}</h3>
          <p>${localizer.get('ORDERID')} #: ${purchasedPlan.confirmationNumber}</p>
          <p><strong>${localizer.get('HEY')} ${user.firstName},</strong></p>
          <p>${localizer.get('CUSTOMER_SUCCESS_EMAIL_WELCOME').replace(/{SUPPORT_EMAIL}/g, constants.SUPPORT_EMAILS.CLOUD_SUPPORT)}</p>
          <p>${localizer.get('CUSTOMER_SUCCESS_EMAIL_PROVISION_SUCCESS').replace(/{CUSTOMER_SUCCESS_EMAIL}/g, constants.SUPPORT_EMAILS.CLOUD_CS)}</p>
          <h4>${localizer.get('START_USING_YOUR_IP_OFFICE')}</h4>
          ${transferNumberInstructions}
          <p>${localizer.get('BELOW_ARE_DETAILS')}</p>
          <p><strong>${localizer.get('YOUR_IP_OFFICE_INFO')}</strong></p>
          <table align="center" border="0" cellpadding="0" cellspacing="0" id="footer" style="width: 100%; max-width:600px;" width="100% ">
              <tbody border="1">
                  <tr>
                      <th>${localizer.get('ORDERID')}</th>
                      <td>${data.contractId.toString()}</td>
                  </tr>
                  <tr>
                      <th>${localizer.get('ACCOUNT_NAME')}</th>
                      <td>${purchasedPlan.company.name}</td>
                  </tr>
                  <tr>
                      <th>${localizer.get('HOST_NAME')}</th>
                      <td>${data.ipOffice.hostName}</td>
                  </tr>
                  <tr>
                      <th>${localizer.get('USER_PORTAL')}</th>
                      <td><a href="${url}">${url}</a></td>
                  </tr>
                  <tr>
                      <th>${localizer.get('IP_ADDRESS')}</th>
                      <td>${data.ipOffice.ipAddress}</td>
                  </tr>
                  <tr>
                      <th>${localizer.get('PHONE_NUMBER')}</th>
                      <td>${U.formatUSPhone((data.isDidExisting && existingNumber) ? existingNumber : phoneNumber)}</td>
                  </tr>
                  ${temporaryPhoneHtml}
              </tbody>
          </table>
          <p><strong>${localizer.get('LOGIN_INFO_TABLE')}</strong></p>
          <table align="center" border="0" cellpadding="0" cellspacing="0" id="footer" style="width: 100%; max-width:600px;" width="100% ">
              <thead border="1">
                  <tr>
                      <th>${localizer.get('USER_NAMES_COLUMN')}</th>
                      <th>${localizer.get('TEMP_PASSWORD_COLUMN')}</th>
                      <th>${localizer.get('EXTENSIONS_COLUMN')}</th>
                      <th>${localizer.get('TEMP_PIN_COLUMN')}</th>
                      <th>${localizer.get('USER_TYPE_COLUMN')}</th>
                      <th>${localizer.get('DEVICE_MODEL_COLUMN')}</th>
                  </tr>
              </thead>
              <tbody>
                  ${usersTableContent}
              </tbody>
          </table>
          <p>${localizer.get('ALL_USERS_CAN_CONFIGURE_ADMIN_PORTAL')}</p>
          <p><a href="${url}" style="display:block;text-align:center;background-color:#c00;padding:10px 0px;color:#fff;text-decoration:none;">${localizer.get('USER_PORTAL')}</a></p>
          <p><strong>${localizer.get('AVAILABLE_APPLICATIONS_FOR_USERS')}</strong></p>
          <table align="center" border="0" cellpadding="0" cellspacing="0" id="footer" style="width: 100%; max-width:600px;" width="100% ">
              <tbody border="0">
                  <tr>
                        <td>${localizer.get('EQUINOX_FOR_IOS_LINK')}</td>
                        <td></td>
                  </tr>
                  <tr>
                      <td>${localizer.get('EQUINOX_FOR_ANDROID_LINK')}</td>
                      <td></td>
                  </tr>
                  <tr>
                      <td>${localizer.get('EQUINOX_FOR_MAC_LINK')}</td>
                      <td></td>
                  </tr>
                  <tr>
                      <td>${localizer.get('EQUINOX_FOR_WINDOWS_LINK')}</td>
                      <td></td>
                  </tr>
                  <tr>
                      <td>${localizer.get('AVAYA_COMMUNICATOR_FOR_WEB_CHROME_EXT_LINK')}</td>
                      <td>${localizer.get('AVAYA_COMMUNICATOR_FOR_WEB_CHROME_EXT_DOC_LINK')}</td>
                  </tr>
                  <tr>
                      <td>${localizer.get('IP_OFFICE_FOR_SOFT_CONSOLE_WINDOWS_LINK')}</td>
                      <td>${localizer.get('IP_OFFICE_FOR_SOFT_CONSOLE_WINDOWS_DOC_LINK')}</td>
                  </tr>
              </tbody>
          </table>
          <p>${localizer.get('DO_NOT_HESITATE_TO_EMAIL_US').replace(/{CS_EMAIL}/g, constants.SUPPORT_EMAILS.CLOUD_CS)}</p>
          <p>${localizer.get('THANK_YOU')}</p>
          <p><em>${constants.CUSTOMER_SUCCESS.FIRST_NAME}</em></p>
          `;

      const emailConfig = {
        requestId: src.requestId,
        toEmail: user.username,
        subject: localizer.get('AVAYA_ORDER_YOUR_NEW_IP_OFFICE_ACCOUNT'),
        summary,
      };

      await sendgrid.sendIPOfficeProvisioningEmail(emailConfig);

      logger.info(fn, '[success]', JSON.stringify(emailConfig));
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
