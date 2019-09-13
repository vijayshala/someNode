const ns = '[cart.controller]';
const logger = require('applogger');
import constants from '../../config/constants'
const { CartBackend } = require('./cart.backend');
const { UnauthorizedError } = require('../modules/error');

import { UserBackend } from '../user/user.backend'
const { RegionBackend } = require('../region/region.backend');
import { BillingAccountBackend } from '../billingaccount/billingaccount.backend';
import LookupModel, { getLookup } from '../../models/LookupModel'
import {
  asyncGetCreditCards,
  asyncGetCreditCard,
  asyncCreatePaymentMethod
} from '../billing/PaymentMethod';
const { getStripeAccountByRegion } = require('../billing/integrations/stripe');

import {
  PO_STATUS_APPROVED
} from '../billingaccount/billingaccount.constants';
import ZangAccountsModel, { asyncGetCompaniesByRelation } from '../../models/ZangAccountsModel'
import PartnerModel, { asyncGetPartners } from '../../models/PartnerModel'
import config from '../../config/'

const getCart = async(req, res, next) => {
  const fn = `[${req.requestId}]${ns}[getCart]`;
  const user = req.userInfo;
  // logger.info(fn, 'user:', user);

  try {
    if (!user) {
      // FIXME: this should be handled by middleware
      throw new UnauthorizedError();
    }

    let cart = await CartBackend.findByUser(user, {
      requestId: req.requestId,
      localizer: req.localizer,
      region: req.region
    });
    logger.info(fn, 'cart:', cart);

    res.status(200).json({
      error: false,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

const updateCart = async(req, res, next) => {
  const fn = `[${req.requestId}]${ns}[updateCart]`;
  const { getBaseURL } = require('../../common/Utils');
  const user = req.userInfo;
  const update = req.body;
  // logger.info(fn, 'user:', user);
  logger.info(fn, 'update:', update);

  try {
    if (!user) {
      // FIXME: this should be handled by middleware
      throw new UnauthorizedError();
    }

    // update.contact = update.contact || {}
    // update.contact.firstName = (user.accountInformation && user.accountInformation.firstName) || (user.account && user.account.name && user.account.name.givenname) || ''
    // update.contact.lastName= (user.accountInformation && user.accountInformation.lastName) || (user.account && user.account.name && user.account.name.familyname) || ''
    logger.info(fn, '-----req.params', req.params, 'region:', req.region);
    let result = await CartBackend.updateByUser(user, update, {
      requestId: req.requestId,
      baseUrl: getBaseURL(req),
      localizer: req.localizer,
      region: req.region
    });
    logger.debug(fn, 'result:', result);

    let response = {
      error: false,
      data: result.cart,
    };
    if (result.logs && result.logs.warnings && result.logs.warnings.length > 0) {
      response.warnings = result.logs.warnings;
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const deleteCart = async(req, res, next) => {
  const fn = `[${req.requestId}]${ns}[deleteCart]`;
  const user = req.userInfo;
  // logger.info(fn, 'user:', user);

  try {
    if (!user) {
      // FIXME: this should be handled by middleware
      throw new UnauthorizedError();
    }

    const result = await CartBackend.removeByUser(user, {
      requestId: req.requestId,
      localizer: req.localizer,
      region: req.region
    });
    logger.info(fn, 'result:', result);

    res.status(200).json({
      error: false,
    });
  } catch (error) {
    next(error);
  }
};

const viewCart = async(req, res, next) => {
  const fn = `[${req.requestId}]${ns}[viewCart]`
  const user = req.userInfo;
  logger.info(fn, '-----req.params', req.params, 'region:', req.region);
  try {
    if (!user) {
      // FIXME: this should be handled by middleware
      throw new UnauthorizedError();
    }

    let cart = await CartBackend.findByUser(user, {
      requestId: req.requestId,
      localizer: req.localizer,
      region: req.region
    });
    
    // logger.info(fn, 'cart:', cart);

    res.render('webapp/AppView', {
      preloadedData: {
        cart, user,
        configurations: {
          urls: res.locals.urls
        }
      },
      error: false,
    });
  } catch (error) {
    next(error);
  }
}


const viewCheckout = async (req, res, next)=>{
  let fn = `[${req.requestId}]${ns}[viewCheckout]`
  const user = req.userInfo;
  // logger.info(fn, 'user:', user);
  logger.info(fn, 'begin');
  try {
    if (!user) {
      throw new UnauthorizedError();
    }
    const userId = user && (user._id || user.userId);
    let cart = await CartBackend.findByUser(user, {
      requestId: req.requestId,
      localizer: req.localizer,
      region: req.region
    });

    if (!cart || (cart.items && !cart.items.length)) {
      logger.info(fn, 'cart is empty', cart.items.length);
      res.redirect('/');
      throw new Error(fn + 'no cart info', {
        _id: cart && cart._id,
        cartItemSize: cart.items.length
      });
    }

    let industryTypes = await getLookup(req, {
      type: constants.LOOKUP_TYPES.INDUSTRY_TYPES
    });

    const billingAccounts = await BillingAccountBackend.findByUser(user, {
      requestId: req.requestId,
      populateGateways: true
    });
    const billingAccountId = billingAccounts && billingAccounts[0] && billingAccounts[0]._id;
    const billingAccount = billingAccounts && billingAccounts[0];

    if (billingAccountId && (!cart.billingAccountId || cart.billingAccountId !== billingAccountId)) {
      // user already have billingAccount, but not saved to cart, then we update it
      await CartBackend.findOneAndUpdate({
        _id: cart._id
      }, {
        $set: { billingAccountId }
      }, {
        requestId: req.requestId,
      });
      cart.billingAccountId = billingAccountId;
    }
    
    let stripe = getStripeAccountByRegion(req.region);
    const creditCards = billingAccountId ? await asyncGetCreditCards(req, billingAccountId, stripe.gateway) : [];
    const purchaseOrder = billingAccount && billingAccount.purchaseOrder;
    const IBANs = billingAccount && billingAccount.IBANs;

    let userContactInfo = await UserBackend.getUserBillingInformation(userId, {
      requestId: req.requestId
    });
    logger.info(fn, '*************userContactInfo:', userContactInfo);
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
    //get zangspaces product for bundling zangSpacesProduct
    let states = await getLookup(req, {
      type: constants.LOOKUP_TYPES.STATES
    });
    let resCompanies = await asyncGetCompaniesByRelation(req, user.accountId, "admin");
    let companies = resCompanies.data || [];
    // sanitize cartItems var cartItem = await
    // IPOfficeModel.sanitizeDeviceItems(req, ipOfficeCartItem) var cartItemDetails
    // = await IPOfficeModel.getOrderSummaryDetails(req, cartItem, true)
    // let partners = await asyncGetPartners(req, {
    //   type: constants.PARTNER_TYPES.msa
    // });

    let e911Information = {};

    countries.sort((a, b) => {
      if (a.keyValue < b.keyValue)
        return -1;
      if (a.keyValue > b.keyValue)
        return 1;
      return 0;
    });

    industryTypes.sort((a, b) => {
      if (a.keyValue < b.keyValue)
        return -1;
      if (a.keyValue > b.keyValue)
        return 1;
      return 0;
    });

    cart = cart || {}
    cart.billingAddress = cart.billingAddress || userContactInfo.billingAddress
    cart.shippingAddress = cart.shippingAddress ||  userContactInfo.shippingAddress
    cart.contact = cart.contact || userContactInfo.contact
    cart.company = cart.company || userContactInfo.company
    logger.info(fn, '*************userContactInfo:', {
      billingAddress: cart.billingAddress,
      shippingAddress: cart.shippingAddress,
      contact: cart.contact,
      company: cart.company,
    });

    let currentRegion = await RegionBackend.findByCode(req.region);

    let defaultPartner;
    if (currentRegion && currentRegion.countryISO == 'DE') {
      const { PartnerBackend } = require('../partner/partner.backend');

      const gsmbPartner = await PartnerBackend.findOne({
          'metadata.regionMaster': 'DE'
        }, {requestId: req.requestId, ignoreNotFoundError: true});

      defaultPartner = {
        partner: gsmbPartner
      };
    }

    let title = '' //'Cart ' + cart.count + ' ' + (cart.count === 1 ? 'item' : 'items') + ' $' + (cart.total / 100).formatDollars(2);
    logger.info(fn, 'showingview');

    

    res.render('cart-view/CartCheckout', {
      _csrf: req.csrfToken(),
      title: title,
      creditCards: creditCards,
      purchaseOrder: purchaseOrder,
      IBANs: IBANs,
      industryTypes: industryTypes,
      countries: countries,
      states: states,
      e911Information: e911Information,
      cart: cart,
      userContactInfo,
      currentRegion,
      // cartItemDetails: cartItemDetails, cartItem: cartItem,
      companies,
      //partners,
      defaultPartner,
      // legalDocs,      
      ENABLE_PLAN_B_SOFT_LAUNCH_MODE: config.ENABLE_PLAN_B_SOFT_LAUNCH_MODE,
      creditCartGateWay: stripe.gateway,
      stripeKey: stripe && stripe.publicKey
    });
  }
  catch (error) {
    next(error)
  }
}

const sendSummary = async(req, res, next) => {
  const fn = `[${req.requestId}]${ns}[sendSummary]`;
  const { getBaseURL } = require('../../common/Utils');
  const user = req.userInfo;
   logger.info(fn, '-----req.params', req.params, 'region:', req.region);
   try {
    if (!user) {
      // FIXME: this should be handled by middleware
      throw new UnauthorizedError();
    }
     await CartBackend.sendSummary(user, {
      requestId: req.requestId,
      localizer: req.localizer,
      region: req.region,
      baseUrl: getBaseURL(req)
    });
     res.status(200).json({
      error: false
    });
  } catch (error) {
    next(error);
  }
}


module.exports = {
  getCart,
  updateCart,
  deleteCart,
  viewCheckout,
  viewCart,
  sendSummary
};
