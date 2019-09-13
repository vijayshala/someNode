const ns = '[product.controller]';
const logger = require('applogger');

const { OfferBackend } = require('./offer.backend');
const { CartBackend } = require('../cart/cart.backend');
const { RegionBackend } = require('../region/region.backend');
import { AVAILABLE_REGIONS, DEFAULT_REGION } from '../region/region.constants'
const { BadRequestError } = require('../modules/error');

import {
  getShoppingWizardDefaultsBySlug,
  getWizardConfigDefaultOffer
} from '../shoppingwizard/shoppingwizarddefaults.backend'

/**
 * /api/offers/:slug
 *
 * Return offer by ID
 *
 * @param  {String} slug      offer identifier
 * @param  {String} id-type   identifier type, can be '_id', 'identifier', 'slug'. Default is 'slug'
 * @param  {String} populate  if populate fields, can be one of many 'children', 'salesmodel'. Separated by comma ','.
 */
const getOffer = async(req, res, next) => {
  const fn = `[${req.requestId}]${ns}[getOffer]`
  const slug = req.params.slug;
  const identifierType = req.query['id-type'] || 'slug';
  const populate = (req.query.populate && req.query.populate.split(',')) || [];
  logger.info(fn, 'slug=', slug, 'identifierType=', identifierType, 'populate=', populate);

  try {
    if (['_id', 'identifier', 'slug'].indexOf(identifierType) === -1) {
      throw new BadRequestError();
    }
    if (identifierType === '_id' && !slug.match(/^[0-9a-f]{24}$/)) {
      throw new BadRequestError('Invalid ID');
    }

    let offer = await OfferBackend.findOneByIdentifier(slug, {
      requestId: req.requestId,
      localizer: req.localizer,
      identifierType,
      populate,
    });
    // logger.info(fn, 'offer:', offer);

    res.status(200).json({
      error: false,
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * /api/offers
 *
 * Return Offers by tags or [TODO]
 *
 * @param  {String} ids       identifier list
 * @param  {String} id-type   identifier type, can be '_id', 'tags'. Default is 'tags'
 * @param  {String} populate  if populate fields, can be one of many 'children', 'salesmodel'. Separated by comma ','.
 */
const getOffers = async(req, res, next) => {
  const fn = `[${req.requestId}]${ns}[getOffers]`;
  const identifierType = req.query['id-type'] || 'tags';
  const ids = (req.query.ids && req.query.ids.split(',')) || [];
  const populate = (req.query.populate && req.query.populate.split(',')) || [];
  logger.info(fn, 'identifierType=', identifierType, 'ids=', ids, 'populate=', populate);

  try {
    if (!ids || ids.length === 0) {
      throw new BadRequestError('identifier list (ids) is required');
    }

    let offers = await OfferBackend.findAllByIdentifiers(ids, {
      requestId: req.requestId,
      localizer: req.localizer,
      identifierType,
      populate,
    });
    // logger.info(fn, 'offers:', offers);

    res.status(200).json({
      error: false,
      data: offers,
    });
  } catch (error) {
    next(error);
  }
};

const getOffersByRegion = async(req, res, next) => {
  const fn = `[${req.requestId}]${ns}[getOffersByRegion]`;
  let region = req.params.region;
  if (!region || AVAILABLE_REGIONS.indexOf(region.toLowerCase()) == -1) {
    region = DEFAULT_REGION;
  }
  let offers = await OfferBackend.findOfferByRegions(region, {
    requestId: req.requestId,
    localizer: req.localizer
  })

  console.log('Got Offers', offers)
  res.status(200).json({
    error: false,
    data: offers,
  });
}

const getOffersByTag = async(req, res, next) => {
  const fn = `[${req.requestId}]${ns}[getOffersByTag]`;
  let offerTag = req.params.offerTag;
  logger.info(fn, 'offerType', offerTag);
  let offers = await OfferBackend.find({
    active: true,
    tags: offerTag,
    salesModels: { "$exists": true }
  }, {
    requestId: req.requestId,
    localizer: req.localizer
  })

  logger.info(fn , 'Got Offers', offers)
  res.status(200).json({
    error: false,
    data: offers,
  });
}

const viewOffer = async(req, res, next) => {
  const fn = `[${req.requestId}]${ns}[viewOffer]`
  const user = req.userInfo;
  const slug = req.params.slug;
  const identifierType = req.query['id-type'] || 'slug';
  const populate = (req.query.populate && req.query.populate.split(',')) || ['children', 'salesmodel'];
  logger.info(fn, 'slug=', slug, 'identifierType=', identifierType, 'populate=', populate);

  try {
    if (['_id', 'identifier', 'slug'].indexOf(identifierType) === -1) {
      throw new BadRequestError();
    }
    if (identifierType === '_id' && !slug.match(/^[0-9a-f]{24}$/)) {
      throw new BadRequestError('Invalid ID');
    }

    let offer = null;
    if (slug) {
      offer = await OfferBackend.findOneByIdentifierWithPupulateAll(slug, {
        requestId: req.requestId,
        localizer: req.localizer,
        identifierType,
        populate,
      });
      // logger.info(fn, 'offer:', offer);
    }

    const userId = user && (user._id || user.userId);
    let cart = await CartBackend.findByUser(user, {
      requestId: req.requestId,
      localizer: req.localizer,
      region: req.region
    });

    let currentRegion = await RegionBackend.findByCode(req.region);

    res.render('webapp/AppView', {      
      preloadedData: {
        offer, cart, user, currentRegion, 
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

const viewOfferRegionAutoDetect = async(req, res, next) => {
  const fn = `[${req.requestId}]${ns}[viewOfferRegionAutoDetect]`

  const offerType = req.params.offerType;
  logger.info(fn, 'offerType=', offerType);
  try {
    if (!offerType) {
      throw new BadRequestError('invalid offerType');
    }

    res.render('webapp/AppView', {         

    });
  } catch (error) {
    next(error);
  }
}

const getWizardDefaults = async(req, res) => {
  let fn = `[${req.requestId}]${ns}[getWizardDefaults]`
  let SLUG = req.params.slug ? req.params.slug : ''
  let promise = Promise.resolve();
  promise.then(async() => {
    // try {
    logger.info(fn, 'slug:', {
      // plans,
      SLUG
    });
    let wizardConfig = await getShoppingWizardDefaultsBySlug(req, SLUG);
    // let plans = await getProductsByBaseSku(req, SLUG);
    logger.info(fn, 'wizardConfig:', wizardConfig);
    res.status(200).json({
      data: wizardConfig,
    });
    // } catch (error) {
    //   res.status(500).json({
    //     error: error,
    //   });
    // }
  })
}

module.exports = {
  getOffer,
  getOffers,
  viewOffer,
  viewOfferRegionAutoDetect,
  getWizardDefaults,
  getOffersByRegion,
  getOffersByTag
};
