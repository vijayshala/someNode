const ns = '[cart.backend]';
const logger = require('applogger');

const { DbBase } = require('../modules/db/index');
const { CartSchema } = require('./cart.model');
const { UserBackend } = require('../user/user.backend');
const { RegionBackend } = require('../region/region.backend');
const { BadRequestError } = require('../modules/error');
const CARTHANDLER = require('../modules/cart-salesmodel-rules');
const { findCurrencyFromRegion } = require('../modules/cart-salesmodel-rules/utils');
const { ASEventEmitter } = require('../modules/event');
const { ASEVENT_CART_BEFORE_UPDATE } = require('../modules/event/constants');
const escapeStringRegexp = require('escape-string-regexp');

class CartBackend extends DbBase {
  async findByUser(user, options) {
    const fn = `[${options.requestId}]${ns}[findByUser]`;
    let cart = null;
    const userId = user && (user._id || user.userId);
    // logger.info(fn, '----------options', options);
    logger.info(fn, '----------options', { region: options.region, currency: options.currency});
    options = Object.assign({
      region: 'US'
    }, options);

    if (!options.currency)  {
      options.currency = await findCurrencyFromRegion(options.region) || 'USD';
    }
    options.currency = options.currency.toUpperCase();
    options.region = options.region.toUpperCase();
    let currentRegion = await RegionBackend.findByCode(options.region);
    //logger.info(fn, 'options:', options);

    let query = { 'created.by': userId };
    if (options.region) {
      var str = escapeStringRegexp(options.region);
      var regex = { $regex: str, $options: 'i' }
      query.region = regex;
    }
    logger.info(fn, '----------query', query);
    cart = await this.findOne(query, { ...options, ignoreNotFoundError: true });

    if (!cart && userId) {
      logger.info(fn, `creating new cart for user ${userId}...`);

      let rawUser = user;
      if (!user._id) {
        rawUser = await UserBackend.findOneById(userId, options);
      }

      // init cart and insert
      let ch = new CARTHANDLER({
        ...rawUser,
        billingInformation: (rawUser.billingInformation && currentRegion.countryISO == rawUser.billingInformation.countryISO)
          ? rawUser.billingInformation : {},
        shippingInformation: (rawUser.shippingInformation && currentRegion.countryISO == rawUser.shippingInformation.countryISO)
          ? rawUser.shippingInformation : {}
      });
      cart = ch.initCart(options.region, options.currency);
      cart = await this.create(cart);
      if (cart && cart.toObject) {
        // convert to plain object
        cart = cart.toObject();
      }
    }

    return cart;
  }

