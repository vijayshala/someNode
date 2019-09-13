const { PRODUCT_ENGINE_NAME } = require('../constants');

const register = () => {
  let modules = {};

  modules[`${PRODUCT_ENGINE_NAME}.example`] = require('./example');

  return modules;
};

module.exports = register;
