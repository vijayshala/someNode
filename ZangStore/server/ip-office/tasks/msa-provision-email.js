const ns = '[ip-office][tasks][msa-provision-email]';
const logger = require('applogger');


const getPartnerEmailConfig = async (partnerId, templater, options) => {
  const fn = `[${options.requestId}]${ns}[getPartnerEmailConfig]`;
  const { PartnerBackend } = require('../../partner/partner.backend');

  let emailConfig = {};

  try {
    let partner = await PartnerBackend.findOneById(partnerId, options);
    if (partner.parent) {
      partner = await PartnerBackend.findOneById(partner.parent, options);
    }

    emailConfig = {
      requestId: options.requestId,
      companyName: partner.fields.companyName,
      toEmail: partner.fields.utilityEmail,
      bcc: templater.criEmail.bcc,
      deviceProvisioningSchema: partner.deviceProvisioningSchema,
      deviceProvisioningFileName: partner.deviceProvisioningFileName,
    };
  } catch (e) {
    logger.error(fn, 'Error', e);
    emailConfig = {
      requestId: options.requestId,
      companyName: 'Zang',
      toEmail: templater.criEmail.restriction.toEmail,
      bcc: templater.criEmail.restriction.bcc
    };
  }

  logger.info(fn, 'email config:', emailConfig);

  return emailConfig;
};

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
 */
