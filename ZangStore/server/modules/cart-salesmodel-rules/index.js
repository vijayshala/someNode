const CsmrEventEmitter = require('./emitter');
const InMemoryLogging = require('../utils/inmemory-logging');
const { SALESMODEL_RULE_HOOK_EVENTS, CART_TITLE_DESCRIPTIONS_IDENTIFIER } = require('./constants');
const { OfferMapping, SalesModelMapping, findCartItemContext } = require('./utils');

// load product engine routes
const productEnginesRegister = require('../product-engines/register-cart-salesmodel-rules');
const preloadRuleModules = {
  'add-another-item': require('./rules/add-another-item'),
  'remove-other-items': require('./rules/remove-other-items'),
  'quantity-based-price': require('./rules/quantity-based-price'),
  'universal-adjust-discount-price': require('./rules/universal-adjust-discount-price'),
  'universal-aggregate-discount': require('./rules/universal-aggregate-discount'),
  'universal-calculate-subtotal': require('./rules/universal-calculate-subtotal'),
  'universal-calculate-total': require('./rules/universal-calculate-total'),
  'universal-quantity-restriction': require('./rules/universal-quantity-restriction'),
  'universal-remove-0qty-items': require('./rules/universal-remove-0qty-items'),
  'universal-update-currency': require('./rules/universal-update-currency'),
  'universal-check-region': require('./rules/universal-check-region'),
  'validation-field-cannot-be-empty': require('./rules/validation-field-cannot-be-empty'),
  'prepopulate-other-items': require('./rules/prepopulate-other-items'),
  'quantity-match-item': require('./rules/quantity-match-item'),
  'quantity-max-follow-parent-item': require('./rules/quantity-max-follow-parent-item'),
  ...productEnginesRegister(),
};

class CartSalesModelRulesHandler {
  constructor(user, options) {
    this.ns = '[CartSalesModelRulesHandler]';
    this.emitter = new CsmrEventEmitter();
    this.emitter.setMaxListeners(100);
    this.logging = new InMemoryLogging();
    this.options = Object.assign({ separator: '..' }, options);

    // hold the offer/salesmodel ID mapping
    this.offerMapping = new OfferMapping();
    this.salesModelMapping = new SalesModelMapping({
      separator: this.options.separator,
    });

    // user information
    this.user = user;
  }

  setUser(user) {
    this.user = user;
  }

  getLogs() {
    if (this.emitter) {
      return this.emitter.getAll();
    }
    else {
      return {
        infos: [],
        warnings: [],
        errors: [],
      };
    }
  }

  initOffersMapping(offers) {
    this.offerMapping.init(offers);
  }

  initSalesModelsMapping(salesModels) {
    this.salesModelMapping.init(salesModels);
  }

