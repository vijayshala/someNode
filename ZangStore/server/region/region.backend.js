const ns = '[region.backend]';

import logger from 'applogger';
import escapeStringRegexp from 'escape-string-regexp';

const { DbBase } = require( '../modules/db/index');
import RegionSchema from './region.model';
import {

} from './region.constants';

const { BadRequestError } = require( '../modules/error');


class RegionBackend extends DbBase {
  async findByCode(shortCode, options) {
    const fn = `[${options && options.requestId}${ns}[findByCode]`;
    // var str = escapeStringRegexp(shortCode);
    // var regex = { $regex: str, $options: 'i' }
    logger.info(fn, 'shortCode', shortCode);
    let queryCode = typeof shortCode == 'string' ? shortCode.toUpperCase() : shortCode;
    
    logger.info(fn, 'query', queryCode);

    return await this.findOne({ shortCode: queryCode }, options);
  }
}


let backend = new RegionBackend(RegionSchema, {});


module.exports = {
  RegionBackend: backend,
};
  