const ns = '[product.controller]';
const logger = require('applogger');

const { PRODUCT_ENGINE_NAME } = require('../constants');

const getStatus = (req, res, next) => {
  const fn = `[${req.requestId}]${ns}[getStatus]`;

  res.status(200).json({
    error: false,
    data: {
      productEngine: PRODUCT_ENGINE_NAME,
    },
  });
};

module.exports = {
  getStatus,
};