  /**
   * Return an empty cart
   *
   * @return {Object} empty cart
   */
  initCart(region = 'us', currency = 'USD') {
    if (!this.user) {
      throw new Error('Cannot create shopping cart becuase user information is missing');
    }

    const contact = {
      allowToContact: (this.user.accountInformation && this.user.accountInformation.allowToContact) !== false && (this.user.accountInformation && this.user.accountInformation.allowToContact) !== 'false',
      firstName: (this.user.accountInformation && this.user.accountInformation.firstName) || (this.user.account && this.user.account.name && this.user.account.name.givenname) || '',
      lastName: (this.user.accountInformation && this.user.accountInformation.lastName) || (this.user.account && this.user.account.name && this.user.account.name.familyname) || '',
      phone: (this.user.accountInformation && this.user.accountInformation.phoneNumber) || '',
      email: (this.user.accountInformation && this.user.accountInformation.emailAddress) || (this.user.account && this.user.account.username) || '',
    };
    const company = {
      nid: (this.user.accountInformation && this.user.accountInformation.companyId) || '',
      name: (this.user.accountInformation && this.user.accountInformation.companyName) || '',
      domain: (this.user.accountInformation && this.user.accountInformation.companyDomain) || '',
      industry: (this.user.accountInformation && this.user.accountInformation.industryType) || '',
    };
    const billingAddress = {
      address1: (this.user.billingInformation && this.user.billingInformation.billingAddress) || '',
      address2: '',
      city: (this.user.billingInformation && this.user.billingInformation.billingCity) || '',
      state: (this.user.billingInformation && this.user.billingInformation.billingStateProvince) || '',
      stateISO: (this.user.billingInformation && this.user.billingInformation.billingStateProvinceISO) || '',
      zip: (this.user.billingInformation && this.user.billingInformation.billingPostalCode) || '',
      country: (this.user.billingInformation && this.user.billingInformation.billingCountry) || '',
      countryISO: (this.user.billingInformation && this.user.billingInformation.billingCountryISO) || '',
    };
    const shippingAddress = {
      address1: (this.user.shippingInformation && this.user.shippingInformation.shippingAddress) || '',
      address2: '',
      city: (this.user.shippingInformation && this.user.shippingInformation.shippingCity) || '',
      state: (this.user.shippingInformation && this.user.shippingInformation.shippingStateProvince) || '',
      stateISO: (this.user.shippingInformation && this.user.shippingInformation.shippingStateProvinceISO) || '',
      zip: (this.user.shippingInformation && this.user.shippingInformation.shippingPostalCode) || '',
      country: (this.user.shippingInformation && this.user.shippingInformation.shippingCountry) || '',
      countryISO: (this.user.shippingInformation && this.user.shippingInformation.shippingCountryISO) || '',
    };

    let cart = {
      contact,
      company,
      billingAddress,
      shippingAddress,

      region,
      currency,

      items: [],

      onetime: {
        subTotal: 0,
        discount: 0,
        tax: 0,
        shipping: 0,
        total: 0,
      },

      subscriptions: [],

      created: {
        by: this.user && (this.user._id || this.user.userId),
        on: new Date(),
      },
      updated: {
        by: undefined,
        on: undefined,
      }
    };

    return cart;
  }

