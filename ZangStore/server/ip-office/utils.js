const ns = '[ip-office][utils]';
const logger = require('applogger');
//export async function BindServicePlan(accountId, servicePlanId, data, options)
const util = require('util');
const _ = require('lodash');
const {
  PRODUCT_ENGINE_NAME,
  IPOFFICE_USER_TYPES_TAG,
  IPOFFICE_USER_TYPE_ESSENTIAL,
  IPOFFICE_USER_TYPE_BUSINESS,
  IPOFFICE_USER_TYPE_BASIC,
  IPOFFICE_USER_TYPE_STANDARD,
  IPOFFICE_USER_TYPE_POWER,
  IPOFFICE_DEVICE_TAG,
} = require('./constants');
const config = require('../../config');

const ZClouAPI = require('../../models/zcloud/API');

const findAreaCodeFromPhoneNumber = (phone) => (phone && phone.replace(' ', '').replace('+1', '').replace('(', '').replace(')', '').replace('-', '').substr(0, 3)) || '';

const findTemporaryPhoneNumber = async(req, did, contactPhone, order, subscriptionId) => {
  const fn = `[${req.requestId}]${ns}[findTemporaryPhoneNumber]`;
  logger.info(fn, `started, order=${order._id}, subscriptionId=${subscriptionId}`);

  let defaultAreaCodes = {
    // FIXME: why we check this default area code
    default: '408',
    order: findAreaCodeFromPhoneNumber(contactPhone),
    // FIXME: used to pick order.items[0].product.salesmodel.system.metadata.number.value
    product: findAreaCodeFromPhoneNumber(did),
  };

  let areaCodes = [];

  const { getLookup } = require('../../models/LookupModel');
  try {
    const lookups = await getLookup(req, {
      keyValue: (order.billingAddress && order.billingAddress.state) || '',
    });
    if (lookups && lookups.metadata && lookups.metadata.areaCodes) {
      logger.info(fn, `${order.billingAddress.state} area codes:`, lookups.metadata.areaCodes);

      areaCodes = [
        defaultAreaCodes.product,
        ...lookups.metadata.areaCodes,
        defaultAreaCodes.order,
        defaultAreaCodes.default,
      ];
    }
  } catch (err) {
    logger.error(fn, 'getLookup error', err);
  }

  if (areaCodes.length === 0) {
    areaCodes = [
      defaultAreaCodes.product,
      defaultAreaCodes.order,
      defaultAreaCodes.default,
    ];
  }
  logger.info(fn, `area codes:`, areaCodes);

  const addPhoneNumberAny = util.promisify(ZClouAPI.addPhoneNumberAny);

  for (let areaCode of areaCodes) {
    if (!areaCode) {
      continue;
    }

    logger.info(fn, `finding numbers of area code ${areaCode}...`);

    try {
      const result = await addPhoneNumberAny(req, areaCode, '', '', subscriptionId);
      if (result && result.phone_number) {
        logger.info(fn, `found number: ${result.phone_number}`);
        return result;
      }
    } catch (err) {}
  }

  throw new Error('Cannot find any number');
};

const getIPOfficeNextSubscriptionTrackId = async(req) => {
  const fn = `[${req.requestId}]${ns}[getIPOfficeNextSubscriptionTrackId]`;
  const {
    SYSCFG_IPOFFICE_SUBSCRIPTIONID_REC,
    SYSCFG_IPOFFICE_SUBSCRIPTIONID_INITVAL,
    SYSCFG_IPOFFICE_SUBSCRIPTION70ID_REC,
    SYSCFG_IPOFFICE_SUBSCRIPTION80ID_REC
  } = require('../../modules/constants');
  const { SysConfigBackend } = require('../utils/sysconfig.backend');

  const chooseName = () => {
    if (config.environment == 'production') {
      return SYSCFG_IPOFFICE_SUBSCRIPTION80ID_REC;
    } else {
      return SYSCFG_IPOFFICE_SUBSCRIPTION70ID_REC;
    }
  }

  const name = chooseName();

  const result = await SysConfigBackend.findOneAndUpdate({
    name: name
  }, {
    '$inc': {
      'value.steps': 1
    },
    '$setOnInsert': {
      'value.initval': SYSCFG_IPOFFICE_SUBSCRIPTIONID_INITVAL
    }
  }, {
    upsert: true,
    new: true,
    requestId: req.requestId,
  });

  if (!result || !result.value) {
    logger.error(fn, 'cannot find next IPOffice subscription I.');
    throw new Error('Cannot find next IPOffice subscription ID');
  }

  return result.value.initval + result.value.steps;
};