  /**
   * Update cart
   * @param  {Object} user
   * @param  {Object} update  cart information to update
   *                          Special parameters:
   *                          - __debugReset {Boolean}        if reset cart to empty
   *                          - __debugPrefill {Boolean}      if prefill the cart with build-in default items
   *                          - __newItems   {Array}          array of object with these informations
   *                                                          - quantity       {Number}
   *                                                          - offer          {String}  offer identifier
   *                                                          - salesModel     {String}  salesModel identifier
   *                                                          - salesmodelItem {String}  salesmodel item identifier
   *                                                          - attibute       {String}  attibute identifier
   *                                                          - options        {Object}  addItem options
   * @param  {Object} options
   */
  async updateByUser(user, update, options = {}) {
    const fn = `[${options.requestId}]${ns}[updateByUser]`;
    const userId = user && (user._id || user.userId);
    const debugReset = (update && update.__debugReset) || false;
    const debugPrefill = (update && update.__debugPrefill) || false;


    options.region = (update.region  || options.region || 'US').toUpperCase();
    const oldCart = await this.findByUser(user, options);
    let cart = { ...oldCart, ...update };

    // remove fields
    ['__v', '_id', 'id'].forEach((one) => {
      if (cart.hasOwnProperty(one)) {
        delete cart[one];
      }
    });

    

    options = Object.assign({
      new: true,
      upsert: true,
    }, options);

    let rawUser = user;
    if (!user._id) {
      rawUser = await UserBackend.findOneById(userId, options);
    }

    if (debugReset) {
      logger.info(fn, 'reset cart to empty');
      cart.items = [];
      delete cart.__debugReset;
    }

    if (debugPrefill) {
      logger.info(fn, 'prefill cart');
      let ch = new CARTHANDLER(rawUser);
      cart = ch.initCart();
      // insert fake data
      cart = ch.addItem(cart, 1, 'ucoffer-small', 'ucoffer-small-yearly', null, null, { ignoreMappingError: true });
      cart = ch.addItem(cart, 20, 'ucoffer-small', 'ucoffer-small-yearly', 'zang-office', null, { ignoreMappingError: true });
      cart = ch.addItem(cart, 20, 'ucoffer-small', 'ucoffer-small-yearly', 'zang-office', 'voicemail', { ignoreMappingError: true });
      cart = ch.addItem(cart, 20, 'ucoffer-small', 'ucoffer-small-yearly', 'zang-office', 'silver-package', { ignoreMappingError: true, attributeValue: 'nooooo' });
      cart = ch.addItem(cart, 20, 'ucoffer-small', 'ucoffer-small-yearly', 'zang-office-softphone', null, { ignoreMappingError: true });
      cart = ch.addItem(cart, 6, 'ucoffer-small', 'ucoffer-small-yearly', 'avaya-vantage-v1-0', null, { ignoreMappingError: true });
      delete cart.__debugPrefill;
    }

    // add new item
    if (cart.__newItems && Array.isArray(cart.__newItems)) {
      let ch = new CARTHANDLER(rawUser);
      for (let newItem of cart.__newItems) {
        if (newItem.quantity && newItem.offer && newItem.salesModel) {
          logger.info(fn, `adding ${newItem.quantity} x ${newItem.offer} ~ ${newItem.salesModel} ~ ${newItem.salesModelItem} ~ ${newItem.attribute} to cart...`);
          cart = ch.addItem(cart, newItem.quantity,
            newItem.offer, newItem.salesModel, newItem.salesModelItem,
            newItem.attribute, { ignoreMappingError: true, ...newItem.options });
        }
      }

      delete cart.__newItems;
    }

    // cart.contact = cart.contact || {}
    // cart.contact.firstName = cart.contact.firstName
    //   || (rawUser.accountInformation && rawUser.accountInformation.firstName)
    //   || (rawUser.account && rawUser.account.name && rawUser.account.name.givenname)
    //   || '';
    // cart.contact.lastName = cart.contact.lastName
    //   || (rawUser.accountInformation && user.accountInformation.lastName)
    //   || (rawUser.account && rawUser.account.name && rawUser.account.name.familyname)
    //   || '';

    logger.info(fn, 'update cart:', JSON.stringify(cart));
    let currentRegion = await RegionBackend.findByCode(cart.region);
    const context = {
      requestId: options.requestId,
      baseUrl: options.baseUrl,
      localizer: options.localizer,
      user,
      rawUser,
      cart,
      currentRegion,
    };
    const eventResult = await ASEventEmitter.emitPromise(ASEVENT_CART_BEFORE_UPDATE, context);
    const logs = {
      infos: ASEventEmitter.getInfos(ASEVENT_CART_BEFORE_UPDATE),
      warnings: ASEventEmitter.getWarnings(ASEVENT_CART_BEFORE_UPDATE),
      errors: ASEventEmitter.getErrors(ASEVENT_CART_BEFORE_UPDATE),
    };
    if (logs.errors && logs.errors.length) {
      throw new BadRequestError('Cart update failed', logs.errors);
    }

    // reset updated
    cart = {
      ...cart,
      created: {
        by: userId,
        // FIXME: created.on is updated for each updating
        on: new Date(),
      },
      updated: {
        by: userId,
        on: new Date(),
      },
    };

    // logger.info(fn, 'before save cart:', JSON.stringify(cart));
    var str = escapeStringRegexp(options.region);
    var regex = { $regex: str, $options: 'i' }
    let savedCart = await this.findOneAndUpdate({
      'created.by': userId,
      region: regex
    }, cart, options);
    if (savedCart && savedCart.toObject) {
      // convert to plain object
      savedCart = savedCart.toObject();
    }

    return {
      cart: savedCart,
      logs,
    };
  }

  async removeByUser(user, options) {
    const fn = `[${options.requestId}]${ns}[removeByUser]`;
    const userId = user && (user._id || user.userId);
    let query = {
      'created.by': userId
    }
    if (options.region) {
      query.region = options.region.toUpperCase();
    }
    const result = await this.remove(query, options);

    return result && result.result;
  }

  async sendSummary(user, options)  {
    const fn = `[${options.requestId}]${ns}[sendSummary]`;
    const { triggerCartSummaryTask } = require('./cart.utils');

    options = Object.assign({
      region: 'US'
    }, options);

    const cart = await this.findByUser(user, options);

    if (cart && cart.items && cart.items.length > 0)  {
      triggerCartSummaryTask(options, {
        cartId: cart._id
      });
    }
  }
}

let backend = new CartBackend(CartSchema, {});

module.exports = {
  CartBackend: backend,
};

