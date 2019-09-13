const ns = '[event.hooks.validate-cart]';
const logger = require('applogger');

const { VIOLATIONS, ErrorMessage, BadRequestError, ValidationError } = require('../../error');
const { RegionBackend } = require('../../../region/region.backend');
const MAX_CART_ITEMS = 200;

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const emitter = this;
  const U = require('../../utils');
  const _ = require('lodash');
  const { PAYMENT_GATEWAYS, STRIPE_OBJECTS } = require('../../../billing/Constants');
  const { isStripeGateway } = require('../../../billing/integrations/stripe');
  let payload = context.order || context.cart;
  let currentRegion = context.currentRegion;

  logger.info(fn, 'started', 'payload id=', payload && payload._id);
  if (!payload) {
    return next(new BadRequestError('Cannot find cart or order payload'));
  }

  let req = {
    requestId: context.requestId,
  };

  let errors = [];

  U.P()
    .then(async () => {
      if (!payload.contact || !payload.contact.firstName) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
            text: 'Contact first name is required',
            resource: ['VIOLATION.FIELD_IS_EMPTY2', 'CONTACT', 'FIRST_NAME'],
        }, 'contact.firstName'));
      }
      if (!payload.contact || !payload.contact.lastName) {
          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
              text: 'Contact last name is required',
              resource: ['VIOLATION.FIELD_IS_EMPTY2', 'CONTACT', 'LAST_NAME'],
          }, 'contact.lastName'));
      }
      if (!payload.contact || !payload.contact.phone) {
          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
              text: 'Contact phone is required',
              resource: ['VIOLATION.FIELD_IS_EMPTY2', 'CONTACT', 'PHONE'],
          }, 'contact.phone'));
      }
      if (!payload.contact || !payload.contact.email) {
          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
              text: 'Contact email is required',
              resource: ['VIOLATION.FIELD_IS_EMPTY2', 'CONTACT', 'EMAIL'],
          }, 'contact.email'));
      }
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
      if (payload.region.toUpperCase() == 'DE')  {
        if (!payload.shippingAddress || !payload.shippingAddress.addressee) {
          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
            text: 'Shipping addressee is required',
            resource: ['VIOLATION.FIELD_IS_EMPTY2', 'SHIPPING_INFORMATION', 'ADDRESSEE'],
          }, 'shippingAddress.addressee'));
        }
      }
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
      if (!payload.region || payload.region.toUpperCase() !== 'DE' && (!payload.company || !_.isBoolean(payload.company.isIncorporated))) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
          text: 'Company is incorporated is required',
          resource: ['VIOLATION.FIELD_IS_EMPTY', 'COMPANY_IS_INCORPORATED'],
        }, 'company.isIncorporated'));
      }
      if (payload.region && payload.region.toUpperCase() === 'DE')  {
        if (!payload.billingAddress || !payload.billingAddress.email) {
          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
              text: 'Billing email is required',
              resource: ['VIOLATION.FIELD_IS_EMPTY2', 'BILLING_INFORMATION', 'EMAIL'],
          }, 'billingAddress.email'));
        }
        if (!payload.billingAddress || !payload.billingAddress.addressee) {
          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
            text: 'Billing addressee is required',
            resource: ['VIOLATION.FIELD_IS_EMPTY2', 'BILLING_INFORMATION', 'ADDRESSEE'],
          }, 'billingAddress.addressee'));
        }
        if (!payload.company || !payload.company.address1) {
          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
            text: 'Company address1 is required',
            resource: ['VIOLATION.FIELD_IS_EMPTY2', 'ACCOUNT_INFORMATION', 'ADDRESS1'],
          }, 'company.address1'));
        }
        if ((currentRegion.addressFormClass == 0 || currentRegion.addressFormClass == 1)
          && (!payload.company || !payload.company.state)) {
          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
            text: 'Company address (state/province) is required',
            resource: ['VIOLATION.FIELD_IS_EMPTY2', 'ACCOUNT_INFORMATION', 'STATE_PROVINCE'],
          }, 'company.state'));
        }
        if (!payload.company || !payload.company.city) {
          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
            text: 'Company city is required',
            resource: ['VIOLATION.FIELD_IS_EMPTY2', 'ACCOUNT_INFORMATION', 'CITY'],
          }, 'company.city'));
        }
        if (!payload.company || !payload.company.zip) {
          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
            text: 'Company zip is required',
            resource: ['VIOLATION.FIELD_IS_EMPTY2', 'ACCOUNT_INFORMATION', 'ZIP'],
          }, 'company.zip'));
        }
        if (!payload.company || !payload.company.country) {
          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
            text: 'Company country is required',
            resource: ['VIOLATION.FIELD_IS_EMPTY2', 'ACCOUNT_INFORMATION', 'COUNTRY'],
          }, 'company.country'));
        }
        if (!payload.company || !payload.company.vatNumber)  {
          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
            text: 'Company VAT number is required',
            resource: ['VIOLATION.FIELD_IS_EMPTY', 'COMPANY_VAT_NUMBER'],
          }, 'company.vatNumber'));
        } else {
          const jsvat = require('jsvat');
          jsvat.allowed = ['DE', 'AT'];
          
          /*const vatCheck = jsvat.checkVAT(payload.company.vatNumber);
          if (!vatCheck.isValid)  {
            errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
              text: 'Company VAT number is invalid',
              resource: ['VIOLATION.FIELD_VALUE_INVALID', 'COMPANY_VAT_NUMBER'],
            }, 'company.vatNumber'));
          }
          */
        }
      }
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

      // ======================================================
      // LEGAL DOCUMENTS CONSENT
      let consents = {};
      if (payload.legalDocumentConsents) {
        for (let consent of payload.legalDocumentConsents) {
          consents[consent.identifier] = consent.consent;
        }
      }
      for (let item of payload.items) {
        if (!item.legalDocuments || !item.legalDocuments.length) {
          continue;
        }

        for (let doc of item.legalDocuments) {
          if (!consents[doc.identifier]) {
            errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
              text: `You must read and agree to the "${doc.title.text}"`,
              resource: ['VIOLATION.AGREE_ON_LEGAL_DOC', doc.title.resource || doc.title.text],
            }, `legalDocumentConsents[${doc.identifier}]`));
          }
        }
      }

      // ======================================================
      // PAYMENT METHOD
      if (payload.payment) {
        if (payload.region.toUpperCase() == 'DE' && payload.payment.billingEngine != PAYMENT_GATEWAYS.GSMB
          || payload.region.toUpperCase() != 'DE' && payload.payment.billingEngine == PAYMENT_GATEWAYS.GSMB) {
            errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
              text: 'Billing engine is invalid',
              resource: ['VIOLATION.FIELD_VALUE_INVALID', 'PAYMENT_METHOD'],
            }, 'payment.billingEngine'));
        }
      }
      if (!payload.payment || !payload.payment.billingEngine) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
          text: 'Payment method is required',
          resource: ['VIOLATION.FIELD_IS_EMPTY', 'PAYMENT_METHOD'],
        }, 'payment.billingEngine'));
      } else if (isStripeGateway(payload.payment.billingEngine)) {
        if (!payload.payment.metadata) {
          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
            text: 'Payment information is required',
            resource: ['VIOLATION.FIELD_IS_EMPTY', 'PAYMENT_METHOD'],
          }, 'payment.metadata'));
        } else if (payload.payment.metadata.paymentType === STRIPE_OBJECTS.card) {
          if (!payload.payment.metadata.customerId || !payload.payment.metadata.sourceId) {
            errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
              text: 'Credit card is required.',
              resource: ['VIOLATION.FIELD_IS_EMPTY', 'CREDIT_CARD'],
            }, 'payment.metadata.sourceId'));
          }
        } else {
          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
            text: 'Payment method is required',
            resource: ['VIOLATION.FIELD_IS_EMPTY', 'PAYMENT_METHOD'],
          }, 'payment.metadata.paymentType'));
        }
      } else if (payload.payment.billingEngine === PAYMENT_GATEWAYS.NATIVE) {
        if (!payload.payment.metadata) {
          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
            text: 'Payment information is required',
            resource: ['VIOLATION.FIELD_IS_EMPTY', 'PAYMENT_METHOD'],
          }, 'payment.metadata'));
        } else if (!payload.payment.metadata.purchaseOrder)  {
          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
            text: 'Purchase order is required.',
            resource: ['VIOLATION.FIELD_IS_EMPTY', 'PURCHASE_ORDER'],
          }, 'payment.metadata.purchaseOrder'));
        } else {
          const purchaseOrder = payload.payment.metadata.purchaseOrder;
          if (!purchaseOrder.billingAddress || !purchaseOrder.billingAddress.address1) {
            errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
                text: 'Billing address is required',
                resource: ['VIOLATION.FIELD_IS_EMPTY2', 'BILLING_INFORMATION', 'ADDRESS'],
            }, 'billingAddress.address1'));
          }
          if (!purchaseOrder.billingAddress || !purchaseOrder.billingAddress.city) {
              errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
                  text: 'Billing address (city) is required',
                  resource: ['VIOLATION.FIELD_IS_EMPTY2', 'BILLING_INFORMATION', 'CITY'],
              }, 'billingAddress.city'));
          }
          if ((currentRegion.addressFormClass == 0 || currentRegion.addressFormClass == 1)
          && (!purchaseOrder.billingAddress || !purchaseOrder.billingAddress.state)) {
              errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
                  text: 'Billing address (state/province) is required',
                  resource: ['VIOLATION.FIELD_IS_EMPTY2', 'BILLING_INFORMATION', 'STATE_PROVINCE'],
              }, 'billingAddress.state'));
          }
          if (!purchaseOrder.billingAddress || !purchaseOrder.billingAddress.zip) {
              errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
                  text: 'Billing address (zip/postal) is required',
                  resource: ['VIOLATION.FIELD_IS_EMPTY2', 'BILLING_INFORMATION', 'ZIP_POSTAL_CODE'],
              }, 'billingAddress.zip'));
          }
          if (!purchaseOrder.billingAddress || !purchaseOrder.billingAddress.country) {
              errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
                  text: 'Billing address (country) is required',
                  resource: ['VIOLATION.FIELD_IS_EMPTY2', 'BILLING_INFORMATION', 'COUNTRY'],
              }, 'billingAddress.country'));
          }
          if (!purchaseOrder.company || !purchaseOrder.company.name) {
              errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
                  text: 'Company name is required',
                  resource: ['VIOLATION.FIELD_IS_EMPTY2', 'COMPANY', 'NAME'],
              }, 'company.name'));
          }
          if (!purchaseOrder.company || !_.isBoolean(purchaseOrder.company.isIncorporated)) {
              errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
                  text: 'Company incorporation is required',
                  resource: ['VIOLATION.FIELD_IS_EMPTY2', 'COMPANY', 'IS_INCORPORATED'],
              }, 'company.isIncorporated'));
          }
          if (!purchaseOrder.contact || !purchaseOrder.contact.firstName) {
              errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
                  text: 'Contact first name is required',
                  resource: ['VIOLATION.FIELD_IS_EMPTY2', 'CONTACT', 'FIRST_NAME'],
              }, 'contact.firstName'));
          }
          if (!purchaseOrder.contact || !purchaseOrder.contact.lastName) {
              errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
                  text: 'Contact last name is required',
                  resource: ['VIOLATION.FIELD_IS_EMPTY2', 'CONTACT', 'LAST_NAME'],
              }, 'contact.lastName'));
          }
          if (!purchaseOrder.contact || !purchaseOrder.contact.phone) {
              errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
                  text: 'Contact phone is required',
                  resource: ['VIOLATION.FIELD_IS_EMPTY2', 'CONTACT', 'PHONE'],
              }, 'contact.phone'));
          }
          if (!purchaseOrder.contact || !purchaseOrder.contact.email) {
              errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
                  text: 'Contact email is required',
                  resource: ['VIOLATION.FIELD_IS_EMPTY2', 'CONTACT', 'EMAIL'],
              }, 'contact.email'));
          }
        }
      } else if (payload.payment.billingEngine === PAYMENT_GATEWAYS.GSMB) {
        if (!payload.payment.metadata) {
          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
            text: 'Payment information is required',
            resource: ['VIOLATION.FIELD_IS_EMPTY', 'PAYMENT_METHOD'],
          }, 'payment.metadata'));
        } else {
          const iban = payload.payment.metadata.IBAN;
          const IBANAuthorization = payload.payment.metadata.IBANAuthorization;
          const IBAN = require('iban');

          if (!iban)  {
            errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
                text: 'IBAN is required',
                resource: ['VIOLATION.FIELD_IS_EMPTY', 'IBAN'],
            }, 'IBAN'));
          }
          if (!IBAN.isValid(iban))  {
            errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
                text: 'IBAN is invalid',
                resource: ['VIOLATION.FIELD_VALUE_INVALID', 'IBAN'],
            }, 'IBAN'));
          }
          if (!IBANAuthorization) {
            errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
              text: 'IBAN Authorization is required',
              resource: ['VIOLATION.FIELD_VALUE_INVALID', 'IBANAuthorization'],
            }, 'IBANAuthorization'));
          }
        }
      } else {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
          text: `Unknown payment method ${payload.payment.billingEngine}`,
          resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'PAYMENT_METHOD', payload.payment.billingEngine],
        }, 'payment.billingEngine'));
      }
      if (!payload.billingAccountId) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
          text: 'Billing account is required',
          resource: ['VIOLATION.FIELD_IS_EMPTY', 'Billing Account'],
        }, 'billingAccountId'));
      }

      // ======================================================
      // CART SIZR
      if (!payload.items || !payload.items.length) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.CART_IS_EMPTY, {
          text: 'Cart is empty',
          resource: ['VIOLATION.CART_IS_EMPTY'],
        }, 'items'));
      }
      if (payload.items && payload.items.length && payload.items.length > MAX_CART_ITEMS) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.CART_IS_TOO_BIG, {
          text: 'Cart has too many items',
          resource: ['VIOLATION.CART_IS_TOO_BIG', MAX_CART_ITEMS],
        }, 'items'));
      }
    })
    .then(() =>  {
      const { isValidRegion } = require('../../../region/region.constants');

      if (!isValidRegion(currentRegion.shortCode))  {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
          text: 'This region is not supported',
          resource: ['VIOLATION.FIELD_VALUE_INVALID', 'REGION'],
        }, 'region'));
      }
    })
    .then(() => {
      // ======================================================
      // prepare to return errors
      if (errors.length > 0) {
        logger.info(fn, 'found validation violations:', JSON.stringify(errors));

        if (context.order) {
          // this is not accepted, throw error and stop events
          throw new ValidationError(null, errors);
        } else if (context.cart) {
          // treat all as warnings
          emitter.importWarnings(context.event, errors);
        }
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