const triggerProvisionSubscriptionTask = async(req) => {
  const fn = `[${req.requestId}]${ns}[triggerProvisionSubscriptionTask]`;
  const { TaskHelper } = require('../modules/utils/task-helper');
  const taskqueue = require('../../modules/taskqueue');
  const {
    SYSCFG_IPOFFICE_SUBSCRIPTION_STATUS,
    SYSCFG_IPOFFICE_SUBSCRIPTION_IDLE,
    SYSCFG_IPOFFICE_SUBSCRIPTION_INPROCESS,
    SYSCFG_IPOFFICE_SUBSCRIPTION_LOCKTM,
    SYSCFG_IPOFFICE_SUBSCRIPTION_TRIGGERED_TIMES,
  } = require('../../modules/constants');
  const options = { requestId: req.requestId };

  const shouldTriggerTask = await TaskHelper.shouldTrigger(
    SYSCFG_IPOFFICE_SUBSCRIPTION_STATUS,
    SYSCFG_IPOFFICE_SUBSCRIPTION_IDLE,
    SYSCFG_IPOFFICE_SUBSCRIPTION_INPROCESS,
    SYSCFG_IPOFFICE_SUBSCRIPTION_LOCKTM,
    options
  );

  if (shouldTriggerTask) {
    await TaskHelper.resetTriggeredTimes(SYSCFG_IPOFFICE_SUBSCRIPTION_TRIGGERED_TIMES, options);

    logger.info(fn, 'Trigger a task to create customer setting xml!');
    // FIXME: this task is still outside of server folder
    taskqueue.launchDefer(req, 'saveIpOfficeSubscriptionToXMLHandle', {}, {
      defferOption: true,
      attempts: 1
    });
  } else {
    await TaskHelper.resetTriggeredTimes(SYSCFG_IPOFFICE_SUBSCRIPTION_TRIGGERED_TIMES, options);
  }
};

const triggerProvisionCustomerSettingsTask = async(req) => {
  const fn = `[${req.requestId}]${ns}[triggerProvisionCustomerSettingsTask]`;
  const { TaskHelper } = require('../modules/utils/task-helper');
  const taskqueue = require('../../modules/taskqueue');
  const config = require('../../config');
  const {
    IPOFFICE_SETTINGXML_TASK_STATUS,
    IPOFFICE_SETTINGXML_TASK_INPROCESS,
    IPOFFICE_SETTINGXML_TASK_IDLE,
    IPOFFICE_SETTINGXML_TASK_LOCKTM,
  } = require('./constants');
  const options = { requestId: req.requestId };

  const shouldTriggerTask = await TaskHelper.shouldTrigger(
    IPOFFICE_SETTINGXML_TASK_STATUS,
    IPOFFICE_SETTINGXML_TASK_IDLE,
    IPOFFICE_SETTINGXML_TASK_INPROCESS,
    IPOFFICE_SETTINGXML_TASK_LOCKTM,
    options
  );

  if (shouldTriggerTask) {
    logger.info(fn, 'Trigger a task to create customer setting xml!');
    taskqueue.launchDefer(req, 'IPOfficeProvisionCustomerSettingsTask', {}, {
      defferOption: true,
      backoff_seconds: 300,
      attempts: 3,
      delay: config.environment == 'production' ? 120 : 20
    });
  } else {
    logger.info(fn, 'No need to trigger create customer setting xml task');
  }
};

