const { getCountryByName } = require('../../../billing/AddressUtil');

const ns = '[event.hooks.calculate-cart-tax]';
const logger = require('applogger');

const { ErrorMessage, VIOLATIONS, BadRequestError } = require('../../error');

const PrepareItems = (cart, context) => {
  const fn = `[${context.requestId}]${ns}[PrepareItems]`;
  let onetime = [];
  let recurring = {};
  const { generateSubscriptionIdentifier } = require('../../cart-salesmodel-rules/utils');

  if (cart && cart.items && cart.items.length > 0) {
    cart.items.forEach((item) => {
      if (!item.price || !item.quantity || item.quantity < 1) {
        return;
      }

      const sku = item.references && item.references.sku;

      if (!sku) {
        if (cart.region != 'DE') {
          logger.error(fn, `Cart item (${item.identifier}) doesn't have product code`);
          // ignore errors here, this is a configuration issue
          // throw new BadRequestError('Cart item doesn\'t have product code');
          return;
        }
      }

      if (item.isOneTimeCharge) {
        onetime.push({
          sku: sku,
          price: item.price,
          quantity: item.quantity,
          isDiscount: item.price < 0,
        });
      } else if (item.salesModel.subscription) {
        const subscriptionIdentifier = generateSubscriptionIdentifier(item.salesModel.subscription);
        if (!recurring[subscriptionIdentifier]) {
          recurring[subscriptionIdentifier] = [];
        }
        recurring[subscriptionIdentifier].push({
          sku: sku,
          price: item.price,
          quantity: item.quantity,
          isDiscount: item.price < 0,
        });
      } else {
        logger.error(fn, `Cart item (${item.salesModel.identifier}) doesn't have subscription defined`);
        // ignore errors here, this is a configuration issue
        // throw new BadRequestError('Cart item doesn\'t have subscription defined');
        return;
      }
    });
  } else {
    logger.info(fn, 'cart is empty');
  }

  return { onetime, recurring };
};

