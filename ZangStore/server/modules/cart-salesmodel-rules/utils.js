const generateSubscriptionIdentifier = (subscription) => {
  // - 1-month-billing-1-year-contract-1-month-trial
  return [
    (subscription && subscription.billingInterval) || 0,
    (subscription && subscription.billingPeriod) || '',
    'billing',
    (subscription && subscription.contractLength) || 0,
    (subscription && subscription.contractPeriod) || '',
    'contract',
    (subscription && subscription.trialLength) || 0,
    (subscription && subscription.trialPeriod) || '',
    'trial',
  ].join('-');
};

const cartHasProductsOf = (cart, productEngine) => {
  let exists = [];

  if (cart && cart.items) {
    for (let ci in cart.items) {
      const item = cart.items[ci];
      if (item && item.engines && Array.isArray(item.engines) &&
        item.engines.indexOf(productEngine) > -1) {
        exists.push(parseInt(ci, 10));
      }
    }
  }

  return exists.length > 0 ? exists : false;
};

const findCartItemContext = (cartItem, level) => {
  if (level >= 0)  {
    return cartItem && (level === 0 ? cartItem.salesModel : (
      level === 1 ? cartItem.salesModelItem : (
        level === 2 ? cartItem.attribute : null)));
  }
  return cartItem && (cartItem.level === 0 ? cartItem.salesModel : (
    cartItem.level === 1 ? cartItem.salesModelItem : (
      cartItem.level === 2 ? cartItem.attribute : null)));
}

const findCartItemByIdentifier = (cart, identifier) => {
  let index = 0;
  for (let item of cart.items)  {
    if (item.identifier == identifier)  {
      return { item, index };
    }
    index++;
  }
}

const findCartItemsBySalesModelAndTags = (cart, salesModelIdentifier, tags) => {
  const result = [];

  if (!Array.isArray(tags)) {
    tags = [tags];
  }

  for (let item of cart.items) {
    const itemSalesModelIdentifier = item && item.salesModel && item.salesModel.identifier;

    if (!itemSalesModelIdentifier || itemSalesModelIdentifier !== salesModelIdentifier) {
      continue;
    }

    const itemContext = findCartItemContext(item);
    const itemTags = itemContext && itemContext.tags;
    if (!itemTags || !itemTags.length) {
      continue;
    }

    let found = false;
    for (let tag of tags) {
      if (itemTags.indexOf(tag) > -1) {
        found = true;
        break;
      }
    }

    if (found) {
      result.push(item);
    }
  }

  return result;
};

const findCurrencyFromRegion = async (region) => {
  const currencyMap = {
    'US': 'USD',
    'DE': 'EUR',
    'CA': 'CAD',
    'UK': 'GBD'
  };

  region = region ? region.toUpperCase() : null;

  return currencyMap[region];
};

const findAddressClassFromRegion = async (region) => {
  const addressClassMap = {
    'US': 0,
    'DE': 1,
    'CA': 2,
    'UK': 2
  };

  region = region ? region.toUpperCase() : null;

  return addressClassMap[region];
};

const findCartItemsBySalesModelItemAndTags = (cart, salesModelIdentifier, tags) => {
  const result = [];

  if (!Array.isArray(tags)) {
    tags = [tags];
  }

  for (let item of cart.items) {
    const itemSalesModelIdentifier = item && item.salesModelItem && item.salesModelItem.identifier;

    if (!itemSalesModelIdentifier || itemSalesModelIdentifier !== salesModelIdentifier) {
      continue;
    }

    const itemContext = findCartItemContext(item);
    const itemTags = itemContext && itemContext.tags;
    if (!itemTags || !itemTags.length) {
      continue;
    }

    let found = false;
    for (let tag of tags) {
      if (itemTags.indexOf(tag) > -1) {
        found = true;
        break;
      }
    }

    if (found) {
      result.push(item);
    }
  }

  return result;
};

class OfferMapping {
  constructor() {
    this._mapping = {};
  }

  _appendOne(doc) {
    const offerIdentifier = doc.identifier;
    if (offerIdentifier) {
      this._mapping[offerIdentifier] = doc;
    }
  }

  appendMultiple(docs) {
    let _this = this;

    if (Array.isArray(docs)) {
      docs.forEach((doc) => {
        _this._appendOne(doc);
      });
    } else if (docs && docs.identifier) {
      _this._appendOne(docs);
    }
  }