const triggerProvisionSIPTrunkingTask = async (req) => {
  const fn = `[${req.requestId}]${ns}[triggerProvisionSIPTrunkingTask]`;
  const { TaskHelper } = require('../modules/utils/task-helper');
  const taskqueue = require('../../modules/taskqueue');
  const {
    IPOFFICE_SIP_PROVISION_TASK_STATUS,
    IPOFFICE_SIP_PROVISION_TASK_INPROCESS,
    IPOFFICE_SIP_PROVISION_TASK_IDLE,
    IPOFFICE_SIP_PROVISION_TASK_LOCKTM,
  } = require('./constants');
  const options = { requestId: req.requestId };

  const shouldTriggerTask = await TaskHelper.shouldTrigger(
    IPOFFICE_SIP_PROVISION_TASK_STATUS,
    IPOFFICE_SIP_PROVISION_TASK_IDLE,
    IPOFFICE_SIP_PROVISION_TASK_INPROCESS,
    IPOFFICE_SIP_PROVISION_TASK_LOCKTM,
    options
  );

  if (shouldTriggerTask)  {
    logger.info(fn, 'Trigger a task to initialize SIP trunking');
    taskqueue.launchDefer(req, 'IPOfficeProvisionSIPInitializeTask', {}, {
      defferOption: true,
      backoff_seconds: 300,
      attempts: 3,
    });
  } else {
    logger.info(fn, 'No need to trigger create customer setting xml task');
  }
};

const triggerProvisionSuccessEmailTask = (req, data) => {
  const fn = `[${req.requestId}]${ns}[triggerProvisionSuccessEmailTask]`;
  const taskqueue = require('../../modules/taskqueue');
  const config = require('../../config');

  logger.info(fn, 'Trigger a task to send provision success email');
  taskqueue.launchDefer(req, 'IPOfficeProvisionSuccessEmailTask', data, {
    delay: config.environment == 'production' ? 1200 : 0, //defer email 20 minutes on production
    defferOption: true,
    backoff_seconds: 300,
    attempts: 3,
  });
};

const triggerProvisionFailEmailTask = (req, data) => {
  const fn = `[${req.requestId}]${ns}[triggerProvisionFailEmailTask]`;
  const taskqueue = require('../../modules/taskqueue');

  logger.info(fn, 'Trigger a task to send provision fail email');
  taskqueue.launchDefer(req, 'IPOfficeProvisionFailEmailTask', data, {
    delay: 0,
    defferOption: true,
    backoff_seconds: 300,
    attempts: 3,
  });
};

const triggerMSAProvisionEmailTask = (req, data) => {
  const fn = `[${req.requestId}]${ns}[triggerMSAProvisionEmailTask]`;
  const taskqueue = require('../../modules/taskqueue');

  logger.info(fn, 'Trigger a task to send MSA provision email');
  taskqueue.launchDefer(req, 'IPOfficeMSAProvisionEmailTask', data, {
    delay: 0,
    defferOption: true,
    backoff_seconds: 300,
    attempts: 3,
  });
};
const getWeblsmid = async(req, subscriptionID, isContainer) => {
  const fn = `[${req.requestId}]${ns}[getWeblsmid]`;
  const libxmljs = require('libxmljs');
  const config = require('../../config');
  const OSSAddress = isContainer ? config.IPOFFICE && config.IPOFFICE.CSI_ADDRESS : config.IPOFFICE && config.IPOFFICE.OSS_ADDRESS;

  if (!OSSAddress) {
    logger.warn(fn, 'There is no configuration root url of OSSAddress, No request \
      will send out to the ipoffice server!!');
    logger.info(fn, `Apply subscriptioinID = ${subscriptionID} as weblsmid`);
    return subscriptionID;
  }

  let options = {
    method: 'GET',
    url: `${OSSAddress}/mocka1s/map?SubscriptionID=${subscriptionID}`,
    strictSSL: config.environment != 'production' ? false : true,
    insecure: config.environment != 'production' ? true : false,
    rejectUnauthorized: config.environment != 'production' ? false : true
  };
  logger.info(fn, 'send request to OSS', options);

  const http = require('../modules/http');

  try {
    const { body } = await http(fn, options);
    // sample reponse:
    // <Subscription>
    //  <SubscriptionID>10</SubscriptionID>
    //  <CLID>00012</CLID>
    //  <instance>ipo-00012</instance>
    //  <host>ipo-00012.ipo.ipo-cloud.com</host>
    //  <ipaddress>35.188.145.166</ipaddress>
    // </Subscription>
    const xmlResponse = libxmljs.parseXml(body);
    let clid = xmlResponse.get('/Subscription/CLID');
    if (clid) {
      clid = clid.text();
      logger.info(fn, `found CLID: ${clid}`);
    } else {
      logger.info(fn, `cannot found CLID`);
      clid = '';
    }

    return clid;
  } catch (err) {
    logger.error(fn, 'Error:', err);
  }

  return '';
};