  /**
   * Add one item to cart
   *
   * @param {Object} cart                     original cart
   * @param {Number} quantity                 quantity
   * @param {String} offerIdentifier          Offer identifier
   * @param {String} salesModelIdentifier     SalesModel identifier
   * @param {String} salesModelItemIdentifier SalesModelItem identifier
   * @param {String} attributeIdentifier      SalesModelItem attribute identifier
   * @param {Object} options                  Options
   *                                          - ignoreMappingError add the item even though ID cannot be found in mappings
   *                                          - overwriteQuantity  if the quantity should overwrite or increase existing record
   *                                          - attributeValue     (deprecated, use value) extra value when adding attribute
   *                                          - attributeHelper    (deprecated, use helper) extra helper when adding attribute
   *                                          - value              extra value when adding line item
   *                                          - helper             extra helper when adding line item
   *                                          - price              item price
   *                                          - references         item references
   */
  addItem(cart, quantity, offerIdentifier, salesModelIdentifier, salesModelItemIdentifier, attributeIdentifier, options) {
    const _this = this;
    const fn = `${_this.ns}[addItem]`;

    console.log(fn, `adding ${quantity} x ${offerIdentifier}: ${salesModelIdentifier}..${salesModelItemIdentifier}..${attributeIdentifier}(${JSON.stringify(options)}) to cart:`, cart.items.map((one) => one.identifier));

    options = Object.assign({
      ignoreMappingError: false,
      overwriteQuantity: false,
      attributeValue: null,
      attributeHelper: null,
      value: null,
      helper: null,
      price: null,
      references: null,
    }, options);

    quantity = quantity ? parseInt(quantity, 10) : 0;

    if (!cart) {
      cart = _this.initCart();
    }

    const oo = _this.offerMapping.getOneByIdentifier(offerIdentifier);
    const offer = (oo && {
      _id: oo._id,
      identifier: oo.identifier,
    }) || (options.ignoreMappingError ? {
      identifier: offerIdentifier,
    } : null);

    let id1 = '',
      id2 = '',
      id3 = '',
      level = -1;
    if (salesModelIdentifier) {
      id1 = salesModelIdentifier;
      level = 0;
    }
    if (salesModelItemIdentifier) {
      id2 = `${salesModelIdentifier}..${salesModelItemIdentifier}`;
      level = 1;
    }
    if (attributeIdentifier) {
      id3 = `${salesModelIdentifier}..${salesModelItemIdentifier}..${attributeIdentifier}`;
      level = 2;
    }
    if (level < 0) {
      throw new Error('Invalid parameters, salesModelIdentifier is required');
    }
    const o1 = _this.salesModelMapping.getOneByIdentifier(id1);
    if (id1 && !o1) {
      console.warn(fn, `Failed to find "${id1}"`);
    }
    const o2 = _this.salesModelMapping.getOneByIdentifier(id2);
    if (id2 && !o2) {
      console.warn(fn, `Failed to find "${id2}"`);
    }
    const o3 = _this.salesModelMapping.getOneByIdentifier(id3);
    if (id3 && !o3) {
      console.warn(fn, `Failed to find "${id3}"`);
    }

    const salesModel = (o1 && {
      _id: o1._id,
      identifier: o1.identifier,
    }) || (options.ignoreMappingError ? {
      identifier: salesModelIdentifier,
    } : null);
    if (salesModel && level === 0 && options.value) {
      salesModel.value = options.value;
    }
    if (salesModel && level === 0 && options.helper) {
      salesModel.helper = options.helper;
    }
    if (id1 && (salesModel.value || salesModel.helper)) {
      id1 += '(' +
        (salesModel.value ? JSON.stringify(salesModel.value) : '') +
        ',' +
        (salesModel.helper ? JSON.stringify(salesModel.helper) : '') +
        ')';
    }

    const salesModelItem = (o2 && {
      _id: o2._id,
      identifier: o2.identifier,
    }) || (options.ignoreMappingError ? {
      identifier: salesModelItemIdentifier,
    } : null);
    if (salesModelItem && level === 1 && options.value) {
      salesModelItem.value = options.value;
    }
    if (salesModelItem && level === 1 && options.helper) {
      salesModelItem.helper = options.helper;
    }
    if (id2 && (salesModelItem.value || salesModelItem.helper)) {
      id2 += '(' +
        (salesModelItem.value ? JSON.stringify(salesModelItem.value) : '') +
        ',' +
        (salesModelItem.helper ? JSON.stringify(salesModelItem.helper) : '') +
        ')';
    }

    let attribute = (o3 && {
      _id: o3._id,
      identifier: o3.identifier,
    }) || (options.ignoreMappingError ? {
      identifier: attributeIdentifier,
    } : null);
    if (attribute && level === 2 && options.attributeValue) {
      attribute.value = options.attributeValue;
    }
    if (attribute && level === 2 && options.attributeHelper) {
      attribute.helper = options.attributeHelper;
    }
    if (attribute && level === 2 && options.value) {
      attribute.value = options.value;
    }
    if (attribute && level === 2 && options.helper) {
      attribute.helper = options.helper;
    }
    if (id3 && (attribute.value || attribute.helper)) {
      id3 += '(' +
        (attribute.value ? JSON.stringify(attribute.value) : '') +
        ',' +
        (attribute.helper ? JSON.stringify(attribute.helper) : '') +
        ')';
    }

    // find existing, and last spot of parent level
    let exist1 = -1,
      exist2 = -1,
      exist3 = -1,
      id2Parent = id2 && id2.split('..').slice(0, -1).join('..'),
      id2ParentLength = id2Parent && id2Parent.length,
      id3Parent = id3 && id3.split('..').slice(0, -1).join('..'),
      id3ParentLength = id3Parent && id3Parent.length,
      lastSibling2 = -1,
      lastSibling3 = -1;
    for (let ci in cart.items) {
      ci = parseInt(ci, 10);
      const item = cart.items[ci];
      if (id1 && item.identifier === id1) {
        exist1 = ci;
      }
      if (id2 && item.identifier === id2) {
        exist2 = ci;
      }
      if (id3 && item.identifier === id3) {
        exist3 = ci;
      }

      if (id3 && id3ParentLength && (
          item.identifier === id3Parent ||
          item.identifier.substr(0, id3ParentLength) + '..' === id3Parent + '..'
        )) {
        lastSibling3 = ci;
      }
      if (id2 && id2ParentLength && (
          item.identifier === id2Parent ||
          item.identifier.substr(0, id2ParentLength) + '..' === id2Parent + '..'
        )) {
        lastSibling2 = ci;
      }
    }

    if (exist3 > -1) {
      // update existing
      if (options.overwriteQuantity) {
        cart.items[exist3].quantity = quantity;
      } else {
        cart.items[exist3].quantity += quantity;
      }
      if (options.references !== null) {
        cart.items[exist3].references = options.references;
      }
      if (options.price !== null) {
        cart.items[exist3].price = options.price;
      }
    } else if (id3) {
      // append
      if (exist2 > -1) {
        let newItem = { offer, salesModel, salesModelItem, attribute, quantity };
        if (options.price !== null) {
          newItem.price = options.price;
        }
        if (options.references !== null) {
          newItem.references = options.references;
        }
        cart.items.splice(lastSibling3 + 1, 0, newItem);
      } else {
        throw new Error('Add salesModelItem before adding attribute');
      }
    } else if (exist2 > -1) {
      // update existing
      if (options.overwriteQuantity) {
        cart.items[exist2].quantity = quantity;
      } else {
        cart.items[exist2].quantity += quantity;
      }
      if (options.references !== null) {
        cart.items[exist2].references = options.references;
      }
      if (options.price !== null) {
        cart.items[exist2].price = options.price;
      }
    } else if (id2) {
      // append
      if (exist1 > -1) {
        let newItem = { offer, salesModel, salesModelItem, quantity };
        if (options.price !== null) {
          newItem.price = options.price;
        }
        if (options.references !== null) {
          newItem.references = options.references;
        }
        cart.items.splice(lastSibling2 + 1, 0, newItem);
      } else {
        throw new Error('Add salesModel before adding salesModelItem');
      }
    } else if (exist1 > -1) {
      // update existing
      if (options.overwriteQuantity) {
        cart.items[exist1].quantity += quantity;
      } else {
        cart.items[exist1].quantity += quantity;
      }
      if (options.references !== null) {
        cart.items[exist1].references = options.references;
      }
      if (options.price !== null) {
        cart.items[exist1].price = options.price;
      }
    } else if (id1) {
      // append
      let newItem = { offer, salesModel, quantity };
      if (options.price !== null) {
        newItem.price = options.price;
      }
      if (options.references !== null) {
        newItem.references = options.references;
      }
      cart.items.push(newItem);
    }
    cart = this.calculateCartItemFields(cart);

    return cart;
  }

