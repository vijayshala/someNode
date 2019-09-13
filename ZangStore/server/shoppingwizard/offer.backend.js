import DBWrapper from 'dbwrapper';
import logger from 'applogger';
import LRU from 'lru-cache';
import {
  OfferSchema
} from './offer.model';

import {
  getProductById
} from '../product/product.backend';

var ns = '[offer.backend]'
var lruCache = LRU({
  max: 100,
  maxAge: 1000 * 10
});
var CACHE_KEY_PREFIX = 'offer';
var CACHE_KEY_PREFIX_SLUG = 'offer-slug';

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

export async function getOffer(req, query, populateChilds = true) {
  let fn = `[${req.requestId}]${ns}[getOffer]`
  logger.info(fn, 'query', query);
  let offer = await OfferSchema.findOne(query);
  cacheOffer(offer);
  if (offer && populateChilds) {
    if (populateChilds) {
      return await populateOffer(req, offer)
    }
  }
  return offer;
}

export async function populateOffer(req, offerObj) {
  let fn = `[${req.requestId}]${ns}[populateOffer]`
  let offer= null  
  if (offerObj) {
    offer = offerObj.toJSON();
    let items = []
    // logger.info(fn, 'offer=====', offer)
    for (var offerItem of offer.items) {
      // logger.info(fn, 'offerItem=====', offerItem)
      items.push({
        ...offerItem,
        product: await getProductById(req, offerItem.product._id)
      })
    }
    offer.items = items;
    return offer;
  }
  return offer;
}

export async function getOfferById(req, id) {
  let fn = `[${req.requestId}]${ns}[getOfferById]`
  let cacheKey = `${CACHE_KEY_PREFIX}_${id}`;
  let offer = lruCache.get(cacheKey);
  if (offer) {
    logger.info(fn, '===========read from cache', offer._id);
  } else {
    offer = await getOffer(req, {
      _id: id
    });
    cacheOffer(offer);
  }
  return offer;
}

export async function getOfferBySlug(req, slug) {
  let fn = `[${req.requestId}]${ns}[getOfferBySlug]`
  let cacheKey = `${CACHE_KEY_PREFIX_SLUG}_${slug}`;
  let offerId = lruCache.get(`${CACHE_KEY_PREFIX_SLUG}_${slug}`);
  let offer = offerId && lruCache.get(`${CACHE_KEY_PREFIX}_${offerId}`)
  if (offer) {
    logger.info(fn, '===========read from cache', offer._id);
  } else {
    offer = await getOffer(req, {
      slug: slug
    });
    cacheOffer(offer);
  }
  return offer;
}

export async function getOffers(req, query) {
  return await OfferSchema.find(query);
}

export async function getOffersByBaseSku(req, baseSku, populateChilds = true) {
  let fn = `[${req.requestId}]${ns}[saveOffer]`
  let foundPrds = await getOffers(req, {
    'baseOffer.sku': baseSku
  });

  if (populateChilds) {
    return await Promise.all(foundPrds.map(async (offer) => {
      return await populateOffer(req, offer);
    }))
  }
  return foundPrds;
}

export async function saveOffer(req, offer) {
  let fn = `[${req.requestId}]${ns}[saveOffer]`
  logger.info(fn, JSON.stringify(offer));
  var newOffer = new OfferSchema(offer);
  return await newOffer.save();
}

export async function saveOffers(req, offers = []) {
  let fn = `[${req.requestId}]${ns}[saveOffers]`
  let res = []
  for (var offer of offers) {
    let newoffer = await saveOffer(req, offer);
    res.push(newoffer);
  }
  logger.info(fn, '========res:', JSON.stringify(res));
  return res;
}

export async function getAllOffers(req) {
  return await getOffers(req, {});
}


export async function getOffersByCategory(req, category, populateChilds = true) {
  let fn = `[${req.requestId}]${ns}[getOffersByCategory]`
 
  let offers = await getOffers(req, {
    categories: category
  });
    
  if (populateChilds) {
    let results = []    
    for (var offer of offers) {      
      let offer = await populateOffer(req, offer);
      logger.info(fn, '========offer:', JSON.stringify(offer));
      results.push(offer)
    }
    return results;
  }
  return offers;
}
