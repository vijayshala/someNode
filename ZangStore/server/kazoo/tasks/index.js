const register = (taskqueue) => {
  //taskqueue.registerDeferHandle('KAZOO_EXAMPLE', require('./example'));
  taskqueue.registerDeferHandle('KAZOO_PROVISIONING', require('./provisioning'));
  taskqueue.registerDeferHandle('KAZOO_UNPROVISIONING', require('./unprovision'));
};

module.exports = register;
