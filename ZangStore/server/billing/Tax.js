const ns = '[billing][Tax]';

import logger from 'applogger';
import config from '../../config';
import * as constants from './Constants';
import { nonBlockify } from '../modules/utils';
import { BillingError, ERROR_CODES } from './Error';
import {
  VerifyAddress as AvalaraVerifyAddress,
  CalculateTax as AvalaraCalculateTax,
  CommitTax as AvalaraCommitTax,
  UnCommitTax as AvalaraUnCommitTax,
  ParseError as AvalaraParseError
} from './integrations/avalara';
import { getCountryByName, getStateByName } from './AddressUtil';
import TaxGatewaySchema from '../../schemas/TaxGatewaySchema';
import _ from 'lodash';

const TAX_CALCULATION_REQUEST_PRECISION = 4;
const TAX_CALCULATION_RESPONSE_PRECISION = 2;

let googleMapsClient = require('@google/maps').createClient({
  key: config.GEOCODEING_CRED.api_key,
  Promise: Promise
});

/**
 * Calculate tax estimate for an array of products.
 * @param {*} req
 * @param {object} address_obj
 * @param {array} items
 * @param {string} taxCalcId
 * @param {string} gateway
 */
export async function CalculateTax(req,
  bill_address_obj,
  ship_address_obj,
  items,
  isIncorporated,
  taxCalcId,
  gateway = constants.TAX_GATEWAYS.AVALARA,
  region = constants.TAX_EXCEPTIONS['DE']) {
  let func = `[${req.requestId}]${ns}[CalculateTax]`;

  if (!constants.TAX_GATEWAYS.hasOwnProperty(gateway)) {
    logger.error(func, 'tax gateway does not exist', gateway);
    throw new BillingError('Tax gateway does not exist.', ERROR_CODES.TAX_GATEWAY_NOT_FOUND);
  }

  logger.info(func, 'begin');

  let response = {
    total: 0,  //total including tax
    subtotal: 0,  //total without tax
    tax: 0, //total tax to pay
    //taxItems: {}, //total tax incurred for each item in the invoice (how much tax for DID, how much tax for power user, etc.)
    taxDetail: [],  //Exact tax summary from Avalara
    taxId: '' //Unique ID of this tax estimate
    //taxTypes: {}, //Breakdown of the tax types for the whole invoice (how much FCC tax, how much HST, etc)
  };
  logger.info(func, 'Country Region: ', region);
  if (gateway == constants.TAX_GATEWAYS.NATIVE) {
    logger.info(func, 'NATIVE TAX CODES: ', region);
    if (!(region.length > 0)) {
      logger.error(func, 'Region tax gateway does not exist');
      throw new BillingError('Region tax gateway does not exist.', ERROR_CODES.TAX_GATEWAY_NOT_FOUND);
    }
    // calculate the subtotal for the items
    for (let item of items) {
      if (item.quantity > 0) {
        let price = item.price * item.quantity;
        price = _.round(price, TAX_CALCULATION_REQUEST_PRECISION);
        response.subtotal += price;
      }
    }
    response.taxTypes = {};
    // get the tax data
    for (let item of region) {
      let tax = response.subtotal * item.tax;
      response.tax += tax;
      response.taxTypes[item.code] = {
        tax: _.round(tax, TAX_CALCULATION_RESPONSE_PRECISION),
        name: item.name
      }
    }

    response.total = response.subtotal + response.tax;
    logger.info(func, 'response: ', response);
  } else if (gateway == constants.TAX_GATEWAYS.AVALARA) {
    let [bill_country, bill_state] = await Promise.all(
      [
        getCountryByName(bill_address_obj.country, bill_address_obj.countryISO),
        getStateByName(bill_address_obj.state, bill_address_obj.countryISO, bill_address_obj.stateISO)
      ]
    );

    let ship_country = (bill_address_obj.country == ship_address_obj.country)
      ? bill_country
      : await getCountryByName(ship_address_obj.country, ship_address_obj.countryISO);
    let ship_state = (bill_address_obj.state == ship_address_obj.state)
      ? bill_state
      : await getStateByName(ship_address_obj.state, ship_address_obj.countryISO, ship_address_obj.stateISO);

    let payload = {
      taxCalcId: taxCalcId ? `${config.environment}_${taxCalcId}` : '',
      country: bill_country.metadata.ISO3,
      address: bill_address_obj.street,
      city: bill_address_obj.city,
      state: (bill_state ? bill_state.metadata.abbreviation : ''),
      zip: bill_address_obj.zip,
      incorporated: isIncorporated,
      items: items
    };

    let prepareItems = [];
    for (let item of items) {
      if (item.quantity > 0) {
        let taxCodes = await GetTaxCode(item.sku);
        let price = item.price * item.quantity;
        logger.info(func, 'Tax Codes: ', taxCodes);
        // round to TAX_CALCULATION_REQUEST_PRECISION (4) decimals
        // this can avoid charge like 479.70000000000005
        // we send 479.7 instead
        price = _.round(price, TAX_CALCULATION_REQUEST_PRECISION);

        prepareItems.push({
          ref: item.sku,
          chg: price,
          disc: item.isDiscount ? 1 : 0,
          tran: taxCodes.transactionType,
          serv: taxCodes.serviceType,
          sale: 1,
          incl: false,
          to: {
            ctry: ship_country.metadata.ISO3, //country
            geo: false,  //Use geocode service
            int: isIncorporated, // [Incorporated]	Incorporated flag for BillTo location
            addr: ship_address_obj.street,   //street address
            city: ship_address_obj.city,   //city
            st: ship_state && ship_state.metadata && ship_state.metadata.abbreviation || '',   //state
            zip: ship_address_obj.zip  //zipcode
          }
        });
        logger.info(func, 'Prepare Items: ', prepareItems);
        response.subtotal += price;
        payload.items = prepareItems;
      }
    }
    let taxResult = await AvalaraCalculateTax(req, payload);
    logger.info(func, 'taxResult: ', taxResult);
    if (taxResult && taxResult.inv && taxResult.inv.length > 0 && taxResult.inv[0].err) {
      logger.error(func, 'avalara error', taxResult.inv[0]);
      let error = await AvalaraParseError(taxResult.inv[0]);
      throw error;
    } else if (taxResult && taxResult.inv && taxResult.inv.length > 0 && taxResult.inv[0].summ && taxResult.inv[0].summ.length > 0) {
      //Get total chargable tax for each tax type
      const parseTaxCats = nonBlockify((taxItem) => {
        // round tax result to TAX_CALCULATION_RESPONSE_PRECISION (2) decimals
        // this can round result like -1.4210854715202004E-14 to 0
        const tax = _.round(taxItem.tax, TAX_CALCULATION_RESPONSE_PRECISION);

        response.tax += tax;
        if (taxCats.hasOwnProperty(taxItem.tid)) {
          taxCats[taxItem.tid].tax += tax;
        } else {
          taxCats[taxItem.tid] = {
            tax: tax,
            name: taxItem.name
          };
        }
      });

      let taxCats = {};
      for (let taxItem of taxResult.inv[0].summ) {
        await parseTaxCats(taxItem);
      }
      response.taxTypes = taxCats;

      response.taxDetail = taxResult.inv[0].summ;
      response.tax = (response.tax);

      response.total = response.subtotal + response.tax;

      //Get total chargeable tax for each item
      // const parseItemTax = nonBlockify((item) => {
      //   let totalItemTax = 0;
      //   let taxTypes = []
      //   for (let tax of item.txs) {
      //     totalItemTax += tax.tax;
      //     taxTypes.push(tax)
      //   }

      //   response.taxItems[item.ref] = {
      //     tax: (totalItemTax),
      //     taxTypes: taxTypes
      //   };
      // });

      // for (let item of taxResult.inv[0].itms) {
      //   await parseItemTax(item);
      // }

      response.taxId = taxResult.inv[0].doc;
    } else if (taxResult && taxResult.inv && taxResult.inv.length > 0) {
      response.taxId = taxResult.inv[0].doc;
      response.taxTypes = {};
    } else {
      let error = await AvalaraParseError();
      throw error;
    }
  }
  logger.info(func, 'response: == = == = = == : ', response);
  return response;
}

