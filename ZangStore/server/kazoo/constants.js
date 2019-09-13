const PRODUCT_ENGINE_NAME = 'kazoo';

const KAZOO_USER_TYPES_TAG = 'user-types';
const KAZOO_DEVICE_TAG = 'devices';
const KAZOO_USER_TYPE_ESSENTIAL = 'essential-user';
const KAZOO_USER_TYPE_BUSINESS = 'business-user';
const KAZOO_USER_TYPE_POWER = 'power-user';
const KAZOO_ADDON = 'addon';
const KAZOO_USER_TYPES = [
  KAZOO_USER_TYPE_ESSENTIAL,
  KAZOO_USER_TYPE_BUSINESS,
  KAZOO_USER_TYPE_POWER,
];

const PROVISION_STATUS_TRIGGERED = 'TRIGGERED';
const PROVISION_STATUS_RUNNING = 'RUNNING';
const PROVISION_STATUS_COMPLETED = 'COMPLETED';
const PROVISION_STATUS_CANCELED = 'CANCELED';
const PROVISION_STATUS_FAILED = 'FAILED';
const PROVISION_STATUS_DISABLED = 'DISABLED';
const PROVISION_STATUS_CANCEL_FAILED = 'CANCEL_FAILED';

const KAZOO_AUTH_TOKEN_SYSCONFIG = 'kazoo_auth_token';
const KAZOO_AUTH_TOKEN_EXPIRE = 1000 * 60 * 30;  //30 min

const KAZOO_UI_METADATA = {
  ui_metadata: {
    version: '4.2-49',
    ui: 'monster-ui',
    origin: 'accounts'
  }
};

const KAZOO_CALL_FLOW_FEATURE_CODES = [
  {
    name : 'call_forward[action=deactivate]',
    number : '73',
    callflowNumber : '*73',
    moduleName : 'call_forward',
    actionName : 'deactivate'
  }, {
    name : 'call_forward[action=activate]',
    number : '72',
    callflowNumber : '*72',
    moduleName : 'call_forward',
    actionName : 'activate'
  }, {
    name : 'call_forward[action=toggle]',
    number : '74',
    pattern : '^\\*74([0-9]*)$',
    moduleName : 'call_forward',
    actionName : 'toggle'
  }, {
    name : 'call_forward[action=update]',
    number : '56',
    callflowNumber : '*56',
    moduleName : 'call_forward',
    actionName : 'update'
  }, {
    name : 'hotdesk[action=login]',
    number : '11',
    callflowNumber : '*11',
    moduleName : 'hotdesk',
    actionName : 'login'
  }, {
    name : 'hotdesk[action=logout]',
    number : '12',
    callflowNumber : '*12',
    moduleName : 'hotdesk',
    actionName : 'logout'
  }, {
    name : 'hotdesk[action=toggle]',
    number : '13',
    callflowNumber : '*13',
    moduleName : 'hotdesk',
    actionName : 'toggle'
  }, {
    name : 'voicemail[action=check]',
    number : '97',
    callflowNumber : '*97',
    moduleName : 'voicemail',
    actionName : 'check'
  },{
    name : 'voicemail[single_mailbox_login]',
    number : '98',
    callflowNumber : '*98',
    moduleName : 'voicemail',
    actionName : 'check',
    extraData : {
      single_mailbox_login : true
    }
  }, {
    name : 'voicemail[action="direct"]',
    number : '*',
    pattern : '^\\*\\*([0-9]*)$',
    moduleName : 'voicemail',
    actionName : 'compose'
  }, {
    name : 'intercom',
    number : '0',
    pattern : '^\\*0([0-9]*)$',
    moduleName : 'intercom',
    actionName : 'compose'
  }, {
    name : 'privacy[mode=full]',
    number : '67',
    pattern : '^\\*67([0-9]*)$',
    moduleName : 'privacy',
    actionName : 'full'
  }, {
    name : 'park_and_retrieve',
    number : '3',
    pattern : '^\\*3([0-9]*)$',
    moduleName : 'park',
    actionName : 'auto'
  }, {
    name : 'valet',
    number : '4',
    callflowNumber : '*4',
    moduleName : 'park',
    actionName : 'park'
  }, {
    name : 'retrieve',
    number : '5',
    pattern : '^\\*5([0-9]*)$',
    moduleName : 'park',
    actionName : 'retrieve'
  }, {
    name : 'move',
    number : '6683',
    callflowNumber : '6683',
    moduleName : 'move'
  }
];

const KAZOO_TEMPORAL_RULES_LABELS = [
  'MainMonday',
  'MainTuesday',
  'MainWednesday',
  'MainThursday',
  'MainFriday',
  'MainSaturday',
  'MainSunday'
];

const KAZOO_PROVISION_APPS = {
  userportal: 'userportal',
  smartpbx: 'voip'
};

const KAZOO_MAIN_OPEN_HOURS = 'MainOpenHours';
const KAZOO_MAIN_CALLFLOW = 'MainCallflow';

const KAZOO_CALL_FLOW_LABELS = [
  KAZOO_MAIN_OPEN_HOURS,
  'MainAfterHours',
  'MainLunchHours',
  'MainHolidays'
];

const KAZOO_VIRTUAL_RECEPTIONIST_TEXT_MESSAGE = 'Thank you for calling. Please dial the extension you would like to reach or please stay on the line for further assistance.';

const KAZOO_DEFAULT_SERVICE_PLAN = 'germany_service_plan';

module.exports = {
  PRODUCT_ENGINE_NAME,

  KAZOO_USER_TYPES_TAG,
  KAZOO_DEVICE_TAG,

  KAZOO_USER_TYPE_ESSENTIAL,
  KAZOO_USER_TYPE_BUSINESS,
  KAZOO_USER_TYPE_POWER,
  KAZOO_ADDON,
  KAZOO_USER_TYPES,

  KAZOO_AUTH_TOKEN_SYSCONFIG,
  KAZOO_AUTH_TOKEN_EXPIRE,

  KAZOO_UI_METADATA,
  KAZOO_CALL_FLOW_FEATURE_CODES,
  KAZOO_TEMPORAL_RULES_LABELS,
  KAZOO_PROVISION_APPS,

  KAZOO_MAIN_OPEN_HOURS,
  KAZOO_MAIN_CALLFLOW,
  KAZOO_CALL_FLOW_LABELS,

  KAZOO_DEFAULT_SERVICE_PLAN,

  KAZOO_VIRTUAL_RECEPTIONIST_TEXT_MESSAGE,

  PROVISION_STATUS_TRIGGERED,
  PROVISION_STATUS_RUNNING,
  PROVISION_STATUS_COMPLETED,
  PROVISION_STATUS_CANCELED,
  PROVISION_STATUS_FAILED,
  PROVISION_STATUS_DISABLED,
  PROVISION_STATUS_CANCEL_FAILED,
};
