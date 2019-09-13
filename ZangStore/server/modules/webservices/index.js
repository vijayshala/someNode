const register = (app) => {
  app.use(`/webservice/global`, require('./routes'));
};

module.exports = register;