export async function VerifyAddress(req, addressObj, region = constants.DEFAULT_REGION) {
  let func = `[${req.requestId}][${ns}][VerifyAddress]`;

  logger.info(func, 'begin');

  let payload = {
    country: addressObj.countryISO,
    address: addressObj.address1,
    city: addressObj.city,
    state: addressObj.stateISO || '',
    zip: addressObj.zip
  };

  let response = {
    country: '',
    address1: '',
    city: '',
    state: '',
    zip: ''
  };

  if (region == 'DE') {
    response.country = payload.country;
    response.address1 = payload.address;
    response.state = payload.state;
    response.city = payload.city;
    response.zip = payload.zip;
    return response;
  }

  logger.debug('======================================= NATIVE VERIFY ADDRESS', func);
  // parse the address input
  //const address = `${payload.address}, ${payload.city}, ${payload.state != '' ? payload.state + ', ' : ''}${payload.zip}, ${payload.country}`;
  const address = `${payload.city}, ${payload.state != '' ? payload.state + ', ' : ''}${payload.zip}, ${payload.country}`;
  //A, 206 Derby Rd, Chesterfield S40 2EP, UK
  // validate the address using google maps api
  logger.info(func, 'Google Maps API: ', payload.country);
  try {
    const geocodeResult = await googleMapsClient.geocode({
      address: address,
      components: {
        country: payload.country
      }
    }).asPromise();

    const geocodeResultJson = geocodeResult && geocodeResult.json;
    const addressResult = geocodeResultJson && geocodeResultJson.results && geocodeResultJson.results.length > 0 && geocodeResultJson.results[0];

    logger.info(func, 'response:', JSON.stringify(geocodeResultJson));

    if (geocodeResultJson.status == 'OK' && addressResult && geocodeResultJson.results[0].partial_match != true) {

      logger.info(func, 'Google Address Response: ', JSON.stringify(addressResult));

      // if (!addressResult.partial_match) {
      response.country = payload.country;
      response.address1 = payload.address;
      response.state = payload.state;
      
      let similarCity = false;
      // check to see if there are other cities recognized
      if (addressResult.postcode_localities) {
        addressResult.postcode_localities.map(item => {
          const formattedCity = item.replace(/\(.+?\)/g, '').trim();
          if (payload.city.toUpperCase() == formattedCity.toUpperCase()) {
            response.city = item;
            similarCity = true;
          }
        });
        // throw error if the similar cities do not match user input
        if (!similarCity) {
          throw new Error("Invalid Address");
        }
      }

      // Check to see if state, city, postal code inputs match Google's API response
      addressResult.address_components.map(function (item) {
        if (item.types.indexOf('locality') > -1 && !addressResult.postcode_localities) {
          const formattedCity = item.short_name && item.short_name.replace(/\(.+?\)/g, '').trim();
          const formattedCityLong = item.short_name && item.long_name.replace(/\(.+?\)/g, '').trim();
          if (payload.city.toUpperCase() != formattedCity.toUpperCase() && payload.city.toUpperCase() != formattedCityLong.toUpperCase() ) {
            throw new Error("Invalid Address City");
          } else {
            response.city = item.short_name;
          }
        }
        if (item.types.indexOf('administrative_area_level_1') > -1) {
          if (payload.state != '') {
            if (payload.state.toUpperCase() != item.short_name.toUpperCase() && payload.state.toUpperCase() != item.long_name.toUpperCase()) {
              throw new Error("Invalid Address State");
            }
          }
        }
        if (item.types.indexOf('postal_code') > -1) {
          // remove all characters that are not letters/numbers
          let resZip = payload.zip.toUpperCase().replace(/[^a-zA-Z0-9]/g, '');
          let googleZip = item.short_name.toUpperCase().replace(/[^a-zA-Z0-9]/g, '');
          let googleZipLong = item.long_name.toUpperCase().replace(/[^a-zA-Z0-9]/g, '');
          if (resZip != googleZip && resZip != googleZipLong) {
            throw new Error("Invalid Address Zip");
          } else {
            response.zip = item.short_name;
          }
        }
      });
      logger.info(func, 'Success Address Response: ', response);
    } else {
      logger.error(func, 'Google Address Status is:', geocodeResultJson.status);
      throw new Error("Status is not OK");
    }
  } catch (err) {
    logger.error(func, 'Error:', err);
    throw new BillingError(err, ERROR_CODES.BILL_ADDRESS_NOT_FOUND);
  }

  logger.info(func, 'Verify Response: ', response);
  return response;
}

