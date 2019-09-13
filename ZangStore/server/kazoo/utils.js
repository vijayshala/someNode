const ns = '[kazoo][utils]';
const logger = require('applogger');

const config = require('../../config');
const request = require('../modules/http/request');
const request2 = require('request');
const { SysConfigBackend } = require('../utils/sysconfig.backend');

async function authenticate(options) {
  const fn = `[${options.requestId}]${ns}[authenticate]`;

  const reqOptions = {
    method: 'PUT',
    url: `${config.kazoo_de.apiURL}/v2/api_auth`,
    json: true,
    body: {
      data: {
        api_key: options.apiKey
      }
    }
  };

  logger.info(fn, 'request:', reqOptions);

  const result = await request(fn, reqOptions);

  logger.info(fn, 'response:', result);

  return result && result.body;
}

async function GetKazooAuthToken(options) {
  const fn = `[${options.requestId}]${ns}[GetKazooAuthToken]`;
  const { KAZOO_AUTH_TOKEN_SYSCONFIG, KAZOO_AUTH_TOKEN_EXPIRE } = require('./constants');

  options = Object.assign({
    force: false,
    apiKey: config.kazoo_de.apiKey
  }, options);

  logger.info(fn, 'options:', options);

  if (!options.force) {
    const existingToken = await SysConfigBackend.findOne({
      name: `${KAZOO_AUTH_TOKEN_SYSCONFIG}_${options.apiKey}`,
      'value.created': {
        '$gte': new Date((new Date()).getTime() - KAZOO_AUTH_TOKEN_EXPIRE)
      }
    }, { ...options, ignoreNotFoundError: true });

    logger.debug(fn, 'existingToken:', existingToken);

    if (existingToken && existingToken.value && existingToken.value.token) {
      return existingToken.value.token;
    }
  }

  let authResponse;
  try {
    authResponse = await authenticate(options);
    logger.info(fn, 'authtoken:', authResponse && authResponse.auth_token);
  } catch (e) {
    logger.error(fn, 'error', JSON.stringify(e));
    throw new Error('Failed to authenticate with Kazoo.');
  }

  await SysConfigBackend.findOneAndUpdate({
    name: `${KAZOO_AUTH_TOKEN_SYSCONFIG}_${options.apiKey}`
  }, {
      value: {
        token: authResponse.auth_token,
        accountId: authResponse.data && authResponse.data.account_id,
        created: new Date()
      }
    }, { upsert: true });

  return authResponse.auth_token;
}

export async function KazooRequest(req, options) {
  const fn = `[${options.requestId}]${ns}[KazooRequest]`;

  req = {
    ...req,
    headers: {
      ...req.headers,
      'X-Auth-Token': await GetKazooAuthToken(options)
    },
    url: `${config.kazoo_de.apiURL}${req.url}`,
  };

  for (let i = 0; i < 2; i++) {
    const result = await request(fn, req);
    const statusCode = result && result.statusCode;
    const body = result && result.body;

    if (statusCode == 200 || statusCode == 201) {
      return body;
    } else if (statusCode == 401) {
      req.headers['X-Auth-Token'] = await GetKazooAuthToken({ ...options, force: true });
    } else {
      logger.error(fn, 'response:', result);
      throw new Error('Kazoo request error');
    }
  }


}

// function that returns error request
export async function CheckKazooRequestApi(req, options) {
  const fn = `[${options.requestId}]${ns}[CheckKazooRequest]`;

  req = {
    ...req,
    headers: {
      ...req.headers
    },
    url: `${config.kazoo_de.apiURL}${req.url}`,
  };

  return new Promise((resolve, reject) => {
    request2(req, (err, response, body) => {
      logger.info(fn, "res: ", response);
      logger.info(fn, "err: ", err);
      resolve(response);
    });
  });

}