const getInstanceDetails = async(req, subscriptionID, isContainer) => {
  const fn = `[${req.requestId}]${ns}[getInstanceDetails]`;
  const libxmljs = require('libxmljs');
  const config = require('../../config');
  const OSSAddress = isContainer ? config.IPOFFICE && config.IPOFFICE.CSI_ADDRESS : config.IPOFFICE && config.IPOFFICE.OSS_ADDRESS;

  if (!OSSAddress) {
    logger.warn(fn, 'There is no configuration root url of OSSAddress, No request \
      will send out to the ipoffice server!!');
    logger.info(fn, `Apply subscriptioinID = ${subscriptionID} as weblsmid`);
    return {
      ipAddress: '127.0.0.1',
      host: 'ipoffice.com',
      instance: `uc${subscriptionID}`
    };
  }

  let options = {
    method: 'GET',
    url: `${OSSAddress}/mocka1s/map?SubscriptionID=${subscriptionID}`,
    strictSSL: config.environment != 'production' ? false : true,
    insecure: config.environment != 'production' ? true : false,
    rejectUnauthorized: config.environment != 'production' ? false : true
  };
  logger.info(fn, 'send request to OSS', options);

  const http = require('../modules/http');

  try {
    const { body } = await http(fn, options);
    // sample reponse:
    // <Subscription>
    //  <SubscriptionID>10</SubscriptionID>
    //  <CLID>00012</CLID>
    //  <instance>ipo-00012</instance>
    //  <host>ipo-00012.ipo.ipo-cloud.com</host>
    //  <ipaddress>35.188.145.166</ipaddress>
    // </Subscription>
    const xmlResponse = libxmljs.parseXml(body);
    //let clid = xmlResponse.get('/Subscription/CLID');
    let ipaddressNode = xmlResponse.get('/Subscription/ipaddress');
    let hostNode = xmlResponse.get('/Subscription/host');
    let instanceNode = xmlResponse.get('/Subscription/instance');
    if (hostNode && ipaddressNode && instanceNode)  {
      let instanceInfo = {
        ipAddress: ipaddressNode.text(),
        host: hostNode.text(),
        instance: instanceNode.text()
      };

      return instanceInfo;
    }
  } catch (err) {
    logger.error(fn, 'Error:', err);
  }

  return;
};

