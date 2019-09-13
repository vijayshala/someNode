const ns = '[region.constants]';
const logger = require('applogger');
const config = require('../../config');

export const AVAILABLE_REGIONS = ['us', 'de'];
export const AVAILABLE_LANGUAGES = ["en-US",'de-DE'];
export const DEFAULT_REGION = 'us';
export const DEFAULT_LANGUAGE = 'en-US';
export function isValidRegion(region) {
  console.log('isValidRegion region:', region);
  if (!region || AVAILABLE_REGIONS.indexOf(region.toLowerCase()) == -1) {
    return undefined;
  }
  return region;
}

export function getRegionFromPath(path) {
  let region = path;

  if (region.substr(0, 1) == '/')  {
    region = region.substr(1);
  }

  let nextSlashIndex = region.indexOf('/');

  if (nextSlashIndex > -1)  {
    region = region.substr(0, nextSlashIndex);
  }

  region = region.toLowerCase();

  region = isValidRegion(region);
  
  return region;
}

export function regionHandler(req, res, next) {  
  let regionDetail = req.regionDetail;
  let region = req.region;
  //ignore static routes
  if (!region || !regionDetail) {
    return next();
  }

  region = region.toLowerCase();

  res.cookie('USER_REGION', region, { expires: new Date(Date.now() + (1000 * 60 * 60 * 24)), secure: config.environment != 'development' });
  next();
}


export const COUNTRY_TABLE_NAME = 'Country';
export const REGION_TABLE_NAME = 'Region';
export const addressFormClass = {
  US: 0,
  CANADA: 1,
  EURO1: 2,
}

export const REGION_INIT_DATA = {
  'us': {
    shortCode: 'US',
    countryISO: 'US',
    currency: 'USD',
    addressFormClass: addressFormClass.US,
    name: {
      resource: 'UNITED_STATES',
      text: 'United States'
    },
    active: true,
    defaultLanguage: 'en-US',
    canCommitTax: true,
  },
  'ca': {
    shortCode: 'CA',
    countryISO: 'CA',
    currency: 'CAD',
    addressFormClass: addressFormClass.CANADA,
    name: {
      resource: 'CANADA',
      text: 'Canada'
    },
    active: false,
    defaultLanguage: 'en-US',
    canCommitTax: false,
  },
  'uk': {
    shortCode: 'UK',
    countryISO: 'GB',
    currency: 'GBP',
    addressFormClass: addressFormClass.EURO1,
    name: {
      resource: 'UNITED_KINGDOM',
      text: 'United Kingdom'
    },
    taxCodes: [{
      tax: 0.20, 
      name: 'VAT', 
      code: 0
    }],
    active: false,
    defaultLanguage: 'en-US',
    canCommitTax: false,
  },
  'de': {
    shortCode: 'DE',
    countryISO: 'DE',
    currency: 'EUR',
    addressFormClass: addressFormClass.EURO1,
    name: {
      resource: 'DEUTSCHLAND',
      text: 'Deutschland'
    },
    taxCodes: [{
      tax: 0.19, 
      name: 'VAT_19', 
      code: 0
    }],
    active: true,
    defaultLanguage: 'de-DE',
    canCommitTax: false,
  }
}