  calculateCartItemFields(cart) {
    const _this = this;
    const simpleCopyFields = ['legalDocuments', 'regularPrice', 'price', 'quantityUnit'];

    for (let ci in cart.items) {
      let item = cart.items[ci];
      let o;

      const offerId = item.offer && item.offer.identifier;
      // populate offer
      if (offerId) {
        o = _this.offerMapping.getOneByIdentifier(offerId);
        item.offer = { ...o, ...item.offer };
      }

      const salesModelId = item.salesModel && item.salesModel.identifier;
      const salesModelItemId = item.salesModelItem && item.salesModelItem.identifier;
      const salesModelItemAttributesId = item.attribute && item.attribute.identifier;

      // populate salesModel, salesModelItem, attribute
      // calculate cart item level and identifier
      let level = 0,
        identifier = [];
      if (salesModelId) {
        identifier.push(salesModelId);
        o = _this.salesModelMapping.getOneByIdentifier(identifier.join('..'));
        item.salesModel = { ...o, ...item.salesModel };
        if (salesModelItemId) {
          level++;
          identifier.push(salesModelItemId);
          o = _this.salesModelMapping.getOneByIdentifier(identifier.join('..'));
          item.salesModelItem = { ...o, ...item.salesModelItem };
          if (salesModelItemAttributesId) {
            level++;
            identifier.push(salesModelItemAttributesId);
            o = _this.salesModelMapping.getOneByIdentifier(identifier.join('..'));
            item.attribute = { ...o, ...item.attribute };
          }
        }
      }
      item.level = level;
      const userAdjustedItemContext = findCartItemContext(item);
      let itemContextDistinguishInfo = '';
      if (userAdjustedItemContext && (userAdjustedItemContext.value || userAdjustedItemContext.helper)) {
        itemContextDistinguishInfo = '(' +
          (userAdjustedItemContext.value ? JSON.stringify(userAdjustedItemContext.value) : '') +
          ',' +
          (userAdjustedItemContext.helper ? JSON.stringify(userAdjustedItemContext.helper) : '') +
          ')';
      }
      item.identifier = identifier.join('..') + itemContextDistinguishInfo;

      if (!identifier) {
        // empty item?
        item.quantity = 0; // remove it later
        continue;
      }

      // calculate
      // - title
      // - additionalInformation
      // - engines
      // - references
      // - isOneTimeCharge
      // - hidden
      // - simpleCopyFields: legalDocuments, regularPrice, price, quantityUnit
      let itemContext = _this.salesModelMapping.getOneByIdentifier(item.identifier);
      if (userAdjustedItemContext && (userAdjustedItemContext.value || userAdjustedItemContext.helper)) {
        itemContext = { ...itemContext, value: userAdjustedItemContext.value, helper: userAdjustedItemContext.helper };
      }
      let itemProduct = null;
      if (item.level === 0) {
        if (item.salesModel && item.salesModel.product && item.salesModel.product.identifier) {
          itemProduct = item.salesModel && item.salesModel.product;
        }
      } else if (item.level === 1) {
        if (item.salesModelItem && item.salesModelItem.product && item.salesModelItem.product.identifier) {
          itemProduct = (item.salesModelItem && item.salesModelItem.product);
        } else if (item.salesModel && item.salesModel.product && item.salesModel.product.identifier) {
          itemProduct = item.salesModel && item.salesModel.product;
        }
      } else if (item.level === 2) {
        if (item.attribute && item.attribute.product && item.attribute.product.identifier) {
          itemProduct = (item.attribute && item.attribute.product);
        } else if (item.salesModelItem && item.salesModelItem.product && item.salesModelItem.product.identifier) {
          itemProduct = (item.salesModelItem && item.salesModelItem.product);
        } else if (item.salesModel && item.salesModel.product && item.salesModel.product.identifier) {
          itemProduct = item.salesModel && item.salesModel.product;
        }
      }
      if (!item.hasOwnProperty('title') && itemContext) {
        let cartTitle = null;
        if (itemContext.descriptions && itemContext.descriptions.length) {
          cartTitle = itemContext.descriptions.find(one => one.identifier === CART_TITLE_DESCRIPTIONS_IDENTIFIER);
        }
        if (cartTitle && cartTitle.text) {
          item.title = {
            text: cartTitle.text,
            resource: cartTitle.resource,
          };
        } else if (itemContext.title && itemContext.title.text) {
          item.title = itemContext.title;
        }
      }
      if (!item.hasOwnProperty('additionalInformation') && itemContext) {
        if (itemContext.value) {
          item.additionalInformation = { text: itemContext.value };
        } else if (itemContext.helper && typeof itemContext.helper === 'object' && itemContext.helper !== null) {
          // FIXME
          let helperObj = Object.assign({}, itemContext.helper);
          delete helperObj.internal;
          let vals = Object.values(helperObj).filter(item => typeof item === 'string');
          item.additionalInformation = { text: vals.join(', ') };
        }
      }
      if (itemProduct && itemProduct.engines) {
        item.engines = itemProduct.engines;
      }
      if (itemContext && itemContext.references) {
        item.references = {
          ...itemContext.references,
          ...item.references,
        };
      }
      if (!item.hasOwnProperty('isOneTimeCharge') && itemContext && itemContext.hasOwnProperty('isOneTimeCharge')) {
        item.isOneTimeCharge = (itemContext && itemContext.isOneTimeCharge) || false;
      }
      if (!item.hasOwnProperty('hidden') && itemContext && itemContext.hideInCart) {
        item.hidden = true;
      }
      simpleCopyFields.map(field => {
        if (!item.hasOwnProperty(field) && itemContext && itemContext[field]) {
          item[field] = itemContext[field];
        }
      });
    }

    return cart;
  }

