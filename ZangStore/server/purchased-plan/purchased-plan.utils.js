const ns = '[order.utils]';
const logger = require('applogger');
const config = require('../../config');

const CreateContractNumber = () => {
  var rand = 'xxxyxxxx-xxyyxx-'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  var d = new Date().getTime().toString();
  d = d.slice(-8)
  var str = rand + d;
  return str.toUpperCase();
};

const RequestCancelEmail = async(purchasedPlan, options) =>  {
  const fn = `[${options.requestId}]${ns}[RequestCancel]`;
  const _ = require('lodash');
  const { template } = require('../modules/email/templates/purchased-plan-cancel-request');
  const sendgrid = require('../modules/email/sendgrid');
  const globalconstants = require('../../config/constants');

  const compiled = _.template(template, {
      imports: {
          L: options.localizer,
          LV: (val) =>
          (val && val.resource) ?
          options.localizer.get(val.resource) :
          ((val && val.text) ? val.text : ''),
      },
  });

  const summary = compiled({
    purchased_plan_url: `${options.baseUrl}/purchased-plans/${purchasedPlan._id}`,
    order: purchasedPlan,
    withExtraInfo: false,
    details: { extraInfo: [] }, // FIXME
  });

  const region =  options.region.toUpperCase();

  await sendgrid.sendGenericEmail({
    requestId: options.requestId,

    language: 'en-US',

    toEmail: config.environment == 'production' ? (region == 'DE' ? globalconstants.SUPPORT_EMAILS.GSMB_SUPPORT : globalconstants.SUPPORT_EMAILS.CLOUD_CS) : config.currentDeveloperEmails,

    subject: 'Plan Cancellation Requested',

    summary,
    region
  });

  logger.info(fn, 'email sent');
};

const CanceledEmail = async(purchasedPlan, options) =>  {
  const fn = `[${options.requestId}]${ns}[CancellledEmail]`;
  const _ = require('lodash');
  const { template } = require('../modules/email/templates/purchased-plan-canceled');
  const currencyFormatter = require('currency-formatter');
  const sendgrid = require('../modules/email/sendgrid');
  const { generateSubscriptionIdentifier } = require('../modules/cart-salesmodel-rules/utils');
  const globalconstants = require('../../config/constants');

  const compiled = _.template(template, {
      imports: {
          L: options.localizer,
          currency: (val) => currencyFormatter.format(val, { code: purchasedPlan.currency }),
          generateSubscriptionIdentifier: generateSubscriptionIdentifier,
          LV: (val) =>
          (val && val.resource) ?
          options.localizer.get(val.resource) :
          ((val && val.text) ? val.text : ''),
      },
  });

  const summary = compiled({
    order: purchasedPlan,
    withExtraInfo: false,
    details: { extraInfo: [] }, // FIXME
  });

  const region =  options.region.toUpperCase();

  await sendgrid.sendGenericEmail({
    requestId: options.requestId,

    language: 'en-US',

    toEmail: config.environment == 'production' ? (region == 'DE' ? globalconstants.SUPPORT_EMAILS.GSMB_SUPPORT : globalconstants.SUPPORT_EMAILS.CLOUD_CS) : config.currentDeveloperEmails,

    subject: 'Plan Canceled',

    summary,
    region
  });

  logger.info(fn, 'email sent');
};

module.exports = {
  CreateContractNumber,
  RequestCancelEmail,
  CanceledEmail,
};
