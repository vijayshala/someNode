const ns = '[event.hooks.validate-quote]';
const logger = require('applogger');
const { RegionBackend } = require('../../../region/region.backend');
const { VIOLATIONS, ErrorMessage, BadRequestError, ValidationError } = require('../../error');

const MAX_CART_ITEMS = 200;

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const emitter = this;
  const U = require('../../utils');
  let payload = context.quote;
  let currentRegion = context.currentRegion;
  let region = (context.currentRegion.countryISO ? context.currentRegion.countryISO : 'US');
  let gateway = (region == 'DE' ? 'NATIVE' : 'AVALARA');
  // logger.info(fn, 'started', '-----------context', context);
  if (!payload) {
    return next(new BadRequestError('Cannot find cart or order payload'));
  }

  let req = {
    requestId: context.requestId,
  };

  let errors = [];

  U.P()
    .then(async() => {
      // let currentRegion = await RegionBackend.findByCode(payload.region || 'US');
      // ======================================================
      // BILLING ADDRESS
      if (!payload.billingAddress || !payload.billingAddress.address1) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
          text: 'Billing address is required',
          resource: ['VIOLATION.FIELD_IS_EMPTY2', 'BILLING_INFORMATION', 'ADDRESS'],
        }, 'billingAddress.address1'));
      }
      if (!payload.billingAddress || !payload.billingAddress.city) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
          text: 'Billing address (city) is required',
          resource: ['VIOLATION.FIELD_IS_EMPTY2', 'BILLING_INFORMATION', 'CITY'],
        }, 'billingAddress.city'));
      }
      if ((currentRegion.addressFormClass == 0 || currentRegion.addressFormClass == 1)
      && (!payload.billingAddress || !payload.billingAddress.state)) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
          text: 'Billing address (state/province) is required',
          resource: ['VIOLATION.FIELD_IS_EMPTY2', 'BILLING_INFORMATION', 'STATE_PROVINCE'],
        }, 'billingAddress.state'));
      }
      if (!payload.billingAddress || !payload.billingAddress.zip) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
          text: 'Billing address (zip/postal) is required',
          resource: ['VIOLATION.FIELD_IS_EMPTY2', 'BILLING_INFORMATION', 'ZIP_POSTAL_CODE'],
        }, 'billingAddress.zip'));
      }
      if (!payload.billingAddress || !payload.billingAddress.country) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
          text: 'Billing address (country) is required',
          resource: ['VIOLATION.FIELD_IS_EMPTY2', 'BILLING_INFORMATION', 'COUNTRY'],
        }, 'billingAddress.country'));
      }

      // ======================================================
      // SHIPPING ADDRESS
      // FIXME: do we always need shipping address?
      if (!payload.shippingAddress || !payload.shippingAddress.address1) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
          text: 'Shipping address is required',
          resource: ['VIOLATION.FIELD_IS_EMPTY2', 'SHIPPING_INFORMATION', 'ADDRESS'],
        }, 'shippingAddress.address1'));
      }
      if (!payload.shippingAddress || !payload.shippingAddress.city) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
          text: 'Shipping address (city) is required',
          resource: ['VIOLATION.FIELD_IS_EMPTY2', 'SHIPPING_INFORMATION', 'CITY'],
        }, 'shippingAddress.city'));
      }
      if ((currentRegion.addressFormClass == 0 || currentRegion.addressFormClass == 1)
      && (!payload.shippingAddress || !payload.shippingAddress.state)) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
          text: 'Shipping address (state/province) is required',
          resource: ['VIOLATION.FIELD_IS_EMPTY2', 'SHIPPING_INFORMATION', 'STATE_PROVINCE'],
        }, 'shippingAddress.state'));
      }
      if (!payload.shippingAddress || !payload.shippingAddress.zip) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
          text: 'Shipping address (zip/postal) is required',
          resource: ['VIOLATION.FIELD_IS_EMPTY2', 'SHIPPING_INFORMATION', 'ZIP_POSTAL_CODE'],
        }, 'shippingAddress.zip'));
      }
      if (!payload.shippingAddress || !payload.shippingAddress.country) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
          text: 'Shipping address (country) is required',
          resource: ['VIOLATION.FIELD_IS_EMPTY2', 'SHIPPING_INFORMATION', 'COUNTRY'],
        }, 'shippingAddress.country'));
      }

      // ======================================================
      // COMPANY
      // FIXME: should we validate company here? or by product
      if (!payload.company || !payload.company.name) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
          text: 'Company is required',
          resource: ['VIOLATION.FIELD_IS_EMPTY', 'COMPANY_NAME'],
        }, 'company.name'));
      }
      if (!payload.company || !payload.company.domain) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
          text: 'Company domain is required',
          resource: ['VIOLATION.FIELD_IS_EMPTY', 'COMPANY_DOMAIN'],
        }, 'company.domain'));
      }

    //   // ======================================================
    //   // LEGAL DOCUMENTS CONSENT
    //   let consents = {};
    //   if (payload.legalDocumentConsents) {
    //     for (let consent of payload.legalDocumentConsents) {
    //       consents[consent.identifier] = consent.consent;
    //     }
    //   }
    //   for (let item of payload.items) {
    //     if (!item.legalDocuments || !item.legalDocuments.length) {
    //       continue;
    //     }

    //     for (let doc of item.legalDocuments) {
    //       if (!consents[doc.identifier]) {
    //         errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
    //           text: `You must read and agree to the "${doc.title.text}"`,
    //           resource: ['VIOLATION.AGREE_ON_LEGAL_DOC', doc.title.resource || doc.title.text],
    //         }, `legalDocumentConsents[${doc.identifier}]`));
    //       }
    //     }
    //   }

    //   // ======================================================
    //   // PAYMENT METHOD
    //   if (!payload.payment || !payload.payment.billingEngine) {
    //     errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
    //       text: 'Payment method is required',
    //       resource: ['VIOLATION.FIELD_IS_EMPTY', 'PAYMENT_METHOD'],
    //     }, 'payment.billingEngine'));
    //   } else if (payload.payment.billingEngine === PAYMENT_GATEWAYS.STRIPE) {
    //     if (!payload.payment.metadata) {
    //       errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
    //         text: 'Payment information is required',
    //         resource: ['VIOLATION.FIELD_IS_EMPTY', 'PAYMENT_METHOD'],
    //       }, 'payment.metadata'));
    //     } else if (payload.payment.metadata.paymentType === STRIPE_OBJECTS.card) {
    //       if (!payload.payment.metadata.customerId || !payload.payment.metadata.sourceId) {
    //         errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
    //           text: 'Credit card is required.',
    //           resource: ['VIOLATION.FIELD_IS_EMPTY', 'CREDIT_CARD'],
    //         }, 'payment.metadata.sourceId'));
    //       }
    //     } else {
    //       errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
    //         text: 'Payment method is required',
    //         resource: ['VIOLATION.FIELD_IS_EMPTY', 'PAYMENT_METHOD'],
    //       }, 'payment.metadata.paymentType'));
    //     }
    //   } else {
    //     errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
    //       text: `Unknown payment method ${payload.payment.billingEngine}`,
    //       resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'PAYMENT_METHOD', payload.payment.billingEngine],
    //     }, 'payment.billingEngine'));
    //   }
    //   if (!payload.billingAccountId) {
    //     errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
    //       text: 'Billing account is required',
    //       resource: ['VIOLATION.FIELD_IS_EMPTY', 'Billing Account'],
    //     }, 'billingAccountId'));
    //   }

      // ======================================================
      // CART SIZR
      if (!payload.items || !payload.items.length) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.QUOTE_IS_EMPTY, {
          text: 'Quote is empty',
          resource: ['VIOLATION.QUOTE_IS_EMPTY'],
        }, 'items'));
      }
      if (payload.items && payload.items.length && payload.items.length > MAX_CART_ITEMS) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.QUOTE_IS_TOO_BIG, {
          text: 'Quote has too many items',
          resource: ['VIOLATION.QUOTE_IS_TOO_BIG', MAX_CART_ITEMS],
        }, 'items'));
      }
    })
    .then(async() => {
      const { VerifyAddress } = require('../../../billing/Tax');

      const billingAddressCombined = JSON.stringify(payload.billingAddress);
      const shippingAddressCombined = JSON.stringify(payload.shippingAddress);
//if ((currentRegion.addressFormClass == 0 || currentRegion.addressFormClass == 1)
      if (payload.billingAddress && payload.billingAddress.address1) {
        try {
          const addressResult = await VerifyAddress(req, payload.billingAddress, region);
          logger.info(fn, 'verify billing address ok:', addressResult);
        } catch (err) {
          logger.error(fn, 'verify billing address failed:', err);
          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
            text: 'Billing address is invalid',
            resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'BILLING_INFORMATION', 'ADDRESS'],
          }, 'billingAddress.address1'));

          if (shippingAddressCombined === billingAddressCombined) {
            // do not check again
            errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
              text: 'Shipping address is invalid',
              resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'SHIPPING_INFORMATION', 'ADDRESS'],
            }, 'shippingAddress.address1'));
          }
        }
      }

      if (payload.shippingAddress && payload.shippingAddress.address1 && shippingAddressCombined !== billingAddressCombined) {
        try {
          const addressResult = await VerifyAddress(req, payload.shippingAddress, region);
          logger.info(fn, 'verify shipping address ok:', addressResult);
        } catch (err) {
          logger.error(fn, 'verify shipping address failed:', err);
          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
            text: 'Shipping address is invalid',
            resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'SHIPPING_INFORMATION', 'ADDRESS'],
          }, 'shippingAddress.address1'));
        }
      }
    })
    .then(async() => {
      // check partner if exists
      if (!payload.partner) {
        return;
      }

      const { PartnerBackend } = require('../../../partner/partner.backend');
      const valid = await PartnerBackend.isValid(payload.partner, currentRegion.shortCode, req);
      if (!valid) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
          text: 'Agent is invalid',
          resource: ['VIOLATION.FIELD_VALUE_INVALID', 'AGENT'],
        }, 'partner'));
      }
    })
    .then(() => {
      // ======================================================
      // prepare to return errors
      if (errors.length > 0) {
        logger.info(fn, 'found validation violations:', JSON.stringify(errors));
        emitter.importWarnings(context.event, errors);
      } else {
        logger.info(fn, 'no violations');
      }
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