  _getRuleModule(module) {
    let ruleModule = preloadRuleModules[module];
    if (!ruleModule) {
      throw new Error(`Rule ${module} must be preloaded before using`);
    }

    return ruleModule;
  }

  _attachCartEvents(cart) {
    const _this = this;

    // clean listener
    _this.emitter.removeAllListeners(SALESMODEL_RULE_HOOK_EVENTS.BEFORE_UPDATE_CART);

    for (let ci in cart.items) {
      let item = cart.items[ci];
      const itemContext = _this.salesModelMapping.getOneByIdentifier(item.identifier);
      const rules = itemContext && itemContext.rules;
      for (let ri in rules) {
        const rule = rules[ri];
        const ruleIdentifier = rule.identifier;
        const ruleEvent = rule.event;
        let ruleParameters = {};
        if (rule.parameters) {
          rule.parameters.forEach((p) => {
            ruleParameters[p.parameter] = p.value;
          });
        }

        const ruleModule = _this._getRuleModule(ruleIdentifier);
        const context = {
          itemIndex: ci,
          item,
          parameters: ruleParameters,
        };
        _this.emitter.on(ruleEvent, ruleModule(context));
      }
    }

    // add universal listeners
    _this.emitter.on(SALESMODEL_RULE_HOOK_EVENTS.BEFORE_UPDATE_CART, _this._getRuleModule('universal-update-currency')());
    _this.emitter.on(SALESMODEL_RULE_HOOK_EVENTS.BEFORE_UPDATE_CART, _this._getRuleModule('universal-check-region')());
    _this.emitter.on(SALESMODEL_RULE_HOOK_EVENTS.BEFORE_UPDATE_CART, _this._getRuleModule('universal-quantity-restriction')());
    _this.emitter.on(SALESMODEL_RULE_HOOK_EVENTS.BEFORE_UPDATE_CART, _this._getRuleModule('universal-remove-0qty-items')());
    _this.emitter.on(SALESMODEL_RULE_HOOK_EVENTS.BEFORE_UPDATE_CART, _this._getRuleModule('universal-adjust-discount-price')());
    _this.emitter.on(SALESMODEL_RULE_HOOK_EVENTS.BEFORE_UPDATE_CART, _this._getRuleModule('universal-calculate-subtotal')());
    _this.emitter.on(SALESMODEL_RULE_HOOK_EVENTS.BEFORE_UPDATE_CART, _this._getRuleModule('universal-aggregate-discount')());
    _this.emitter.on(SALESMODEL_RULE_HOOK_EVENTS.BEFORE_UPDATE_CART, _this._getRuleModule('universal-calculate-total')());

    console.log(_this.ns, 'total', _this.emitter.listenerCount(SALESMODEL_RULE_HOOK_EVENTS.BEFORE_UPDATE_CART), 'listeners registered to', SALESMODEL_RULE_HOOK_EVENTS.BEFORE_UPDATE_CART);

    return cart;
  }

