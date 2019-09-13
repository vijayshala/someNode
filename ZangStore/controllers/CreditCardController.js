
import logger from 'applogger'
import async from 'async'
import constants from '../config/constants'
import config from '../config';

import LookupModel, { getLookup } from '../models/LookupModel'
import { asyncCreateCreditCard, asyncGetCreditCards, asyncDeletePaymentMethod, ResolveUserBillingAccount, asyncSetDefaultPaymentMethod } from '../server/billing/PaymentMethod';


import { BillingAccountBackend } from '../server/billingaccount/billingaccount.backend';
const { RegionBackend } = require('../server/region/region.backend');
const { getStripeAccountByRegion } = require('../server/billing/integrations/stripe');
const ns = '[CreditCardController]'

const CreditCardController = {}

CreditCardController.list = async (req, res) => {
  logger.info(req.requestId, ns, '[list]')

  let error = req.query.error ? req.query.error.split('|').join('<br />') : false;
  let creditCards = [];
  let stripe = getStripeAccountByRegion(req.region);
  try {
    const billingAccounts = await BillingAccountBackend.findByUser(req.userInfo, {
      requestId: req.requestId
    });
    const billingAccountId = billingAccounts && billingAccounts[0] && billingAccounts[0]._id;
    creditCards = await asyncGetCreditCards(req, billingAccountId, stripe.gateway);
  } catch (e) {
    logger.error(req.requestId, ns, 'error', e);
    error = e.message;
  }

  res.render('creditcard/CreditCardList', {
    _csrf: req.csrfToken(),
    title: 'Manage Credit cards',
    active: "card",
    cards: creditCards,
    error: error,
    creditCartGateWay: stripe.gateway,
    stripeKey: stripe.publicKey
  })
}

CreditCardController.listPO = async (req, res) => {
  logger.info(req.requestId, ns, '[listPO]')

  const billingAccounts = await BillingAccountBackend.findByUser(req.userInfo, {
    requestId: req.requestId,
    populateGateways: true
  });
  const billingAccount = billingAccounts && billingAccounts[0];

  let purchaseorder = {};

  // get the purchase order of the user
  if (billingAccount)
    purchaseorder = (billingAccount.purchaseOrder ? billingAccount.purchaseOrder : {});

  let countriesFilter = ['United States'];
  if (req.hasAdminPermission) {
    countriesFilter.push('Canada');
  }
  let countries = await getLookup(req, {
    type: constants.LOOKUP_TYPES.COUNTRIES,
    keyValue: {
      $in: countriesFilter
    }
  });

  countries.sort((a, b) => {
    if (a.keyValue < b.keyValue)
      return -1;
    if (a.keyValue > b.keyValue)
      return 1;
    return 0;
  });

  let states = await getLookup(req, {
    type: constants.LOOKUP_TYPES.STATES
  });

  res.render('creditcard/PurchaseOrderList', {
    _csrf: req.csrfToken(),
    title: 'Manage Purchase Orders',
    active: "purchaseorder",
    pos: purchaseorder,
    states: states,
    countries: countries,
    billingAccount: (billingAccount ? billingAccount._id : null )
  })
}

