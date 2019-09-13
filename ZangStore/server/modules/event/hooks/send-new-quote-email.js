const ns = '[event.hooks.send-new-quote-email]';
const logger = require('applogger');

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const { BadRequestError } = require('../../error');
  const U = require('../../utils');
  const currencyFormatter = require('currency-formatter');
  const { generateSubscriptionIdentifier } = require('../../cart-salesmodel-rules/utils');
  const sendgrid = require('../../../modules/email/sendgrid');
  const constants = require('../../../../config/constants');
  const { PartnerAgentBackend } = require('../../../partner/partner-agent.backend');
  const _ = require('lodash');
  let quote = context.quote;

  logger.info(fn, 'started', 'quote id=', quote && quote._id);
  if (!quote) {
    return next(new BadRequestError('Cannot find quote payload'));
  }

  U.P()
    .then(async() => {
      // send subscription email
      const { template } = require('../../email/templates/quote-invite-email');
      const compiled = _.template(template, {
        imports: {
          currency: (val) => currencyFormatter.format(val, { code: quote.currency, format: '%s %v' }),
          generateSubscriptionIdentifier: generateSubscriptionIdentifier,
          L: context.localizer,
          LV: (val) =>
            (val && val.resource) ?
            context.localizer.get(val.resource) :
            ((val && val.text) ? val.text : ''),
        },
      });

      let product = quote.items && quote.items[0] && quote.items[0].title && quote.items[0].title;
      let productName = (product && (product.resource && context.localizer.get(product.resource)) || product.text) || '';
      let partnerAgentUser = await PartnerAgentBackend.findAgentWithUserInfo(quote.partnerAgent);

      const summary = compiled({
        quote,
        hasOneTimeCharge: false,
        partnerAgentUser,        
        hasProvisioning: true,
        withExtraInfo: false, // FIXME
        details: { extraInfo: [] }, // FIXME
        supportEmail: (context.currentRegion.countryISO == 'DE' ? constants.SUPPORT_EMAILS.GSMB_SUPPORT : constants.SUPPORT_EMAILS.CLOUD_CS), // FIXME
        region:  context.currentRegion.countryISO
      });

      //from info should be the Agent info in the 

      const result = await sendgrid.sendQuoteEmail({
        requestId: context.requestId,
        language: context.user.language,
        quoteId: quote._id,
        firstName: quote.contact.firstName,
        lastName: quote.contact.lastName,
        email: quote.contact.email,
        phoneNumber: quote.contact.phone,
        companyName: quote.company.name,
        partnerAgentUser,
        productName,
        confirmationType: 'Subscriptions',
        quoteNumber: quote.quoteNumber,        
        notes: quote.notes,

        // shippingAddress: quote.shippingAddress.address1,
        // shippingCountry: quote.shippingAddress.country,
        // shippingCity: quote.shippingAddress.city,
        // shippingStateProvince: quote.shippingAddress.state,
        // shippingPostalCode: quote.shippingAddress.zip,

        billingAddress: quote.billingAddress.address1,
        billingCountry: quote.billingAddress.country,
        billingCity: quote.billingAddress.city,
        billingStateProvince: quote.billingAddress.state,
        billingPostalCode: quote.billingAddress.zip,

        baseUrl: context.baseUrl,

        summary,
      });

      logger.info(fn, `subscription email sent`, result);
    })
    // .then(async() => {
    //   // send one time email
    //   let hasOneTimeProducts = false;
    //   for (let item of order.items) {
    //     if (item.isOneTimeCharge) {
    //       hasOneTimeProducts = true;
    //       break;
    //     }
    //   }
    //   if (!hasOneTimeProducts) {
    //     logger.info(fn, 'no one time product, skipped');
    //     return;
    //   }

    //   const { template } = require('../../email/templates/order-confirmation-onetime');
    //   const compiled = _.template(template, {
    //     imports: {
    //       currency: (val) => currencyFormatter.format(val, { code: order.currency }),
    //       L: context.localizer,
    //       LV: (val) =>
    //         (val && val.resource) ?
    //         context.localizer.get(val.resource) :
    //         ((val && val.text) ? val.text : ''),
    //     },
    //   });

    //   let product = order.items && order.items[0] && order.items[0].title && order.items[0].title;
    //   let productName = (product && (product.resource && context.localizer.get(product.resource)) || product.text) || '';

    //   const summary = compiled({
    //     order,
    //     hasProvisioning: true,
    //     withExtraInfo: false, // FIXME
    //     details: { extraInfo: [] }, // FIXME
    //     supportEmail: constants.SUPPORT_EMAILS.IP_OFFICE_CS, // FIXME
    //   });

    //   const result = await sendgrid.sendOrderEmail({
    //     language: context.user.language,

    //     firstName: order.contact.firstName,
    //     lastName: order.contact.lastName,
    //     email: order.contact.email,
    //     phoneNumber: order.contact.phone,
    //     companyName: order.company.name,

    //     productName,
    //     confirmationType: context.localizer.get('ONE_TIME'),
    //     confirmationNumber: order.confirmationNumber,
    //     notes: order.notes,

    //     shippingAddress: order.shippingAddress.address1,
    //     shippingCountry: order.shippingAddress.country,
    //     shippingCity: order.shippingAddress.city,
    //     shippingStateProvince: order.shippingAddress.state,
    //     shippingPostalCode: order.shippingAddress.zip,

    //     billingAddress: order.billingAddress.address1,
    //     billingCountry: order.billingAddress.country,
    //     billingCity: order.billingAddress.city,
    //     billingStateProvince: order.billingAddress.state,
    //     billingPostalCode: order.billingAddress.zip,

    //     summary,
    //   });

    //   logger.info(fn, 'one time email sent', result);
    // })
    .then(() => {
      next();
    })
    .catch((err) => {
      logger.error(fn, 'Error:', err);
      next(err);
    });
};

module.exports = processEvent;