  update(cart) {
    const _this = this;
    const event = SALESMODEL_RULE_HOOK_EVENTS.BEFORE_UPDATE_CART;
    const fn = `${_this.ns}[update]`;
    const { ErrorMessage, SALESMODELRULES } = require('../error');

    cart = _this.calculateCartItemFields(cart);
    _this._attachCartEvents(cart);

    // reset logs
    _this.logging.resetLogs();
    _this.emitter.resetLogs(SALESMODEL_RULE_HOOK_EVENTS.BEFORE_UPDATE_CART);

    try {
      const context = { event, cart, CSMRH: _this };
      _this.emitter.emit(event, context);

      // import loggings from emitter
      const logs = _this.emitter.getAll(event);
      if (logs.infos && logs.infos.length) {
        console.log(fn, 'PROCESS INFOS:', logs.infos);
        _this.logging.importInfos(logs.infos);
      }
      if (logs.warnings && logs.warnings.length) {
        console.log(fn, 'PROCESS WARNINGS:', logs.warnings);
        _this.logging.importWarnings(logs.warnings);
      }
      if (logs.errors && logs.errors.length) {
        console.log(fn, 'PROCESS ERRORS:', logs.errors);
        _this.logging.importErrors(logs.errors);
      }
    } catch (err) {
      console.log(fn, 'UNKNOWN ERROR:', err);
      _this.logging.error(new ErrorMessage(fn, SALESMODELRULES.UNKNOWN_ERROR, {
        text: 'Unknown error',
        resource: ['SALESMODELRULE.UNKNOWN_ERROR'],
      }, err));
    }

    // mark as updated
    cart.updated = {
      by: cart.created.by,
      on: new Date(),
    };

    // console.log(fn, 'cart updated:', cart);

    return cart;
  }