const handler = (src, data, cb) => {
  const fn = `[${src.requestId}]${ns}[processEvent]`;
  const U = require('../../modules/utils');
  const localizerUtil = require('../../../localizer/localizerUtil');
  const localizer = localizerUtil(data.user.language);
  const constants = require('../../../config/constants');
  const emailTemplater = require('../../modules/email/templater');
  const sendgrid = require('../../modules/email/sendgrid');
  const { nonBlockify } = require('../../modules/utils');
  const Utils = require('../../../common/Utils');
  const config = require('../../../config');
  const { IPOFFICE_USER_TYPE_NAMES } = require('../constants');

  logger.info(fn, 'started, data:', data);

  const options = {
    requestId: src.requestId,
  };

  U.P()
    .then(async () => {
      const purchasedPlan = data.purchasedPlan;
      const user = data.user;
      const stgadminpassword = data.stgadminpassword;

      const temporaryPhoneHtml = (data.isDidExisting && data.phoneNumber) ? `<tr>
          <th>${localizer.get('TEMPORARY_PHONE_NUMBER')}</th>
          <td>${U.formatUSPhone(data.phoneNumber)}</td>
      </tr>` : '';

      let usersTableContent = [];
      let csvUsers = '';
      const appendUserTable = nonBlockify((user) => {
        usersTableContent.push(`<tr>
            <td>${user.name}</td>
            <td>${user.password}</td>
            <td>${user.ext}</td>
            <td>${user.pin}</td>
            <td>${IPOFFICE_USER_TYPE_NAMES[user.type] && IPOFFICE_USER_TYPE_NAMES[user.type].title}</td>
            <td>${user.device}</td>
        </tr>`);
        let pin = (user.pin.startsWith('0')) ? '`' + user.pin : user.pin;
        csvUsers += `${user.name},${user.password},${user.ext},${pin},${IPOFFICE_USER_TYPE_NAMES[user.type] && IPOFFICE_USER_TYPE_NAMES[user.type].title},${user.device}\r\n`;
      });

      for (let user of data.users) {
        await appendUserTable(user);
      }
      usersTableContent = usersTableContent.join('');

      const NAinformation = localizer.get('PLEASE_CONTACT_EMAIL_FOR_THIS_INFORMATION').replace(/{EMAIL}/g, constants.SUPPORT_EMAILS.CLOUD_SUPPORT);
      const NAinformationLabel = `N/A <p style="font-size:10px">(${NAinformation})</p>`
      const hostName = data.ipOffice.hostName || NAinformationLabel
      const ipAddress = data.ipOffice.ipAddress || NAinformationLabel

      const instanceName = data.ipOffice.instance;
      const adminURL = instanceName && config.IPOFFICE && config.IPOFFICE.ADMIN_URL ? `${config.IPOFFICE.ADMIN_URL}/${instanceName}/admin` : localizer.get('NA');
      const adminPortalSummary = `
        <tr>
          <th>${localizer.get('ADMIN_PORTAL')}</th>
          <td>
            <ul style="list-style-type: none;margin-left:-55px;">
              <li>${localizer.get('URL')}: <a href="${adminURL}">${adminURL}</a></li>
              <li>${localizer.get('USERNAME')}: ${config.IPOFFICE && config.IPOFFICE.ADMIN_USERNAME}</li>
              <li>${localizer.get('PASSWORD')}: ${stgadminpassword}</li>
            </ul>
          </td>
        </tr>
      `;
      const usersTableSummary = `
        <br />
        <table table align="center" border="0" cellpadding="0" cellspacing="0" id="footer" style="width: 100%; max-width:600px;padding: 30px 10px;" width="100% ">
            <thead border="1">
                <tr>
                    <th>${localizer.get('USER_NAMES_COLUMN')}</th>
                    <th>${localizer.get('TEMP_PASSWORD_COLUMN')}</th>
                    <th>${localizer.get('EXTENSIONS_COLUMN')}</th>
                    <th>${localizer.get('TEMP_PIN_COLUMN')}</th>
                    <th>${localizer.get('USER_TYPE_COLUMN')}</th>
                    <th>${localizer.get('DEVICE_MODEL_COLUMN')}</th>
                <tr>
            </thead>
            <tbody border="1">${usersTableContent}</tbody>
        </table>
      `;
      const summary = `
          <table table align="center" border="0" cellpadding="0" cellspacing="0" id="footer" style="width: 100%; max-width:600px;padding: 30px 10px;" width="100% ">
            <tbody border="1">
                ${config.IPOFFICE && config.IPOFFICE.ADMIN_URL && config.IPOFFICE.ADMIN_USERNAME ? adminPortalSummary : ''}
                <tr>
                    <th>${localizer.get('HOST_NAME')}</th>
                    <td>${hostName}</td>
                </tr>
                <tr>
                    <th>${localizer.get('IP_ADDRESS')}</th>
                    <td>${ipAddress}</td>
                </tr>
                <tr>
                    <th>${localizer.get('PHONE_NUMBER')}</th>
                    <td>${U.formatUSPhone((data.isDidExisting && data.existingNumber) ? data.existingNumber : data.phoneNumber)}</td>
                </tr>
                ${temporaryPhoneHtml}
            </tbody>
          </table>
            ${Buffer.byteLength(usersTableSummary, 'utf8') > 8000 || (config.IPOFFICE && config.IPOFFICE.ADMIN_URL && config.IPOFFICE.ADMIN_USERNAME) ? '' : usersTableSummary}
          `;

      let tempNumber = '';
      for (let item of purchasedPlan.items) {
        if (item.level == 0 && item.metadata && item.metadata.tempPhoneNumber) {
          tempNumber = item.metadata.tempPhoneNumber.phone_number;
          break;
        }
      }

      const msaEmailConfig = {
        requestId: options.requestId,
        toEmail: emailTemplater.criEmail.restriction.toEmail,
        MSA: "",
        bcc: emailTemplater.criEmail.restriction.bcc,
        language: sendgrid.defaultEmailLang,
        companyName: purchasedPlan.company.name,
        confirmationNumber: purchasedPlan.confirmationNumber,
        shippingAddress: purchasedPlan.shippingAddress.address1,
        shippingCity: purchasedPlan.shippingAddress.city,
        shippingPostalCode: purchasedPlan.shippingAddress.zip,
        shippingStateProvince: purchasedPlan.shippingAddress.state,
        shippingCountry: purchasedPlan.shippingAddress.country,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.username,
        phoneNumber: purchasedPlan.contact.phone,
        summary,
        notes: purchasedPlan.notes
      };

      const emailConfig = await getPartnerEmailConfig(data.purchasedPlan.partner, emailTemplater, options);
      msaEmailConfig.toEmail = emailConfig.toEmail;
      msaEmailConfig.MSA = emailConfig.companyName;
      msaEmailConfig.bcc = emailConfig.bcc;

      if (emailConfig.deviceProvisioningSchema) {
        const shippingMethod = 'Provision-Avaya-Ground';
        try {
          //Max CSV buffer size of 1MB
          const maxBufferSize = 1000000;
          msaEmailConfig.fileBuffer = Buffer.alloc(maxBufferSize);
          let byteswritten = msaEmailConfig.fileBuffer.write(Utils.replaceAll(emailConfig.deviceProvisioningSchema, {
            "${ConfirmationNumber}": purchasedPlan.confirmationNumber,
            "${CompanyName}": purchasedPlan.company.name,
            "${Address1}": purchasedPlan.shippingAddress.address1,
            "${City}": purchasedPlan.shippingAddress.city,
            "${Province}": purchasedPlan.shippingAddress.state,
            "${PostalCode}": purchasedPlan.shippingAddress.zip,
            "${Country}": purchasedPlan.shippingAddress.country,
            "${ContactName}": (user.firstName + ' ' + user.lastName),
            "${ContactPhoneNumber}": U.formatUSPhone(purchasedPlan.contact.phone),
            "${ContactEmail}": user.username,
            "${Notes}": purchasedPlan.notes,
            "${ShippingMethod}": shippingMethod,
            "${HostName}": data.ipOffice.hostName || NAinformationLabel,
            "${IPAddress}": data.ipOffice.ipAddress || NAinformationLabel,
            "${DID}": U.formatUSPhone(data.isDidExisting ? data.existingNumber : data.phoneNumber),
            "${TEMPDID}": U.formatUSPhone(tempNumber),
            "${Users}": csvUsers
          }));
          if (byteswritten == maxBufferSize) {
            msaEmailConfig.fileBuffer = null;
            logger.error(fn, 'File too large to write');
          } else {
            msaEmailConfig.fileBuffer = msaEmailConfig.fileBuffer.slice(0, byteswritten).toString('base64');
            msaEmailConfig.fileName = emailConfig.deviceProvisioningFileName || "Purchase Order Required Information.csv";
          }
        } catch (e) {
          logger.error(fn, 'Buffer exception: ', e);
        }
      }
      logger.info(fn, ':msaEmailConfig', JSON.stringify(msaEmailConfig));

      await sendgrid.sendDeviceProvisioningEmail(msaEmailConfig);

      logger.info(fn, '[success]');
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
