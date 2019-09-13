const register = (taskqueue) => {
    taskqueue.registerDeferHandle('ZangSpacesSuccessEmail', require('./provision-success-email'));
  };
  
  module.exports = register;
  