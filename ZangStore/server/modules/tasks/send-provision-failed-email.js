const ns = '[global][tasks][send-provision-failed-email]';
const logger = require('applogger');
const config = require('../../../config');

const handler = (src, data, cb) => {
  const fn = `[${src.requestId}]${ns}[processEvent]`;
  const U = require('../../modules/utils');
  const constants = require('../../../config/constants');
  const _ = require('lodash');

  logger.info(fn, 'started, data:', data);

  const purchasedPlanId = data.purchasedPlanId;

  const options = {
    requestId: src.requestId,
    baseUrl: data.baseUrl,
    region: data && data.region && data.region.toUpperCase() || 'US'
  };

  let purchasedPlan, html, localizer;

  U.P()
  .then(async() =>  {
      const { PurchasedPlanBackend } = require('../../purchased-plan/purchased-plan.backend');

      purchasedPlan = await PurchasedPlanBackend.findOneById(purchasedPlanId, options);

      logger.info(fn, 'purchased plan found');
  })
  .then(()  =>{
    const { template } = require('../email/templates/provisioning-failed');

    const compiled = _.template(template, {
        imports: {
          L: localizer,
          LV: (val) =>
            (val && val.resource) ?
            localizer.get(val.resource) :
            ((val && val.text) ? val.text : ''),
        },
    });

    html = compiled({
        confirmationNumber: purchasedPlan.confirmationNumber,
        planUrl: `${options.baseUrl}/purchased-plans/${purchasedPlanId}`
    });

    logger.info(fn, 'html generated');
  })
  .then(async() =>  {
    const sendgrid = require('../email/sendgrid');
    
    const setup = {
        requestId: options.requestId,
        toEmail: config.environment == 'production' ? (options.region == 'DE' ? constants.SUPPORT_EMAILS.GSMB_SUPPORT : constants.SUPPORT_EMAILS.CLOUD_SUPPORT) : config.currentDeveloperEmails,
        subject: 'Provisioning Failed',
        summary: html,
        year: new Date().getUTCFullYear(),
        region: options.region
    };

    await sendgrid.sendGenericEmail(setup);

    logger.info(fn, 'email sent');
  })
  .then(() => {
    logger.info(fn, 'completed');
    cb();
  })
  .catch((err) => {
    logger.error(fn, 'Error:', err);
    cb(err);
  })
};

module.exports = handler;