const processEvent = function (context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const emitter = this;
  const U = require('../../utils');
  let payload = context.order || context.cart || context.quote;
  let currentRegion = context.currentRegion;
  logger.info(fn, 'Current Region: ', currentRegion);

  let region = (currentRegion.countryISO ? currentRegion.countryISO : 'US');
  let gateway = 'NATIVE';
  if (region == 'US' || region == 'CA') {
    gateway = 'AVALARA';
  }
  let taxCodes = currentRegion.taxCodes;

  logger.info(fn, 'started', 'payload id=', payload && payload._id);
  if (!payload) {
    return next(new BadRequestError('Cannot find cart or order payload'));
  }

  if (region != 'DE' && (!payload.billingAddress ||
    !payload.billingAddress.address1 ||
    !payload.billingAddress.city ||
    // !payload.billingAddress.state ||
    !payload.billingAddress.zip ||
    !payload.billingAddress.country)) {
    // return next(new BadRequestError('Billing address, city, state, zip, or country is missing'));
    // ignore errors here, and leave it to validation rules
    logger.info(fn, 'skipped - no billing information');
    return next();
  }

  let req = {
    requestId: context.requestId,
    userInfo: context.user,
  };
  const billingAddress = {
    street: payload.billingAddress.address1,
    city: payload.billingAddress.city,
    state: payload.billingAddress.state,
    zip: payload.billingAddress.zip,
    country: payload.billingAddress.country,
    countryISO: payload.billingAddress.countryISO,
    stateISO: payload.billingAddress.stateISO
  };
  const shippingAddress = {
    street: payload.shippingAddress.address1,
    city: payload.shippingAddress.city,
    state: payload.shippingAddress.state,
    zip: payload.shippingAddress.zip,
    country: payload.shippingAddress.country,
    countryISO: payload.shippingAddress.countryISO,
    stateISO: payload.shippingAddress.stateISO
  };
  const company = {
    isIncorporated: payload.company.isIncorporated
  };
  let taxableItems;
  logger.info(fn, 'Billing Information: ', billingAddress);
  U.P()
    .then(() => {
      taxableItems = PrepareItems(payload, context);
    })
    .then(async () => {
      const { VerifyAddress } = require('../../../billing/Tax');

      const accountAddressCombined = JSON.stringify(payload.company);
      const billingAddressCombined = JSON.stringify(payload.billingAddress);
      const shippingAddressCombined = JSON.stringify(payload.shippingAddress);
      let errors = [];

      logger.info(fn, 'verify billing address start -----');

      if (payload.company && payload.company.address1)  {
        try {
          const addressResult = await VerifyAddress(req, payload.company, region);
          logger.info(fn, 'verify billing address ok:', addressResult);
        } catch (err) {
          logger.error(fn, 'verify billing address failed:', err);
          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
            text: 'Account address is invalid',
            resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'ACCOUNT_INFORMATION', 'ADDRESS'],
          }, 'company.address1'));

          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
            text: 'Account address is invalid',
            resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'ACCOUNT_INFORMATION', 'CITY'],
          }, 'company.city'));

          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
            text: 'Account address is invalid',
            resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'ACCOUNT_INFORMATION', 'ZIP_POSTAL_CODE'],
          }, 'company.zip'));

          if (currentRegion.addressFormClass == 0 || currentRegion.addressFormClass == 1) {
            errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
              text: 'Account address is invalid',
              resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'ACCOUNT_INFORMATION', 'STATE'],
            }, 'company.state'));
          }

          if (accountAddressCombined === billingAddressCombined)  {
            errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
              text: 'Billing address is invalid',
              resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'BILLING_INFORMATION', 'ADDRESS'],
            }, 'company.address1'));
  
            errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
              text: 'Billing address is invalid',
              resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'BILLING_INFORMATION', 'CITY'],
            }, 'company.city'));
  
            errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
              text: 'Billing address is invalid',
              resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'BILLING_INFORMATION', 'ZIP_POSTAL_CODE'],
            }, 'company.zip'));
  
            if (currentRegion.addressFormClass == 0 || currentRegion.addressFormClass == 1) {
              errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
                text: 'Billing address is invalid',
                resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'BILLING_INFORMATION', 'STATE'],
              }, 'company.state'));
            }
          }

          if (shippingAddressCombined === billingAddressCombined) {
            // do not check again
            errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
              text: 'Shipping address is invalid',
              resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'SHIPPING_INFORMATION', 'ADDRESS'],
            }, 'shippingAddress.address1'));

            errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
              text: 'Shipping address is invalid',
              resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'SHIPPING_INFORMATION', 'CITY'],
            }, 'shippingAddress.city'));

            if (currentRegion.addressFormClass == 0 || currentRegion.addressFormClass == 1)
              errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
                text: 'Shipping address is invalid',
                resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'SHIPPING_INFORMATION', 'STATE_PROVINCE'],
              }, 'shippingAddress.state'));

            errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
              text: 'Shipping address is invalid',
              resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'SHIPPING_INFORMATION', 'ZIP_POSTAL_CODE'],
            }, 'shippingAddress.zip'));
          }
        }
      }

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

          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
            text: 'Billing address is invalid',
            resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'BILLING_INFORMATION', 'CITY'],
          }, 'billingAddress.city'));

          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
            text: 'Billing address is invalid',
            resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'BILLING_INFORMATION', 'ZIP_POSTAL_CODE'],
          }, 'billingAddress.zip'));

          if (currentRegion.addressFormClass == 0 || currentRegion.addressFormClass == 1) {
            errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
              text: 'Billing address is invalid',
              resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'BILLING_INFORMATION', 'STATE'],
            }, 'billingAddress.state'));
          }

          if (shippingAddressCombined === billingAddressCombined) {
            // do not check again
            errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
              text: 'Shipping address is invalid',
              resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'SHIPPING_INFORMATION', 'ADDRESS'],
            }, 'shippingAddress.address1'));

            errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
              text: 'Shipping address is invalid',
              resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'SHIPPING_INFORMATION', 'CITY'],
            }, 'shippingAddress.city'));

            if (currentRegion.addressFormClass == 0 || currentRegion.addressFormClass == 1)
              errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
                text: 'Shipping address is invalid',
                resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'SHIPPING_INFORMATION', 'STATE_PROVINCE'],
              }, 'shippingAddress.state'));

            errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
              text: 'Shipping address is invalid',
              resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'SHIPPING_INFORMATION', 'ZIP_POSTAL_CODE'],
            }, 'shippingAddress.zip'));
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

          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
            text: 'Shipping address is invalid',
            resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'SHIPPING_INFORMATION', 'CITY'],
          }, 'shippingAddress.city'));

          if (currentRegion.addressFormClass == 0 || currentRegion.addressFormClass == 1) {
            errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
              text: 'Shipping address is invalid',
              resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'SHIPPING_INFORMATION', 'STATE_PROVINCE'],
            }, 'shippingAddress.state'));
          }

          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
            text: 'Shipping address is invalid',
            resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'SHIPPING_INFORMATION', 'ZIP_POSTAL_CODE'],
          }, 'shippingAddress.zip'));
        }
      }

      if (errors.length > 0) {
        emitter.importWarnings(context.event, errors);
      }
    })
    .then(async () => {
      logger.info(fn, 'calculate tax started', JSON.stringify(taxableItems));

      const { CalculateTax } = require('../../../billing/Tax');
      // FIXME: current CalculateTax error message is too vague
      // error example:
      // info: [2tP4oT4RWklSxb8][[billing][integrations][avalara]][CalculateTax] avalara response {"inv":[{"doc":"","itms":[{"ref":"AVAY-IPOS-0005","err":[{"code":-16,"msg":"County/State/Zip not found."}]},{"ref":"AVAY-IPOP-0005"}],"err":[{"code":-16,"msg":"One or more LineItems failed."}]}]}
      // error: [2tP4oT4RWklSxb8][billing][Tax][CalculateTax] avalara error [{"code":-16,"msg":"One or more LineItems failed."}]

      // reset tax calc result
      payload.onetime.tax = 0;
      payload.onetime.taxDetails = [];
      //calculate one time tax
      if (taxableItems.onetime.length > 0) {
        try {
          const oneTimeTax = await CalculateTax(req, billingAddress, shippingAddress, taxableItems.onetime, company.isIncorporated, null, gateway, taxCodes);
          logger.info(fn, 'one time tax result', JSON.stringify(oneTimeTax));
          payload.onetime.tax = oneTimeTax.tax;
          payload.onetime.taxDetails = [];
          for (let tti in oneTimeTax.taxTypes) {
            const tt = oneTimeTax.taxTypes[tti];
            payload.onetime.taxDetails.push({
              title: {
                text: tt.name,
              },
              tid: tti,
              amount: tt.tax,
            });
          }
          logger.info(fn, 'ONETIME PAYLOAD', payload.onetime);
          payload.onetime.total += payload.onetime.tax;
        } catch (err) {
          logger.error(fn, 'one time tax failed:', err);
          // FIXME: proper error handling
          const msg = JSON.stringify(err);
          if (msg.indexOf('One or more LineItems failed') > -1) {
            emitter.warn(context.event, new ErrorMessage(fn, VIOLATIONS.TAX_CALCULATION_FAILED, {
              text: 'County/State/Zip not found.',
              resource: ['VIOLATION.TAX_CALCULATION_FAILED'],
            }, 'onetime.tax'));
            // } else if (msg.indexOf('BILL_ADDRESS_NOT_FOUND') > -1) {
            //   emitter.warn(context.event, new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
            //     text: 'Billing address is invalid',
            //     resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'BILLING_INFORMATION', 'ADDRESS'],
            //   }, 'billingAddress.*'));
            // } else if (msg.indexOf('SHIP_ADDRESS_NOT_FOUND') > -1) {
            //   emitter.warn(context.event, new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
            //     text: 'Shipping address is invalid',
            //     resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'SHIPPING_INFORMATION', 'ADDRESS'],
            //   }, 'shippingAddress.*'));
          } else {
            emitter.warn(context.event, new ErrorMessage(fn, VIOLATIONS.TAX_CALCULATION_FAILED, {
              text: err.message,
              resource: ['VIOLATION.TAX_CALCULATION_FAILED'],
            }, `onetime.tax`));
            // throw err;
          }
        }
      }

      // reset tax calc result
      for (let i in payload.subscriptions) {
        payload.subscriptions[i].tax = 0;
        payload.subscriptions[i].taxDetails = [];
      }
      //calculate recurring tax
      for (let key in taxableItems.recurring) {
        if (taxableItems.recurring[key].length > 0) {
          try {
            const recurringTax = await CalculateTax(req, billingAddress, shippingAddress, taxableItems.recurring[key], company.isIncorporated, null, gateway, taxCodes);
            logger.info(fn, `recurring tax "${key}" result`, JSON.stringify(recurringTax));
            for (let i in payload.subscriptions) {
              if (payload.subscriptions[i].identifier === key) {
                payload.subscriptions[i].tax = recurringTax.tax;
                payload.subscriptions[i].taxDetails = [];
                for (let tti in recurringTax.taxTypes) {
                  const tt = recurringTax.taxTypes[tti];
                  payload.subscriptions[i].taxDetails.push({
                    title: {
                      text: tt.name,
                    },
                    tid: tti,
                    amount: tt.tax,
                  });
                }

                payload.subscriptions[i].total += recurringTax.tax;
              }
            }
            logger.info(fn, 'Subscriptions PAYLOAD', payload.subscriptions);
          } catch (err) {
            logger.error(fn, `subscription "${key}" tax failed:`, err);
            // FIXME: proper error handling
            const msg = JSON.stringify(err);
            if (msg.indexOf('One or more LineItems failed') > -1) {
              emitter.warn(context.event, new ErrorMessage(fn, VIOLATIONS.TAX_CALCULATION_FAILED, {
                text: 'County/State/Zip not found.',
                resource: ['VIOLATION.TAX_CALCULATION_FAILED'],
              }, `subscriptions[${key}].tax`));
              // } else if (msg.indexOf('BILL_ADDRESS_NOT_FOUND') > -1) {
              //   emitter.warn(context.event, new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
              //     text: 'Billing address is invalid',
              //     resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'BILLING_INFORMATION', 'ADDRESS'],
              //   }, 'billingAddress.'));
              // } else if (msg.indexOf('SHIP_ADDRESS_NOT_FOUND') > -1) {
              //   emitter.warn(context.event, new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
              //     text: 'Shipping address is invalid',
              //     resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'SHIPPING_INFORMATION', 'ADDRESS'],
              //   }, 'shippingAddress.'));
            } else {
              emitter.warn(context.event, new ErrorMessage(fn, VIOLATIONS.TAX_CALCULATION_FAILED, {
                text: err.message,
                resource: ['VIOLATION.TAX_CALCULATION_FAILED'],
              }, `subscriptions[${key}].tax`));
              // throw err;
            }
          }
        }
      }

      logger.info(fn, 'calculate tax done');
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