const createUsersFromPurchasedPlan = async(req, purchasedPlan) => {
  const fn = `[${req.requestId}]${ns}[createUsersFromPurchasedPlan]`;
  const { nonBlockify } = require('../modules/utils');
  const { findCartItemContext, findCartItemsBySalesModelItemAndTags } = require('../modules/cart-salesmodel-rules/utils');

  const generatePassword = () => {
    // const startAt = (new Date()).getTime();
    const rnd = () => _.sampleSize('abcdefghjkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ'.split(''), 8).join('');
    const validate = (pin) => {
      var ok = true,
        i;

      if (ok) {
        // 3 or more consecutive identical characters of any type is not allowed.
        for (i = 2; ok && i < pin.length; i++) {
          ok = !(pin[i - 2] === pin[i - 1] && pin[i - 1] === pin[i]);
        }
      }

      return ok;
    };
    // let i = 0;
    let result;
    do {
      result = rnd();
      // i++;
    } while (!validate(result));
    // const endAt = (new Date()).getTime(); console.log('get result', result, 'in',
    // i, 'loops'); console.log('profiling', startAt, ' -> ', endAt, '=', endAt -
    // startAt); tried 1000 loops, all finished in 1 loop, takes 5 ~ 11ms

    return result;
  };
  const generatePIN = (ext) => {
    // const startAt = (new Date()).getTime();
    const rnd = () => Math
      .random()
      .toString()
      .substr(2, 6);
    const validate = (pin) => {
      var ok = true,
        i;

      if (ok) {
        // non-sequential
        for (i = 1; ok && i < pin.length; i++) {
          ok = !(pin.charCodeAt(i - 1) + 1 === pin.charCodeAt(i) || pin.charCodeAt(i - 1) - 1 === pin.charCodeAt(i));
        }
      }
      if (ok) {
        // no repeated digits
        for (i = 0; ok && i < pin.length - 1; i++) {
          ok = pin
            .substr(i + 1)
            .indexOf(pin[i]) === -1;
        }
      }
      if (ok) {
        // no same as extension
        ok = pin.indexOf(ext) === -1;
      }

      return ok;
    };
    // let i = 0;
    let result;
    do {
      result = rnd();
      // i++;
    } while (!validate(result));
    // const endAt = (new Date()).getTime(); console.log('get result', result, 'in',
    // i, 'loops'); console.log('profiling', startAt, ' -> ', endAt, '=', endAt -
    // startAt); tried 1000 loops, saw max 241 loops, average 21.731 loops, takes 12
    // ~ 14 ms

    return result;
  };

  let users = [];
  let ext = 200;

  const asyncCreateUser = nonBlockify((userType, deviceType) => {
    users.push({
      type: userType,
      name: 'u' + ext,
      ext,
      password: generatePassword(),
      pin: generatePIN('' + ext),
      device: deviceType
    });

    ext++;
  });

  for (let i in purchasedPlan.items) {
    const item = purchasedPlan.items[i];
    const itemContext = findCartItemContext(item);
    const tags = itemContext && itemContext.tags;
    if (!tags || tags.indexOf(IPOFFICE_USER_TYPES_TAG) === -1) {
      continue;
    }

    const isPowerUser = tags.indexOf(IPOFFICE_USER_TYPE_POWER) > -1;
    const isStandardUser = tags.indexOf(IPOFFICE_USER_TYPE_STANDARD) > -1;
    const isBasicUser = tags.indexOf(IPOFFICE_USER_TYPE_BASIC) > -1;

    if (!isPowerUser && !isStandardUser && !isBasicUser) {
      continue;
    }

    const userType = (isPowerUser ? IPOFFICE_USER_TYPE_POWER :
      (isStandardUser ? IPOFFICE_USER_TYPE_BUSINESS : IPOFFICE_USER_TYPE_ESSENTIAL));

    const deviceItems = findCartItemsBySalesModelItemAndTags(purchasedPlan, itemContext.identifier, IPOFFICE_DEVICE_TAG);

    let totalDevice = 0;
    for (let deviceItem of deviceItems) {
      const deviceType = deviceItem && deviceItem.references && deviceItem.references.provisionCode;
      totalDevice += deviceItem.quantity;

      for (let j = 0; j < deviceItem.quantity; j++) {
        await asyncCreateUser(userType, deviceType);
      }
    }

    for (let j = 0; j < (item.quantity - totalDevice); j++) {
      const deviceType = 'None';
      await asyncCreateUser(userType, deviceType);
    }
  }

  logger.info(fn, 'user prepared:', JSON.stringify(users));

  return users;
};

