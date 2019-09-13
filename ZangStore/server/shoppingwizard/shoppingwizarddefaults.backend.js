import DBWrapper from 'dbwrapper';
import logger from 'applogger';
import LRU from 'lru-cache';
import {
  ShoppingWizardDefaultSchema
} from './shoppingwizarddefaults.model';

var ns = '[shoppingwizarddefaults.backend]'
var lruCache = LRU({
  max: 100,
  maxAge: 1000 * 10
});
var CACHE_KEY_PREFIX = 'shoppingwizarddefaults';
var CACHE_KEY_PREFIX_SLUG = 'shoppingwizarddefaults-slug';

function cacheOffer(obj) {
  cacheById(obj);
  cacheBySlug(obj);
}

function cacheById(obj) {
  if (obj) {
    let cacheKey = `${CACHE_KEY_PREFIX}_${obj._id}`;
    logger.info('cacheById====', cacheKey);
    lruCache.set(cacheKey, obj);
  }
}

function cacheBySlug(obj) {
  if (obj) {
    let cacheKey = `${CACHE_KEY_PREFIX_SLUG}_${obj.slug}`;
    logger.info('cacheBySlug====', cacheKey);
    lruCache.set(cacheKey, obj._id);
  }
}

export async function getShoppingWizardDefaults(req, query) {
  let fn = `[${req.requestId}]${ns}[getShoppingWizardDefaults]`
  logger.info(fn, 'query', query);
  let offer = await ShoppingWizardDefaultSchema.findOne(query);
  cacheOffer(offer);
  return offer;
}

export async function getShoppingWizardDefaultsBySlug(req, slug) {
  let fn = `[${req.requestId}]${ns}[getShoppingWizardDefaultsBySlug]`
  let cacheKey = `${CACHE_KEY_PREFIX_SLUG}_${slug}`;
  let offerId = lruCache.get(`${CACHE_KEY_PREFIX_SLUG}_${slug}`);
  let offer = offerId && lruCache.get(`${CACHE_KEY_PREFIX}_${offerId}`)
  if (offer) {
    logger.info(fn, '===========read from cache', offer._id);
  } else {
    offer = await getShoppingWizardDefaults(req, {
      slug: slug
    });
    cacheOffer(offer);
  }
  return offer;
}


export async function saveShoppingWizardDefaults(req, shoppingWizardDefault) {
  let fn = `[${req.requestId}]${ns}[shoppingWizardDefault]`
  logger.info(fn, shoppingWizardDefault);
  var newDefaults = new ShoppingWizardDefaultSchema(shoppingWizardDefault);
  return await newDefaults.save();
}


export async function getWizardConfigDefaultOffer(req, defaultProdConfig = {}) {
  let fn = `[${req.requestId}]${ns}[getWizardConfigDefaultOffer]`
  let data = defaultProdConfig.data || {}
  let offers = data.offers || []
  let selectedOffer = {}
  let i = 0;
  for (var offer of offers) {
    logger.info(fn, 'offer:', offer)
    selectedOffer = offer;
    if (offer.default) {
      return offer;
    }
  }
  return selectedOffer;
}
