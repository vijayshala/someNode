const ns = '[country.backend]';

import logger from 'applogger';
import escapeStringRegexp from 'escape-string-regexp';
const { DbBase } = require( '../modules/db/index');
import CountrySchema from './country.model';
import {

} from './region.constants';

const { BadRequestError } = require( '../modules/error');


class CountryBackend extends DbBase {
  async findByCode(shortCode) {
    // var str = escapeStringRegexp(shortCode);
    // var regex = { $regex: str, $options: 'i' }
    return await this.findOne({ countryShortCode: shortCode.toUpperCase() });
  }

  async findByStateCode(countryCode, stateCode) {
    logger.info(ns,'findByStateCode', { countryCode, stateCode })
    return await this.findOne(
      {
        countryShortCode: countryCode.toUpperCase(),
        'states.shortCode': stateCode.toUpperCase()
      },
      { projection: { _id: 0, 'states.$': 1 } }
      //{ _id: 0, states: { $elemMatch: { shortCode: stateCode.toUpperCase() } } } }
    );
  }
}

let backend = new CountryBackend(CountrySchema, {});


module.exports = {
    CountryBackend: backend,
  };
  