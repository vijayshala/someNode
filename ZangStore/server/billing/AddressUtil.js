const ns = '[AddressUtil]';

import logger from 'applogger';
import config from '../../config';
import * as constants from './Constants';
import LookupSchema from '../../schemas/LookupSchema';
const { CountryBackend } = require('../region/country.backend');


const LOOKUP_TYPES = {
    INDUSTRY_TYPES: 'INDUSTRY_TYPES',
    COUNTRIES: 'COUNTRIES',
    STATES: 'STATES'
};

export async function getCountryByName(name, countryCode)  {
    let func = `${ns}[getCountryByName]`;
    logger.info(func, 'begin', name, 'countryCode:', countryCode);
    let result = null;
    if (countryCode) {
        result = await CountryBackend.findByCode(countryCode);
        return {            
            metadata: {
                ISO3: result.ISO['3'] || result.ISO['alpha3'] || countryCode
            }
        }
    }

    result = await LookupSchema.findOne({
        type: LOOKUP_TYPES.COUNTRIES,
        keyValue: name
    });

    return result;
};

export async function getStateByName(name, countryCode, stateCode)  {
    let func = `${ns}[getStateByName]`;

    logger.info(func, 'begin', name, 'countryCode', countryCode, 'stateCode:', stateCode);
    let result = null;
    if (stateCode) {
        result = await CountryBackend.findByStateCode(countryCode, stateCode);
        return {            
            metadata: {
                abbreviation: stateCode
            }
        }
    }

    result = await LookupSchema.findOne({
        type: LOOKUP_TYPES.STATES,
        keyValue: name
    });

    return result;
}
