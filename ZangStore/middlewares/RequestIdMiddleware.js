var ns = '[RequestIdMiddleware]';
var logger = require('applogger');
var Utils = require('../common/Utils');
const config = require('../config');

module.exports = function (req, res, next) {
  var requestId = (req.headers && req.headers['x-cloud-trace-context']) || Utils.generateRandomString(15);
  req.requestId = requestId;
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Content-Security-Policy', 'frame-ancestors \'none\';');
  if (config.environment != 'development') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000;');
  }
  next();
};