const createCustomerSettingXml = async(req, purchasedPlan, subscriptionID, extraData) => {
  const fn = `[${req.requestId}]${ns}[createCustomerSettingXml]`;
  logger.info(fn, `started on purchased plan ${purchasedPlan._id}: ${purchasedPlan.confirmationNumber}...`);

  const { nonBlockify } = require('../modules/utils');
  const IPOfficeCustomerModel = require('../../models/IPOfficeCustomerModel');
  const { PurchasedPlanBackend } = require('../purchased-plan/purchased-plan.backend');
  const { ORDER_STATUS_TYPES } = require('../../config/constants');
  const { cartHasProductsOf, findCartItemContext } = require('../modules/cart-salesmodel-rules/utils');
  const ipofficeItemIndexes = purchasedPlan && cartHasProductsOf(purchasedPlan, PRODUCT_ENGINE_NAME);

  const users = await createUsersFromPurchasedPlan(req, purchasedPlan);

  const primaryItem = ipofficeItemIndexes && purchasedPlan.items[ipofficeItemIndexes[0]];
  logger.info(fn, `primary item is ${primaryItem && primaryItem.identifier}`);
  const ipOfficeMetaData = primaryItem && primaryItem.metadata;
  logger.info(fn, 'metadata:', JSON.stringify(ipOfficeMetaData));

  const didTagsToFind = {
    main: 'did-main',
    existing: 'did-existing',
    tollfree: 'did-tollfree',
    local: 'did-local',
  };
  const didItem = purchasedPlan.items.find((item) => {
    const itemContext = findCartItemContext(item);
    const tags = itemContext && itemContext.tags;
    return (item.engines && item.engines.indexOf(PRODUCT_ENGINE_NAME) > -1 &&
      tags && tags.indexOf(didTagsToFind.main) > -1);
  });
  let isDidExisting = false;
  let phoneNumber = null;
  let existingNumber = null;
  if (didItem) {
    const itemContext = findCartItemContext(didItem);
    if (itemContext) {
      const tags = itemContext && itemContext.tags;
      if (tags && tags.indexOf(didTagsToFind.existing) > -1) {
        isDidExisting = true;
      }
      if (itemContext.helper) {
        phoneNumber = extraData.phoneNumber;
        if (isDidExisting) {
          existingNumber = extraData.existingNumber;
        }
      }
    }
  }
  logger.info(fn, `isDidExisting=${isDidExisting}, existingNumber=${existingNumber}, phoneNumber=${phoneNumber}`);
  const sanitizePhoneNumber = (phoneNumber) => phoneNumber ? parseInt(String(phoneNumber).replace(/\+/g, '')) : 0;
  const getExtntype = (device) => {
    const defaultExtntype = 1;
    const extntypeMaps = {
    };

    return (device && extntypeMaps[device]) || defaultExtntype;
  };
  const resolveLicense = (type) => type === IPOFFICE_USER_TYPE_POWER ? 1 : (type === IPOFFICE_USER_TYPE_BUSINESS ? 2 : 0);

  // let userPassword = extraData.IPODefaultUserPassword;
  let settingUsers = [];
  let settingGroups = [{
    name: 'default',
    extn: 100,
    ddi: sanitizePhoneNumber(phoneNumber),
    ringmode: 0,
    members: []
  }];

  const userTotals = {
    basic: 0,
    standard: 0,
    power: 0,
  };
  const asyncCreateSettingUser = nonBlockify((user) => {
    const license = resolveLicense(user.type);
    const extntype = getExtntype('-');

    settingUsers.push({
      //guid: Utils.generateGUID(),
      name: user.name,
      extn: user.ext,
      extntype, // FIXME: we used to have user-device configuration table
      license,
      //ddi: null,
      password: user.password,
      pin: user.pin,
      receptionist: 0,
    });
    settingGroups[0].members.push({
      extn: user.ext,
    });

    if (user.type === IPOFFICE_USER_TYPE_POWER) {
      userTotals.power++;
    } else if (user.type === IPOFFICE_USER_TYPE_BUSINESS) {
      userTotals.standard++;
    } else { //if (user.type === IPOFFICE_USER_TYPE_ESSENTIAL) {
      userTotals.basic++;
    }
  });
  for (let user of users) {
    await asyncCreateSettingUser(user);
  }

  const stgadminpassword = generatePassword(16, 'abcdefghjkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ1234567890~!@#$*()_+-{}[];?,./');
  const date = new Date();
  let settingRecord = {
    config: {
      //weblmsid: Utils.padNumber(SubscriptionID, 5),
      weblmsid: subscriptionID,
      date,
      usertotals: {
        essential: userTotals.basic,
        business: userTotals.standard,
        power: userTotals.power,
        receptionist: 0
      },
      users: settingUsers,
      groups: settingGroups,
      lines: {
        line: {
          type: 0,
          address: '72.9.136.235',
          domain: extraData.sipDomain,
          sessions: 10,
          username: extraData.sipCred.username,
          authname: extraData.sipCred.username,
          password: extraData.sipCred.password
        }
      },
      system: {
        name: String(purchasedPlan._id),
        uptime: 0,
        version: 'system-version'
      },
      security: {
        stgadminpassword: stgadminpassword
      }
    }
  };
  logger.info(fn, 'settingRecord prepared:', JSON.stringify(settingRecord));

  const xmlFileName = `${subscriptionID}settings.xml`;
  logger.info(fn, 'xmlFileName:', xmlFileName);


  const saveXml = util.promisify(IPOfficeCustomerModel.save);

  try {
    await PurchasedPlanBackend.log(
      purchasedPlan,
      false,
      ORDER_STATUS_TYPES.IP_OFFICE_PROVISIONING_CUSTOMER_SETTINGS,
      null,
      extraData.user,
      req
    );

    await saveXml(req, settingRecord, xmlFileName, extraData.isContainer);

    await PurchasedPlanBackend.log(
      purchasedPlan,
      false,
      ORDER_STATUS_TYPES.IP_OFFICE_PROVISION_CUSTOMER_SETTINGS_SUCCESS,
      null,
      extraData.user,
      req
    );
  } catch (err) {
    logger.error(fn, 'Error:', err);
    await PurchasedPlanBackend.log(
      purchasedPlan,
      true,
      ORDER_STATUS_TYPES.IP_OFFICE_PROVISION_CUSTOMER_SETTINGS_ERROR,
      err,
      extraData.user,
      req
    );
  }

  return {
    phoneNumber,
    isDidExisting,
    existingNumber,
    userTotals,
    users,
    stgadminpassword,
  };
};

