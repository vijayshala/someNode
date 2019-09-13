const ns = '[did.controller]';
const logger = require('applogger');

const config = require('../../config');

const kazooConstants = require('../kazoo/constants');
const ipOfficeConstants = require('../ip-office/constants');

const resolveNumbers = async(req, res, next) => {
  const fn = `[${req.requestId}]${ns}[resolveNumbers]`;
  const user = req.userInfo;
  logger.info(fn, 'user:', user);
  let { provider, prefix, country } = req.params || {}
  logger.info(fn, 'params', { provider, prefix  }); 
  try {
    let numbers = [];

    if (provider == ipOfficeConstants.PRODUCT_ENGINE_NAME) {
      const { findZCloudNumbers } = require('./did.backend');
      const numberResponse = await findZCloudNumbers(req, country, prefix);
      numbers = numberResponse;
    } else if (provider == kazooConstants.PRODUCT_ENGINE_NAME) {
      const { findKazooNumbers } = require('./did.backend');
      const numberResponse = await findKazooNumbers(req, country, prefix);
      numbers = numberResponse;
    }

    res.status(200).json({
      error: false,
      data: numbers,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  resolveNumbers,
};
