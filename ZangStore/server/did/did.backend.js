import logger from 'applogger';
const config = require('../../config');
import ZCloudNumbers from '../../models/zcloud/Numbers';
const { FindPhoneNumber } = require('../kazoo/models/kazoo.backend');
const ns = '[did.backend.js]'

export const findZCloudNumbers = (req, countryISO='US', prefix) => {
  return new Promise((resolve, reject) => {
    logger.info(req.requestId, ns, '[findZCloudNumbers]')
    let kn = new ZCloudNumbers(req);
    kn.find(req.params.prefix, countryISO.toUpperCase(), req.params.type, 25, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    })
  });  
}

export const findKazooNumbers = async (req, countryISO = 'US', prefix) => {
  logger.info(req.requestId, ns, '[findKazooNumbers]')
  const queryPayload = {
    prefix: prefix,
    quantity: 25
  };

  const numberResponse = await FindPhoneNumber(config.kazoo_de.accountId, queryPayload, {
    requestId: req.requestId
  });

  let numbers = numberResponse.data;

  //TODO: remove once Kazoo implements Colt integration for phone numbers
  numbers.push({
    phone_number: '+491234567890',
    friendly_name: '+491234567890'
  });
  
  return numbers;
}