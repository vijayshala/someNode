const register = (app => {
  const globalroutes = require('../webservices');
  globalroutes(app);

  const ipoffice = require('../../ip-office/webservices');
  ipoffice(app);

  const kazoo = require('../../kazoo/webservices');
  kazoo(app);
});

module.exports = register;
