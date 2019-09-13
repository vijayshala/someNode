const register = (taskqueue) => {
    taskqueue.registerDeferHandle('CART_SUMMARY_EMAIL', require('./cart-summary-email'));
    taskqueue.registerDeferHandle('CLOCKTICK12HOUR', require('./clocktick12hour'));
    taskqueue.registerDeferHandle('PROVISIONING_FAILED_EMAIL', require('./send-provision-failed-email'));
};
  
module.exports = register;
  