/**
 * Record a calculated tax estimate. TaxId should match the id provided when tax calulcation estimate was completed.
 * @param {*} req
 * @param {string} taxId
 * @param {string} gateway
 */
export async function CommitTransaction(req, taxId, gateway = constants.TAX_GATEWAYS.AVALARA, noEnv = false) {
  let func = `[${req.requestId}][${ns}][CommitTransaction]`;

  if (!constants.TAX_GATEWAYS.hasOwnProperty(gateway)) {
    logger.error(func, 'tax gateway does not exist', gateway);
    throw new BillingError('Tax gateway does not exist.', ERROR_CODES.TAX_GATEWAY_NOT_FOUND);
  }

  logger.info(func, 'begin');

  let taxCalcId = `${config.environment}_${taxId}`;
  if (noEnv) {
    taxCalcId = taxId;
  }

  if (gateway == constants.TAX_GATEWAYS.AVALARA) {
    const result = await AvalaraCommitTax(req, taxCalcId);

    if (result && result.ok) {
      return result;
    } else {
      throw new BillingError('Failed to commit tax.', ERROR_CODES.AVALARA_ERROR);
    }
  }
}

export async function UnCommitTransaction(req, taxId, gateway = constants.TAX_GATEWAYS.AVALARA) {
  let func = `[${req.requestId}][${ns}][UnCommitTransaction]`;

  if (!constants.TAX_GATEWAYS.hasOwnProperty(gateway)) {
    logger.error(func, 'tax gateway does not exist', gateway);
    throw new BillingError('Tax gateway does not exist.', ERROR_CODES.TAX_GATEWAY_NOT_FOUND);
  }

  logger.info(func, 'begin');

  let taxCalcId = `${config.environment}_${taxId}`;

  if (gateway == constants.TAX_GATEWAYS.AVALARA) {
    return await AvalaraUnCommitTax(req, taxCalcId);
  }
}

