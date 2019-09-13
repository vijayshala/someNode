const ns = '[event.hooks.create-payment-method]';
const logger = require('applogger');

/**
 * check cart/order payment information
 *
 * if the client post back new credit card information, then we need to create the card
 */
const processEvent = function (context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const emitter = this;
  const { ErrorMessage, VIOLATIONS, BadRequestError } = require('../../error');
  const { BillingAccountBackend } = require('../../../billingaccount/billingaccount.backend');
  const { validatePO } = require('../../../billingaccount/billingaccount.utils');
  const U = require('../../utils');
  const _ = require('lodash');
  let payload = context.order || context.cart;

  logger.info(fn, 'started', 'payload id=', payload && payload._id);
  if (!payload) {
    return next(new BadRequestError('Cannot find cart or order payload'));
  }

  // there are no new credit card information in the payload
  const newPaymentMethod = payload.newPayment && payload.newPayment;

  if (!newPaymentMethod) {
    logger.info(fn, 'skipped');
    return next();
  }
  const billingEngine = payload.newPayment.billingEngine;
  let newPO = payload.newPayment && payload.newPayment.metadata && payload.newPayment.metadata.purchaseOrder;
  const newCreditCard = payload.newPayment && payload.newPayment.metadata && payload.newPayment.metadata.creditCard;
  const newIBAN = payload.newPayment && payload.newPayment.metadata && payload.newPayment.metadata.IBAN;
  const newIBANAuthorization = payload.newPayment && payload.newPayment.metadata && payload.newPayment.metadata.IBANAuthorization;

  // ==============================================================
  // we should create a new credit card

  let req = {
    requestId: context.requestId,
    userInfo: context.user,
  };
  if (payload.region === 'DE') {
    U.P()
      .then(async () => {
        if (!newIBAN) {
          return;
        }

        const { BillingAccountBackend } = require('../../../billingaccount/billingaccount.backend');

        const billingAccounts = await BillingAccountBackend.findByUser(context.user, {
          requestId: req.requestId
        });
        const billingAccount = billingAccounts && billingAccounts[0];

        let result;
        try {
          result = await BillingAccountBackend.createIBAN(context.user, billingAccount, newIBAN, req);
        } catch (err) {
          logger.warn(fn, 'failed to create IBAN', err);
          emitter.warn(context.event, new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
            text: 'Your IBAN is invalid.',
            resource: ['VIOLATION.FIELD_VALUE_INVALID', 'IBAN'],
          }, 'IBAN'));
          return;
        }


        delete payload.newPayment;

        // update payload payment
        const payment = {
          billingEngine: 'GSMB',
          metadata: {
            IBAN: result.value,
            IBANAuthorization: newIBANAuthorization
          },
        };
        payload.payment = payment;
        payload.billingAccountId = billingAccount._id;
        logger.info(fn, 'create IBAN done', JSON.stringify(payment));
      })
      .then(() => {
        next();
      })
      .catch((err) => {
        logger.error(fn, 'Error:', err);
        next(err);
      });

    return;
  }
  U.P()
    .then(async () => {
      if (!newCreditCard) {
        return;
      }
      if (newCreditCard.token) {
        // we have stripe token, ok to proceed
      } else if (newCreditCard.number) {
        let newCardKey = '';
        newCardKey = [
          newCreditCard.name.toUpperCase(),
          newCreditCard.number.replace(/[^0-9]/g, '').substr(-4),
          parseInt(newCreditCard.expMonth, 10),
          parseInt(newCreditCard.expYear, 10),
        ].join('..');
        logger.info(fn, 'new card key', newCardKey, 'billingEngine', billingEngine);
        // check if credit cart already been processed
        let existingCardKey = '';
        if (payload.payment && payload.payment.metadata && payload.payment.metadata.creditCard) {
          existingCardKey = [
            payload.payment.metadata.creditCard.holderName.toUpperCase(),
            payload.payment.metadata.creditCard.last4,
            parseInt(payload.payment.metadata.creditCard.expMonth, 10),
            parseInt(payload.payment.metadata.creditCard.expYear, 10),
          ].join('..');
        }
        logger.info(fn, 'existing card key', existingCardKey);

        // same card we already created, then just return;
        if (newCardKey && newCardKey === existingCardKey) {
          logger.info(fn, 'credit card is not changed');

          // remove raw credit card information from payload
          delete payload.newPayment;
          return next();
        }
        if (!payload.billingAddress ||
          !payload.billingAddress.address1 ||
          !payload.billingAddress.zip ||
          !payload.billingAddress.country) {
          // return next(new BadRequestError('Billing address, zip, or country is missing'));
          // ignore errors here, and leave it to validation rules
          logger.info(fn, 'missing billing address, skipped');
          return next();
        }
      } else {
        logger.info(fn, 'no card number and token, skipped');
        return next();
      }

      const creditCard = newCreditCard.token ? { stripeToken: newCreditCard.token } : {
        name: newCreditCard.name,
        number: newCreditCard.number.replace(/ /g, ''),
        "exp_month": newCreditCard.expMonth,
        "exp_year": newCreditCard.expYear,
        cvc: newCreditCard.cvc,
        "address_line1": payload.billingAddress.address1,
        "address_zip": payload.billingAddress.zip,
        "address_country": payload.billingAddress.country,
      };

      logger.info(fn, 'create credit card', JSON.stringify(creditCard));

      const { asyncCreateCreditCard } = require('../../../billing/PaymentMethod');
      const { BillingAccountBackend } = require('../../../billingaccount/billingaccount.backend');

      let result = null;
      try {
        const billingAccounts = await BillingAccountBackend.findByUser(context.user, {
          requestId: req.requestId
        });
        const billingAccountId = billingAccounts && billingAccounts[0] && billingAccounts[0]._id;
        result = await asyncCreateCreditCard(req, creditCard, billingAccountId, billingEngine);
        logger.info(fn, 'create credit card result', JSON.stringify(result));
      } catch (err) {
        logger.error(fn, 'failed to create credit card', err);
        emitter.warn(context.event, new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
          text: 'Your card was declined.',
          resource: ['VIOLATION.FIELD_VALUE_INVALID', 'CREDIT_CARD'],
        }, 'payment.metadata.creditCard'));
        return;
      }

      // result is in a format of:
      // {
      //   billingAccountId: billingAccount ? billingAccount._id : billingAccountId,
      //   customerId: customerId,
      //   gateway: payment_gateway,
      //   sourceId: card.id,
      //   paymentType: ResolvePaymentType(card.object),
      //   brand: card.brand,
      //   last4: card.last4,
      //   expMonth: card.exp_month,
      //   expYear: card.exp_year,
      //   holderName: card.name
      // };

      // remove raw credit card information from payload
      delete payload.newPayment;

      // update payload payment
      const payment = {
        billingEngine: result.gateway,
        metadata: {
          customerId: result.customerId,
          sourceId: result.sourceId,
          paymentType: result.paymentType,
          creditCard: { // do not store real credit card here
            brand: result.brand,
            last4: result.last4,
            expMonth: result.expMonth,
            expYear: result.expYear,
            holderName: result.holderName,
          },
        },
      };
      payload.payment = payment;
      payload.billingAccountId = result.billingAccountId;
      logger.info(fn, 'create credit card done', JSON.stringify(payment));
    })
    .then(async () => {
      if (!newPO) {
        return;
      }
      let errors = await validatePO(newPO, req);

      if (errors.length > 0) {
        logger.info(fn, 'Validate PO Errors', errors);
        emitter.importWarnings(context.event, errors);
        return;
      }

      let result = {};
      try {
        const billingAccounts = await BillingAccountBackend.findByUser(context.user, {
          requestId: req.requestId
        });
        const billingAccountId = billingAccounts && billingAccounts[0] && billingAccounts[0]._id;
        const purchaseOrderExisting = billingAccounts && billingAccounts[0] && billingAccounts[0].paymentGateways
          && billingAccounts[0].paymentGateways.NATIVE && billingAccounts[0].paymentGateways.NATIVE.purchaseOrder;

        let billingAccount;
        if (!purchaseOrderExisting)  {
          billingAccount = await BillingAccountBackend.savePurchaseOrder(context.user, billingAccountId, newPO, {
            requestId: context.requestId,
            localizer: context.localizer,
            baseUrl: context.baseUrl
          });
        }

        result.purchaseOrder = (billingAccount && billingAccount.purchaseOrder) || purchaseOrderExisting;
        result.billingAccountId = billingAccountId;
      } catch (err) {
        logger.error(fn, 'failed to create PO', err);
        emitter.warn(context.event, new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
          text: 'Failed to create purchase order.',
          resource: ['VIOLATION.FIELD_VALUE_INVALID', 'PURCHASE_ORDER'],
        }, 'payment.metadata.purchaseOrder'));
        return;
      }


      const payment = {
        billingEngine: 'NATIVE',
        metadata: {
          paymentType: 'PURCHASE_ORDER',
          purchaseOrder: result.purchaseOrder
        },
      };

      payload.payment = payment;
      payload.billingAccountId = result.billingAccountId;
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
