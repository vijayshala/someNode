const ns = '[SysConfig]'

import logger from 'applogger'
import dbWp from 'dbwrapper'
import LRU from 'lru-cache';
import SysConfg from '../schemas/sysconfigSchema'
var configsCache = LRU({
  max: 100,
  maxAge: 1000 * 10
});
var keyInConfigsCache = 'public-configs';
export const SYSCONFIG_BILLING_ENABLED = 'billing_enabled'

export const PUBLIC_CONFIG_NAMES = [
  SYSCONFIG_BILLING_ENABLED
];


export function getPublicConfigsFromDB(src, query = {}, cb) {
  let functionName = '[getPublicConfigsFromDB] '
  let searchFields = query.fields || PUBLIC_CONFIG_NAMES
  logger.info(src.id, functionName + 'Try to get configs by names searchFields:', searchFields);
  try {
    dbWp.execute(SysConfg,
      SysConfg.find,
      src.id, {
        'name': {
          '$in': searchFields
        }
      },
      (err, result) => {
        if (err) {
          logger.error(src.id, functionName + 'Happen error when query public configuration', err);
          return cb(err);
        } else {
          logger.info(src.id, functionName + 'Query public configuration successfully');
          return cb(null, prepareSysConfigData(result));
        }

      });
  } catch (err) {
    logger.error(functionName, err)
    return cb(err, {});
  }
};

export async function readSysConfigByName(req, name) {
  let sycConfig = configsCache.get(keyInConfigsCache + name);
  if (sycConfig) {
    return sycConfig;
  } else {
    return await SysConfg.findOne({
      name
    });
  }
}

function prepareSysConfigData(result) {
  let returnData = {}
  for (let item of result) {
    returnData[item.name] = item.value;
  }

  if (returnData.length) {
    configsCache.set(keyInConfigsCache, returnData);
  }
  return returnData;
}

export function getPublicConfigs(src, data, cb) {
  let publicCfgs = configsCache.get(keyInConfigsCache);
  if (publicCfgs) {
    return cb(null, publicCfgs);
  } else {
    return getPublicConfigsFromDB(src, data, cb);
  }
}

export default {
  getPublicConfigsFromDB,
  getPublicConfigs
}