export async function GetUsersFromPurchasedPlan(purchasedPlan, options) {
  const fn = `[${options.requestId}]${ns}[GetUsersFromPurchasedPlan]`;
  const { nonBlockify } = require('../modules/utils');
  const { findCartItemContext, findCartItemsBySalesModelItemAndTags, findCartItemsBySalesModelAndTags } = require('../modules/cart-salesmodel-rules/utils');
  const {
    KAZOO_USER_TYPES_TAG,
    KAZOO_USER_TYPE_ESSENTIAL,
    KAZOO_USER_TYPE_BUSINESS,
    KAZOO_USER_TYPE_POWER,
    KAZOO_DEVICE_TAG,
    KAZOO_ADDON
  } = require('./constants');

  let users = [], ext = 1001;

  const asyncCreateUser = nonBlockify((userType, deviceType, servicePlan) => {
    users.push({
      type: userType,
      name: 'User ' + ext,
      ext,
      device: deviceType,
      servicePlan: servicePlan,
    });

    ext++;
  });

  for (let i in purchasedPlan.items) {
    const item = purchasedPlan.items[i];
    const itemContext = findCartItemContext(item);
    const tags = itemContext && itemContext.tags;
    if (!tags || tags.indexOf(KAZOO_USER_TYPES_TAG) === -1) {
      continue;
    }

    const isPowerUser = tags.indexOf(KAZOO_USER_TYPE_POWER) > -1;
    const isStandardUser = tags.indexOf(KAZOO_USER_TYPE_BUSINESS) > -1;
    const isBasicUser = tags.indexOf(KAZOO_USER_TYPE_ESSENTIAL) > -1;

    if (isPowerUser || isStandardUser || isBasicUser) {
      const userType = (isPowerUser ? KAZOO_USER_TYPE_POWER :
        (isStandardUser ? KAZOO_USER_TYPE_BUSINESS : KAZOO_USER_TYPE_ESSENTIAL));

      for (let j = 0; j < item.quantity; j++) {
        const deviceType = 'None';
        const servicePlanId = item && item.references && item.references.servicePlanId;
        await asyncCreateUser(userType, deviceType, servicePlanId);
      }
    }
  }

  const asyncUpdateUserDevice = nonBlockify((j, deviceType) => {
    if (users.length > j && users[j] && typeof users[j] === 'object') {
      users[j].device = deviceType;
    } else {
      users.push({
        device: deviceType
      });
    }
  });

  let k = 0;
  for (let i in purchasedPlan.items) {
    const item = purchasedPlan.items[i];
    const itemContext = findCartItemContext(item);
    const tags = itemContext && itemContext.tags;
    if (!tags || tags.indexOf(KAZOO_DEVICE_TAG) === -1) {
      continue;
    }

    for (let j = 0; j < item.quantity; j++) {
      const deviceType = itemContext && itemContext.identifier;

      await asyncUpdateUserDevice(k, deviceType);

      k++;
    }
  }

  //TODO: Async map users and match best devices and user type to admin

  return users;
}

export async function triggerProvisionKazoo(req, data) {
  const fn = `[${req.requestId}]${ns}[triggerProvisionKazoo]`;
  const taskqueue = require('../../modules/taskqueue');
  const { PurchasedPlanBackend } = require('../purchased-plan/purchased-plan.backend');
  const { cartHasProductsOf } = require('../modules/cart-salesmodel-rules/utils');
  const { PRODUCT_ENGINE_NAME, PROVISION_STATUS_FAILED } = require('./constants');
  const { getBaseURL } = require('../../common/Utils');

  const purchasedPlan = await PurchasedPlanBackend.findOneById(data.purchasedPlanId, req);

  const kazooItemIndexes = purchasedPlan && cartHasProductsOf(purchasedPlan, PRODUCT_ENGINE_NAME);

  if (purchasedPlan && !kazooItemIndexes) {
    logger.warn(fn, `No Kazoo product found in purchased plan`);

    throw new Error('No kazoo product found in purchased plan');
  }

  const kazooItemIndex = kazooItemIndexes[0];
  logger.info(fn, 'kazooItemIndex=', kazooItemIndex);
  const kazooItem = purchasedPlan.items[kazooItemIndex];
  logger.info(fn, 'kazooItem=', kazooItem && kazooItem.identifier);

  const provisionStatus = kazooItem && kazooItem.metadata && kazooItem.metadata.provisionStatus;

  if (!provisionStatus || provisionStatus == PROVISION_STATUS_FAILED) {
    data = Object.assign({
      baseUrl: req.baseUrl || getBaseURL(req)
    }, data);

    taskqueue.launchDefer(req, 'KAZOO_PROVISIONING', data, {
      defferOption: true,
      attempts: 3,
      delay: 10
    });
  }
}

export async function triggerUnprovisionKazoo(req, data) {
  const fn = `[${req.requestId}]${ns}[triggerUnprovisionKazoo]`;
  const taskqueue = require('../../modules/taskqueue');

  taskqueue.launchDefer(req, 'KAZOO_UNPROVISIONING', data, {
    defferOption: true,
    attempts: 3,
    delay: config.environment == 'production' ? 60 * 60 * 24 * 14 : 5   //14 days on production or right away on testing
  });
}