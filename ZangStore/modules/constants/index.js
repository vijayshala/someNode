exports.AuthenticateTypeJWT = 'jwt';
exports.AuthenticateTypeAPIKey = 'api_key';
exports.AccountsSystemName = 'accounts';
exports.KazooSystemName = 'kazoo';
exports.BillingEngineSystemName = 'billingengine';
exports.GermanyBillingEngine = 'germanybillingengine';
exports.SyncOperateDelete = 2;

exports.HttpErrorStatus = 400;
exports.HttpSuccessStatus = 200;
exports.HttpNoPermissionStatus = 403;
exports.HttpUnauthorizedStatus = 401;
exports.HttpErrorTaskQueueNeverTry = 461;
exports.deferOutTimeout = 'timeout';
exports.DeferOutTimeoutInMSec = 1200000;
exports.IPOfficeSubscriptionTempFolder = 'avayastore_temp';
exports.IPOfficeSubscriptionHeader = '<?xml version="1.0" encoding="UTF-8"?> \
<SubscriptionResponse \
xmlns:i="http://www.w3.org/2001/XMLSchema-instance" \
xmlns="http://www.avaya.com/OSS/ActiveSubscriptionsResponse/v1"> \
    <ReqUUID>temp</ReqUUID> \
    <LinkID>60</LinkID> \
    <SubscriptionList>';
exports.IPOfficeSubscription70Header = '<?xml version="1.0" encoding="UTF-8"?> \
    <SubscriptionResponse \
    xmlns:i="http://www.w3.org/2001/XMLSchema-instance" \
    xmlns="http://www.avaya.com/OSS/ActiveSubscriptionsResponse/v1"> \
        <ReqUUID>temp</ReqUUID> \
        <LinkID>70</LinkID> \
        <SubscriptionList>';
exports.IPOfficeSubscription80Header = '<?xml version="1.0" encoding="UTF-8"?> \
        <SubscriptionResponse \
        xmlns:i="http://www.w3.org/2001/XMLSchema-instance" \
        xmlns="http://www.avaya.com/OSS/ActiveSubscriptionsResponse/v1"> \
            <ReqUUID>temp</ReqUUID> \
            <LinkID>80</LinkID> \
            <SubscriptionList>';
exports.IPOfficeSubscriptionFooter = '</SubscriptionList> \
</SubscriptionResponse>';

exports.IPOfficeSubscriptionFilename = 'subscription60.xml';
exports.IPOfficeSubscription70Filename = 'subscription70.xml';
exports.IPOfficeSubscription80Filename = 'subscription80.xml';
exports.SYSCFG_IPOFFICE_SUBSCRIPTION_STATUS = 'ipoffice_subscription_status';
exports.SYSCFG_IPOFFICE_SUBSCRIPTION_INPROCESS = 1;
exports.SYSCFG_IPOFFICE_SUBSCRIPTION_IDLE = 0;
exports.SYSCFG_IPOFFICE_SUBSCRIPTION_LOCKTM = 3600 * 1000; //In million seconds.

exports.SYSCFG_PO_SUBSCRIPTION_STATUS = 'po_subscription_status';
exports.SYSCFG_PO_SUBSCRIPTION_INPROCESS = 1;
exports.SYSCFG_PO_SUBSCRIPTION_IDLE = 0;
exports.SYSCFG_PO_SUBSCRIPTION_LOCKTM = 12 * 3600 * 1000; //In million seconds.
exports.SYSCFG_PO_SUBSCRIPTION_TRIGGERED_TIMES = 'po_subscription_triggered_times';

exports.SYSCFG_IPOFFICE_SUBSCRIPTION_TRIGGERED_TIMES = 'ipoffice_subscription_triggered_times';
exports.SYSCFG_IPOFFICE_SUBSCRIPTION_CUSTOMER_XSD = 'ipoffice_customer_xsd';

exports.SYSCFG_IPOFFICE_SUBSCRIPTION70_CUSTOMER_XSD = 'ipoffice_customer70_xsd';

exports.SYSCFG_IPOFFICE_SUBSCRIPTIONID_REC = 'ipoffice_subscription_subscription_id';
exports.SYSCFG_IPOFFICE_SUBSCRIPTION70ID_REC = 'ipoffice_subscription70_subscription_id';
exports.SYSCFG_IPOFFICE_SUBSCRIPTION80ID_REC = 'ipoffice_subscription80_subscription_id';
exports.SYSCFG_IPOFFICE_SUBSCRIPTIONID_INITVAL = 0;

exports.IPOFFICE_SETTINGXML_NOT_CREATIION = 0;
exports.IPOFFICE_SETTINGXML_CREATIION = 1;
exports.IPOFFICE_PROVISIONING_COMPLETE = 2;
exports.IPOFFICE_PROVISIONING_FAILED = -1;

exports.SYSCFG_IPOFFICE_SETTINGXML_STATUS = 'ipoffice_settingxml_status';
exports.SYSCFG_IPOFFICE_SETTINGXML_INPROCESS = 1;
exports.SYSCFG_IPOFFICE_SETTINGXML_IDLE = 0;
exports.SYSCFG_IPOFFICE_SETTINGXML_LOCKTM = 3600 * 1000; //In million seconds.


exports.RATE_LONGDISTC_TYPE = 'long-distance';
exports.RATE_LONGDISTC_PROVIDERS = [
  {type: 'us-east-floweroute', name:'', from: 'us', cost_ratio: 1.05}
]
exports.RATE_LONGDISTC_IMPORT_UNREADY_STATUS = 'unready';
exports.RATE_LONGDISTC_IMPORT_READY_STATUS = 'ready';


