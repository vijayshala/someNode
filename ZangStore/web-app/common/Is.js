export const URL_DETECTION_REGEXP = '^[a-z0-9]+([-.]{1}[a-z0-9]+)*.[a-z]{2,5}$';

export const checkObjectType = (object, objectType) =>
  Object.prototype.toString.call(object) === '[object ' + objectType + ']';

export const isArray = object => checkObjectType(object, 'Array');

export const isObject = object => checkObjectType(object, 'Object');

export const isFunction = object => checkObjectType(object, 'Function');

export const isNumber = object => checkObjectType(object, 'Number');

export const isBoolean = object => checkObjectType(object, 'Boolean');

export const isString = object => checkObjectType(object, 'String');

export const isEmail = object => {
  const re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  return re.test(object);
};

export const isBlob = object => object.indexOf('blob:') > -1;

export const isEmpty = object =>
  object === undefined ||
  object === '' ||
  (this.$array(object) && object.length === 0);

export const isImageMime = mime => mime.indexOf('image') >= 0;

export const isVideoMime = mime => mime.indexOf('video') >= 0;

export const isFirefox = () => navigator.mozGetUserMedia;

export const isChrome = () => navigator.webkitGetUserMedia;