CreditCardController.add = (req, res, next) => {
  logger.info(req.requestId, ns, '[add]')
  req.checkBody('creditCardName', req.localizer.get('This field is Required')).notEmpty();
  req.checkBody('stripeToken', req.localizer.get('This field is Required')).notEmpty();
  //req.checkBody('creditCardNumber', req.localizer.get('This field is Required')).notEmpty();
  //req.checkBody('creditCardNumber', 'Credit card number must be a number').isInt();
  //req.checkBody('creditCardExpirationMonth', req.localizer.get('This field is Required')).notEmpty();
  //req.checkBody('creditCardExpirationYear', req.localizer.get('This field is Required')).notEmpty();
  //req.checkBody('creditCardSecurityCode', req.localizer.get('This field is Required')).notEmpty();
  //req.checkBody('billingAddress', req.localizer.get('This field is Required')).notEmpty();
  //req.checkBody('billingPostalCode', req.localizer.get('This field is Required')).notEmpty();
  //req.checkBody('creditCardSecurityCode', 'Credit Card Security Code must be a number').isInt();

  let stripe = getStripeAccountByRegion(req.region);

  let errors = req.validationErrors() || []
  if(errors.length){
    res.redirect('/' + req.region + '/billingaccount/creditcard?error=' + encodeURIComponent('All fields are required'))
  } else {
    let credit_card_obj;
    if (req.body.stripeToken)  {
      credit_card_obj = {
        stripeToken: req.body.stripeToken
      };
    } else  {
      credit_card_obj = {
        "number": req.body.creditCardNumber.replace(/ /g, ''),
        "exp_month": req.body.creditCardExpirationMonth,
        "exp_year": req.body.creditCardExpirationYear,
        "cvc": req.body.creditCardSecurityCode,
        "address_line1": req.body.billingAddress,
        "address_zip": req.body.billingPostalCode,
        "name": req.body.creditCardName,
        "address_country": req.body.billingCountry
      };
    }
    BillingAccountBackend.findByUser(req.userInfo, {
      requestId: req.requestId
    }).then((billingAccounts) =>  {
      const billingAccountId = billingAccounts && billingAccounts[0] && billingAccounts[0]._id; 
      asyncCreateCreditCard(req, credit_card_obj, billingAccountId, stripe.gateway).then((payment_obj) => {
        res.redirect('/' + req.region + '/billingaccount/creditcard');
      }).catch((err)  =>  {
        logger.error(req.requestId, ns, '[add]:err', err);
        res.redirect('/' + req.region + '/billingaccount/creditcard?error=' + encodeURIComponent(req.localizer.get('WE_WERE_UNABLE_TO_CREATE_YOUR_CREDIT_CARD_PLEASE_TRY_AGAIN')));
      });
    });
  }
}

CreditCardController.setDefault = (req, res, next)  =>  {
  let func = `[${req.requestId}]${ns}[setDefault]`;

  logger.info(func, 'begin');
  let stripe = getStripeAccountByRegion(req.region);
  BillingAccountBackend.findByUser(req.userInfo, {
    requestId: req.requestId
  }).then((billingAccounts) =>  {
    const billingAccountId = billingAccounts && billingAccounts[0] && billingAccounts[0]._id; 
    asyncSetDefaultPaymentMethod(req, billingAccountId, req.params.id, stripe.gateway).then(() => {
      res.redirect('/' + req.region + '/billingaccount/creditcard');
    }).catch((err)  =>  {
      logger.error(func, 'err', err)
      res.redirect('/' + req.region + '/billingaccount/creditcard?error=' + encodeURIComponent(req.localizer.get('WE_WERE_UNABLE_TO_SET_DEFAULT_YOUR_CREDIT_CARD_PLEASE_TRY_AGAIN')));
    });
  });
}

CreditCardController.delete = async (req, res, next) => {
  logger.info(req.requestId, ns, '[delete]')
  let stripe = getStripeAccountByRegion(req.region);
  BillingAccountBackend.findByUser(req.userInfo, {
    requestId: req.requestId
  }).then((billingAccounts) =>  {
    const billingAccountId = billingAccounts && billingAccounts[0] && billingAccounts[0]._id; 
    asyncDeletePaymentMethod(req, billingAccountId, req.params.id, stripe.gateway).then((confirmation)  =>  {
      res.redirect('/' + req.region + '/billingaccount/creditcard');
    }).catch((err)  =>  {
      logger.error(req.requestId, ns, '[delete]:err', err)
      res.redirect('/' + req.region + '/billingaccount/creditcard?error=' + encodeURIComponent(req.localizer.get('WE_WERE_UNABLE_TO_DELETE_YOUR_CREDIT_CARD_PLEASE_TRY_AGAIN')));
    });
  });
  
}


export default CreditCardController
