const register = (taskqueue) => {
  const { saveIpOfficeSubscriptionToXMLHandle } = require('../../../models/IPOfficeSubscriptionTackModel');
  taskqueue.registerDeferHandle('IPOfficeExampleTask', require('./example'));
  taskqueue.registerDeferHandle('IPOfficeProvisionCustomerSettingsTask', require('./provision-customer-settings'));
  taskqueue.registerDeferHandle('IPOfficeProvisionSIPInitializeTask', require('./provision-sip-initialize'));
  taskqueue.registerDeferHandle('IPOfficeProvisionSuccessEmailTask', require('./provision-success-email'));
  taskqueue.registerDeferHandle('IPOfficeProvisionFailEmailTask', require('./provision-fail-email'));
  taskqueue.registerDeferHandle('IPOfficeMSAProvisionEmailTask', require('./msa-provision-email'));
  taskqueue.registerDeferHandle('saveIpOfficeSubscriptionToXMLHandle', saveIpOfficeSubscriptionToXMLHandle);
};

module.exports = register;