  init(docs) {
    this._mapping = {};
    this.appendMultiple(docs);
  }

  getOneByIdentifier(identifier) {
    return (identifier && this._mapping[identifier]) || undefined;
  }
}

class SalesModelMapping {
  constructor(options) {
    this.options = Object.assign({ separator: '..' }, options);

    this._mapping = {};
  }

  _appendOne(doc) {
    const _this = this;

    const salesModelIdentifier = doc.identifier;
    if (salesModelIdentifier) {
      this._mapping[salesModelIdentifier] = doc;

      doc.items.forEach((salesModelItem) => {
        const smiIdentifier = salesModelItem.identifier;

        if (smiIdentifier) {
          this._mapping[`${salesModelIdentifier}${_this.options.separator}${smiIdentifier}`] = salesModelItem;

          salesModelItem.attributes.forEach((attribute) => {
            const attributeIdentifier = attribute.identifier;

            if (attributeIdentifier) {
              this._mapping[`${salesModelIdentifier}${_this.options.separator}${smiIdentifier}${_this.options.separator}${attributeIdentifier}`] = attribute;
            }
          });
        }
      });
    }
  }

  appendMultiple(docs) {
    let _this = this;

    if (Array.isArray(docs)) {
      docs.forEach((doc) => {
        _this._appendOne(doc);
      });
    } else if (docs && docs.identifier) {
      _this._appendOne(docs);
    }
  }

  init(docs) {
    this._mapping = {};
    this.appendMultiple(docs);
  }

  getOneByIdentifier(identifier) {
    const loc = identifier.indexOf('(');
    if (loc > -1) {
      identifier = identifier.substr(0, loc);
    }

    return (identifier && this._mapping[identifier]) || undefined;
  }

  async getSiblings(identifier, tag) {
    const _this = this;
    const identifierSplited = identifier.split(_this.options.separator);
    const siblingsIdentifier = identifierSplited.slice(0, -1).join(_this.options.separator) + _this.options.separator;
    const siblingsIdentifierStartLoc = siblingsIdentifier.length;

    const { nonBlockify } = require('../utils');

    const isSibling = nonBlockify((key) => {
      if (siblingsIdentifierStartLoc === 0) {
        return key.indexOf(_this.options.separator) === -1;
      } else {
        return key.substr(0, siblingsIdentifierStartLoc) === siblingsIdentifier &&
          key.substr(siblingsIdentifierStartLoc).indexOf(_this.options.separator) === -1;
      }
    });

    let results = {};

    for (let key in this._mapping) {
      if (!this._mapping[key].tags || this._mapping[key].tags.indexOf(tag) === -1) {
        continue;
      }

      let yes = await isSibling(key);
      if (yes) {
        results[key] = this._mapping[key];
      }
    }

    return results;
  }


  getSiblingsSync(identifier, tag) {
    const _this = this;
    const identifierSplited = identifier.split(_this.options.separator);
    const siblingsIdentifier = identifierSplited.slice(0, -1).join(_this.options.separator) + _this.options.separator;
    const siblingsIdentifierStartLoc = siblingsIdentifier.length;

    let results = {};

    if (!tag) {
      return results;
    }

    for (let key in this._mapping) {
      if (!this._mapping[key].tags || this._mapping[key].tags.length === 0 || this._mapping[key].tags.indexOf(tag) === -1) {
        continue;
      }

      let isSibling = false;
      if (siblingsIdentifierStartLoc === 0) {
        isSibling = key.indexOf(_this.options.separator) === -1;
      } else {
        isSibling = key.substr(0, siblingsIdentifierStartLoc) === siblingsIdentifier &&
          key.substr(siblingsIdentifierStartLoc).indexOf(_this.options.separator) === -1;
      }

      if (isSibling) {
        results[key] = this._mapping[key];
      }
    }

    return results;
  }
}

module.exports = {
  generateSubscriptionIdentifier,
  cartHasProductsOf,
  findCartItemContext,
  findCurrencyFromRegion,
  findCartItemsBySalesModelAndTags,
  findCartItemsBySalesModelItemAndTags,
  OfferMapping,
  SalesModelMapping,
  findCartItemByIdentifier,
};
