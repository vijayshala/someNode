const logger = require('applogger');
import countryjs from 'countryjs';
import countryRegionsData from 'country-region-data/data.json'
import countryTelephoneData from 'country-telephone-data';
const { CountryBackend } = require('../../region/country.backend');
const { AVAILABLE_REGIONS } = require('../../region/region.constants');

import request from 'request'
//

async function getCountrIO() {
  return new Promise((resolve, reject) => {
    const fn = `[getCountrIO]`;
    var options = {
      url: 'http://country.io/names.json',
      accept: '*/*',
      json: true
    };
    let countries = request.get(options, function (err, response, countries = {}) {
      if (err || response.statusCode !== 200) {
        logger.error(fn, 'Wrong response!: ');
        resolve({})
      }
      logger.info(fn, '====countries', countries);
      return resolve(countries);
    });    
  });
}

const initCountryPhoneLookup = async () => {
  const fn = `[initCountryPhoneLookup]`;
  let allPhoneLookups = {}
  for (var country of countryTelephoneData.allCountries) {
    // logger.info(fn, 'country', country);
    
    allPhoneLookups[country.iso2] = country;
  }
  return allPhoneLookups;
}

const initCountries = async (options) => {
  const fn = `[initCountries]`;
  const collection = 'countries';
  options = Object.assign({
    emptyCollection: false,
  }, options);
  
  let allPhoneLookups = await initCountryPhoneLookup();
  let countryNames = await getCountrIO();

  let allCountries = countryjs.all();
  // logger.info(fn, 'countryRegionsData', countryRegionsData);

  let results = [];
  let countryRegions = {}
  for (var country of countryRegionsData) {
    countryRegions[country.countryShortCode] = country;
  }
  let noOfInvalidCountries = 0;
  let noOfNoRegionsCountries = 0;
  for (var country of allCountries) {   
    let countryCode = country.ISO.alpha2 || country.ISO.alpha3 || country.ISO['2'];
    let countryName = countryNames[countryCode] || country.name;
    
    if (!countryCode || !countryName) {
      logger.info(fn, 'INVAID COUNTRY', countryCode, 'name:', countryName);
      noOfInvalidCountries += 1;
      continue;
    }
    let countryWitRegions = countryRegions[countryCode];
    if (!countryWitRegions) {
      noOfNoRegionsCountries += 1;
      logger.info(fn, 'NO-REGIONS: ISO', countryCode, 'country:', country);
    }

    let countryPhoneInfo = allPhoneLookups[countryCode.toLowerCase()]

    // logger.info(fn, countryCode, 'canSell', country.translations);
    
    // let country = countryjs.info(countryWitRegions.countryName);
    let doc = {
      name: countryName,
      canSell:  AVAILABLE_REGIONS.indexOf(countryCode.toLowerCase()) != -1,
      nativeName: country.nativeName,
      flag: country.flag,
      translations: country.translations || [],
      countryShortCode: countryCode,
      states: countryWitRegions ? countryWitRegions.regions : mapCountryStates(country.states),
      currencies: country.currencies,
      dialCode: countryPhoneInfo && countryPhoneInfo.dialCode || country.callingCodes && country.callingCodes.length && country.callingCodes[0],
      phoneFormat: countryPhoneInfo && countryPhoneInfo.format || '',
      languages: country.languages,
      region: country.region,
      subregion: country.subregion,
      timezones: country.timezones,
      tld: country.tld,
      ISO: country.ISO,
      borders: country.borders
    }
    // logger.info(fn, `creating "${doc.identifier}" ...${doc}`);
    let result = await CountryBackend.findOneAndUpdate({
      countryShortCode: doc.countryShortCode,
    }, doc, { upsert: true, new: true, returnNewDocument: true });
    
    results.push[doc];
  }

  logger.warn(fn, 'noOfInvalidCountries:', noOfInvalidCountries, 'noOfNoRegionsCountries', noOfNoRegionsCountries)

  return results;
}

function mapCountryStates(states = []) {
  return states.map(state => {
    return {
      name: state
    }
  });
}

module.exports = initCountries;