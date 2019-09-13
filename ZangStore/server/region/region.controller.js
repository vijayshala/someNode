const ns = '[region.controller]';

import logger from 'applogger';
import constants from '../../config/constants'
const { CountryBackend } = require('./country.backend');
const { PartnerBackend } = require('../partner/partner.backend');
const { RegionBackend } = require('./region.backend');
import escapeStringRegexp from 'escape-string-regexp';

export const getCountries = async (req, res, next) => {
  const fn = `[${req.requestId}]${ns}[getCountries]`;
  const search = req.query.search;
  let results = [];
  let query = {};
  logger.info(fn, 'search:', search);
  try {
    if (search) {
      var str = escapeStringRegexp(search);
      var regex = { $regex: str, $options: 'i' }
      query = {
        $or: [
          { "name": regex },
          { "nativeName": regex },
          { "translations": regex },
        ]
      }
      results = await CountryBackend.find(query);
      // logger.info(fn, 'results:', results);      
    }
    else {
      query.canSell = true;
      if (req.query.region) {
        query = {
          $or: [
            { canSell: true, countryShortCode: escapeStringRegexp(req.query.region) },
            { canSell: true },
          ]
        }
      }
      results = await CountryBackend.find(query);
    }

    res.status(200).json({
      data: results,
    });
  } catch (error) {
    next(error);
  }
};


export const getRegions = async (req, res, next) => {
  const fn = `[${req.requestId}]${ns}[getRegions]`;
  const search = req.query.search;
  let results = [];
  let query = {};
  logger.info(fn, 'search:', search);
  try {
    if (search) {
      var str = escapeStringRegexp(search);
      var regex = { $regex: str, $options: 'i' }
      query = {
        $or: [
          { "name": regex },
          { "nativeName": regex },
          { "translations": regex },
        ],
        active: true
      }
      results = await RegionBackend.find(query);
      // logger.info(fn, 'results:', results);      
    }
    else {
      // query.canSell = true;
      // if (req.query.region) {
      //   query = {
      //     $or: [
      //       { canSell: true, countryShortCode : escapeStringRegexp(region) },
      //       { canSell: true },            
      //     ]
      //   }
      // }
      results = await RegionBackend.find({ active: true });
    }

    res.status(200).json({
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

export const getRegionsByPartner = async (req, res, next) => {
  const fn = `[${req.requestId}]${ns}[getRegionsByPartner]`;
  const partnerId = req.params.partnerId;
  const search = req.query.search;
  let results = [];
  let query = {};
  logger.info(fn, 'search:', search);
  try {
    if (search) {
      var str = escapeStringRegexp(search);
      var regex = { $regex: str, $options: 'i' }
      query = {
        $or: [
          { "name": regex },
          { "nativeName": regex },
          { "translations": regex },
        ],
        active: true
      }
      results = await RegionBackend.find(query);  
    }
    else {
      results = await RegionBackend.find({ active: true });
    }

    logger.info(fn, "ALL REGIONS: ", results);

    let validRegions = [];

    for (let i = 0; i < results.length; i++) {
      // check to see if the region is valid for the partner
      const regionValid = await PartnerBackend.isValid(partnerId, results[i].shortCode, { requestId: req.requestId });
      if (regionValid) {
        validRegions.push(results[i]);
      }
    }

    logger.info(fn, "VALID REGIONS: ", validRegions);

    res.status(200).json({
      data: validRegions,
    });
  } catch (error) {
    next(error);
  }
};

export const getRegionByCode = async (req, res, next) => {
  const fn = `[${req.requestId}]${ns}[getRegionByCode]`;
  const shortCode = req.params.shortCode;
  let result = null;
  try {
    if (shortCode) {
      result = await RegionBackend.findByCode(shortCode);
      logger.info(fn, 'result:', result);
    }
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getCountryByCode = async (req, res, next) => {
  const fn = `[${req.requestId}]${ns}[getCountryByCode]`;
  const shortCode = req.params.countryCode;
  let result = null;
  logger.info(fn, 'shortCode', shortCode)
  try {
    if (shortCode) {
      result = await CountryBackend.findByCode(shortCode);
      logger.info(fn, 'shortCode', shortCode, 'result:', result);
      // try {
      //   let state = await CountryBackend.findByStateCode(shortCode, 'VA');
      //   logger.info(fn, 'state:', state);
      // }
      // catch (err2) {
      //   logger.error(fn, err2);
      // }
    }
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const viewChooseRegion = async (req, res, next) => {
  const fn = `[${req.requestId}]${ns}[viewChooseRegion]`;
  let results = [];
  try {
    results = await RegionBackend.find({ active: true });
    logger.info(fn, 'result:', results);
    res.render('region/ChooseCountryView', {
      regions: results || [],
      error: false,
    });
  } catch (error) {
    next(error);
  }
}