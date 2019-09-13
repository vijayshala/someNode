const ns = '[zcloud][Numbers]';

import logger from 'applogger'
import async from 'async'
import request from 'request'
import config from '../../config/'
import ZCloud from './API';
import esErr from '../../modules/errors';

export default class ZCloudNumbers {
  constructor(req){
    this.req = req
  }

  find(prefix, country, type, quantity, cb){
    var func = ns + '[find]';
    quantity = quantity ? quantity : 25;
    quantity = quantity < 0 ? 0 : quantity;

    let numberType = 'Local';
    if (type == 'preselectedNumber')  {
        numberType = 'Tollfree';
    }

    country = 'US';

    ZCloud.findAvailablePhones(this.req, country, numberType, prefix, quantity, (err, resp) =>  {
        if (err || !resp || !resp.available_phone_numbers) {
            logger.error(this.req.requestId, func, 'Query available phone numbers failed', resp);
            return cb(new esErr.ESErrors('phonenumber_query_fail', 'Query available phone numbers failed'));
        }
        logger.info(this.req.requestId, func, 'Queried available phone numbers', resp);
        cb(err, resp.available_phone_numbers);
    });
  }
}
