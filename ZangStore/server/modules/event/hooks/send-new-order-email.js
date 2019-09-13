const ns = '[event.hooks.send-new-order-email]';
const logger = require('applogger');
const fs = require('fs');

const processEvent = function (context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const { BadRequestError } = require('../../error');
  const U = require('../../utils');
  const currencyFormatter = require('currency-formatter');
  const { generateSubscriptionIdentifier } = require('../../cart-salesmodel-rules/utils');
  const sendgrid = require('../../../modules/email/sendgrid');
  const constants = require('../../../../config/constants');
  const config = require('../../../../config');
  const { PartnerAgentBackend } = require('../../../partner/partner-agent.backend');
  const { PartnerBackend } = require('../../../partner/partner.backend');
  const { asyncGetCreditCards } = require('../../../billing/PaymentMethod');
  const { getStripeAccountByRegion } = require('../../../billing/integrations/stripe');
  const { PAYMENT_GATEWAYS } = require('../../../billing/Constants');
  const _ = require('lodash');
  let order = context.order;

  let summary, newPdf, partnerAgentUser, paymentDetails, subject;

  logger.debug(fn, 'Order: ', order);

  logger.info(fn, 'started', 'order id=', order && order._id);
  if (!order) {
    return next(new BadRequestError('Cannot find order payload'));
  }

  const currentRegion = context.currentRegion;

  U.P()
    .then(async () => {
      const { template } = require('../../email/templates/consolidated-order-confirmation');
      const compiled = _.template(template, {
        imports: {
          currency: (val) => currencyFormatter.format(val, { code: order.currency, format: '%s %v' }),
          language: context.user.language,
          generateSubscriptionIdentifier: generateSubscriptionIdentifier,
          L: context.localizer,
          LV: (val) =>
            (val && val.resource) ?
              context.localizer.get(val.resource) :
              ((val && val.text) ? val.text : ''),
        },
      });

      partnerAgentUser = await PartnerAgentBackend.findAgentWithUserInfo(order.partnerAgent);
      let partnerDetails = await PartnerBackend.getOneApprovedById(order.partner, { requestId: context.requestId });
      let paymentMetaData = (order.payment && order.payment.metadata);

      if (paymentMetaData.paymentType == 'CREDIT_CARD') {
        if (paymentMetaData && paymentMetaData.creditCard) {
          paymentDetails = '( ' + paymentMetaData.creditCard.brand + ' ' + paymentMetaData.creditCard.last4 + ' )';
        } else {
          let stripe = getStripeAccountByRegion(order.region);
          let card = await asyncGetCreditCards({ requestId: context.requestId }, order.billingAccountId, stripe.gateway);
          paymentDetails = '( ' + card[0].brand + ' ' + card[0].last4 + ' )';
        }
      } else if (paymentMetaData.paymentType == 'PURCHASE_ORDER') {
        paymentDetails = '( ' + paymentMetaData.purchaseOrder.refNumber + ' )';
      } else {
        paymentDetails = '(' + paymentMetaData.IBAN + ')';
      }

      let showTos = order.items[0].legalDocuments.find(x => x.pdf != null);

      summary = compiled({
        order,
        profile_link: context.baseUrl + '/user/me/orders/', // CHANGE ME
        supportEmail: (currentRegion.countryISO == 'DE' ? constants.SUPPORT_EMAILS.GSMB_SUPPORT_ORDER : constants.SUPPORT_EMAILS.CLOUD_CS), // FIXME
        partnerAgentUser,
        partnerDetails,
        paymentDetails,
        contactName: currentRegion.countryISO == 'DE' ? order.contact.firstName + ' ' + order.contact.lastName : order.contact.firstName,
        showTos: showTos != undefined,
        region: currentRegion.countryISO
      });

    })/* 
    .then(async () => {
      const pdf = require('html-pdf');
      const { masterTemplate } = require('../../email/templates/master-template');

      var pdfOptions = {
        format: 'Letter',
        orientation: 'portrait',
        border: {
          top: '0in',
          right: '0in',
          bottom: '0in',
          left: '0in'
        },
        type: 'pdf',
        timeout: 100000   
      };
      try{
        fs.statSync('/usr/bin/phantomjs');
        pdfOptions['phantomPath'] = '/usr/bin/phantomjs';
      }
      catch(err){
        logger.error(fn,);
      }

      try{
        await new Promise((resolve, reject) => {
          pdf.create(masterTemplate(summary), pdfOptions).toBuffer((err, buffer) => {
            if (err) return reject(err);
  
            newPdf = buffer;
            resolve();
          });
        });

        logger.info(fn, 'pdf generated to buffer');
      } catch(err)  {
        logger.error(fn, 'failed to generate pdf', err);
      }
    }) */
    .then(async () => {
      let bcc = order.payment.billingEngine == PAYMENT_GATEWAYS.NATIVE && order.payment.metadata.purchaseOrder ? (config.purchaseOrderUtilityEmails || []) : [];

      // Need to bcc customer support for all orders
      if (config.environment == 'production') {
        // If region is Germany bcc GSMB Support
        if (currentRegion.countryISO == 'DE') {
          bcc.push(constants.SUPPORT_EMAILS.GSMB_SUPPORT_ORDER);
        } else {
          bcc.push(constants.SUPPORT_EMAILS.CLOUD_CS);
        }
      }

      // create the subject for DE region
      if (currentRegion.countryISO == 'DE') { 
        subject = context.localizer.get('ORDER_SUBJECT_GSMB') +  ' ' + order.confirmationNumber
      } else {
        subject = order.items[0].title.text;
      }

      const result = await sendgrid.sendGenericEmail({
        requestId: context.requestId,
        language: context.user.language,
        subject: subject,
        firstName: order.contact.firstName,
        toEmail: order.contact.email,
        /* files: newPdf ? [{
          name: 'Avaya Invoice.pdf',
          buffer: newPdf.toString('base64')
        }] : [], */
        baseUrl: context.baseUrl,
        summary,
        region: currentRegion.countryISO,
        additionalBcc: bcc,
      });

      logger.info(fn, `order email sent`, result);
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