  sanitize(cart) {
    let sanitized = {};
    const cartFields = ['contact', 'company', 'billingAddress', 'shippingAddress', 'partner', 'partnerAgent', 'quote', 'region', 'currency'];
    const cartItemFields = ['offer', 'salesModel', 'salesModelItem', 'attribute'];

    for (let key of cartFields) {
      if (cart[key]) {
        sanitized[key] = cart[key];
      }
    }

    sanitized.items = [];
    for (let item of cart.items) {
      let sanitizedItem = {};

      for (let key of cartItemFields) {
        if (item[key]) {
          sanitizedItem[key] = {
            _id: item[key]._id,
            identifier: item[key].identifier,
          };

          if (item[key].value) {
            sanitizedItem[key].value = item[key].value;
          }
          if (item[key].helper) {
            sanitizedItem[key].helper = item[key].helper;
          }
        }
      }

      sanitizedItem.quantity = item.quantity;

      sanitized.items.push(sanitizedItem);
    }

    return sanitized;
  }

  getSiblingsSync(cart, identifier, tag) {
    const _this = this;
    const identifierSplited = identifier.split(_this.options.separator);
    const siblingsIdentifier = identifierSplited.slice(0, -1).join(_this.options.separator) + _this.options.separator;
    const siblingsIdentifierStartLoc = siblingsIdentifier.length;

    let results = [];

    if (!tag) {
      return results;
    }

    for (let ci in cart.items) {
      const item = cart.items[ci];
      const itemIdentifier = item.identifier;
      const itemContext = findCartItemContext(item);
      const itemTags = itemContext.tags;
      if (!itemTags || itemTags.length === 0 || itemTags.indexOf(tag) === -1) {
        continue;
      }

      let isSibling = false;
      if (siblingsIdentifierStartLoc === 0) {
        isSibling = itemIdentifier.indexOf(_this.options.separator) === -1;
      } else {
        isSibling = itemIdentifier.substr(0, siblingsIdentifierStartLoc) === siblingsIdentifier &&
          itemIdentifier.substr(siblingsIdentifierStartLoc).indexOf(_this.options.separator) === -1;
      }

      if (isSibling) {
        results.push(ci);
      }
    }

    return results;
  }
}

module.exports = CartSalesModelRulesHandler;