/**
 * Retrieve tax codes for a particular sku and gateway.
 * @param {string} sku
 * @param {string} gateway
 */
async function GetTaxCode(sku, gateway = constants.TAX_GATEWAYS.AVALARA) {
  let func = `${ns}[GetTaxCode]`;

  logger.info(func, 'begin', sku);

  let gatewaydata = await TaxGatewaySchema.findOne({
    sku: sku,
    gateway: gateway,
    objectType: constants.TAX_OBJECTS.TAX_CODE
  });

  logger.info(func, gatewaydata);

  if (!gatewaydata) {
    throw new BillingError('Product tax code not found.', ERROR_CODES.TAX_CODE_NOT_FOUND);
  }

  let taxcodes = gatewaydata.taxCodes;
  return {
    transactionType: taxcodes.transactionType,
    serviceType: taxcodes.serviceType
  }
}

export async function SaveTaxCode(sku, code_obj, gateway = constants.TAX_GATEWAYS.AVALARA) {
  let func = `${ns}[SaveTaxCode]`;

  logger.info(func, 'begin', sku);

  return await TaxGatewaySchema.findOneAndUpdate({
    sku: sku,
    gateway: gateway,
    objectType: constants.TAX_OBJECTS.TAX_CODE
  },
    {
      sku: sku,
      gateway: gateway,
      objectType: constants.TAX_OBJECTS.TAX_CODE,
      taxCodes: code_obj
    },
    {
      upsert: true,
      new: true
    });
}

export function PrepareItems(purchasedPlan, context) {
  const fn = `[${context.requestId}]${ns}[PrepareItems]`;
  let recurring = {};
  const { InternalServerError } = require('../modules/error');
  const { generateSubscriptionIdentifier } = require('../modules/cart-salesmodel-rules/utils');

  if (purchasedPlan && purchasedPlan.items && purchasedPlan.items.length > 0) {
    purchasedPlan.items.forEach((item) => {
      if (!item.price || !item.quantity || item.quantity < 1) {
        return;
      }

      const sku = item.references && item.references.sku;

      if (!sku) {
        if (purchasedPlan.region != 'DE') {
          logger.error(fn, `Purchased plan item (${item.identifier}) doesn't have product code`);
          throw new InternalServerError('Purchased plan item doesn\'t have product code');
        }
      }

      if (!item.isOneTimeCharge && item.salesModel.subscription) {
        const subscriptionIdentifier = generateSubscriptionIdentifier(item.salesModel.subscription);
        const subscriptionEntry = purchasedPlan.subscriptions.find((one) => one.identifier === subscriptionIdentifier);
        if (!subscriptionEntry) {
          throw new InternalServerError(`Cannot find subscription "${subscriptionIdentifier}" in purchasedPlan.subscriptions`);
        }
        if (!recurring[subscriptionEntry._id]) {
          recurring[subscriptionEntry._id] = [];
        }
        recurring[subscriptionEntry._id].push({
          sku: sku,
          price: item.price,
          quantity: item.quantity,
          isDiscount: item.price < 0,
        });
      }
    });
  } else {
    logger.info(fn, 'Purchased plan is empty');
  }

  return recurring;
}