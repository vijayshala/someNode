const { PRODUCT_ENGINE_NAME } = require('../constants');

const register = (app) => {
  app.use(`/clientapi/${PRODUCT_ENGINE_NAME}`, require('./routes'));
};

module.exports = register;