const generatePassword = (length, sampleSet) => {
  // const startAt = (new Date()).getTime();
  sampleSet = sampleSet || 'abcdefghjkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ';
  const rnd = () => _.sampleSize(sampleSet.split(''), length).join('');
  const validate = (pin) => {
    var ok = true,
      i;

    if (ok) {
      // 3 or more consecutive identical characters of any type is not allowed.
      for (i = 2; ok && i < pin.length; i++) {
        ok = !(pin[i - 2] === pin[i - 1] && pin[i - 1] === pin[i]);
      }
    }

    return ok;
  };
  // let i = 0;
  let result;
  do {
    result = rnd();
    // i++;
  } while (!validate(result));
  // const endAt = (new Date()).getTime(); console.log('get result', result, 'in',
  // i, 'loops'); console.log('profiling', startAt, ' -> ', endAt, '=', endAt -
  // startAt); tried 1000 loops, all finished in 1 loop, takes 5 ~ 11ms

  return result;
};

module.exports = {
  findTemporaryPhoneNumber,
  getIPOfficeNextSubscriptionTrackId,
  triggerProvisionSubscriptionTask,
  triggerProvisionCustomerSettingsTask,
  triggerProvisionSIPTrunkingTask,
  triggerProvisionSuccessEmailTask,
  triggerProvisionFailEmailTask,
  triggerMSAProvisionEmailTask,
  getWeblsmid,
  createCustomerSettingXml,
  generatePassword,
  getInstanceDetails,
};
