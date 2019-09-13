const ns = '[kazoo][webservices][backend]';

const logger = require('applogger');

const processKazooBillingEvent = async (payload, options)   =>  {
    const fn = `[${options.requestId}]${ns}[processKazooBillingEvent]`;
    const { PurchasedPlanBackend } = require('../../purchased-plan/purchased-plan.backend');
    const { UserBackend } = require('../../user/user.backend');
    const { OrderBackend } = require('../../order/order.backend');
    const { KAZOO_USER_TYPE_ESSENTIAL, KAZOO_USER_TYPE_BUSINESS, KAZOO_USER_TYPE_POWER, PRODUCT_ENGINE_NAME } = require('../constants');
    const CARTHANDLER = require('../../modules/cart-salesmodel-rules');
    const { findCartItemsBySalesModelAndTags, findCartItemContext } = require('../../modules/cart-salesmodel-rules/utils');

    const { account_id, items, sync_id } = payload;

    logger.info(fn, 'begin accountId=', account_id);

    //get purchased-plan and store syncID to ensure indempotency
    let purchasedPlan = await PurchasedPlanBackend.findOneAndUpdate({
        'items.metadata.kazoo.account_id': account_id,
        'metadata.kazoo_sync_ids': {
            $ne: sync_id
        }
    }, {
        $addToSet: {
            'metadata.kazoo_sync_ids': sync_id
        }
    }, {
        ...options, 
        new: true,
        ignoreNotFoundError: true
    });

    logger.info(fn, 'pp: ', purchasedPlan);

    if (!purchasedPlan) {
        logger.warn(fn, 'purchased-plan not found for this kazoo accountId');
        return;
    }

    if (purchasedPlan.toObject) {
        purchasedPlan = purchasedPlan.toObject();
    } else {
        logger.info(fn, 'Internal error, cannot convert to object');
        throw new Error('Cannot convert to object');
    }

    //check if order exists for sync_id
    const existingOrder = await OrderBackend.findOne({
        'metadata.kazoo.sync_id': sync_id,
        'metadata.kazoo.account_id': account_id
    }, {...options, ignoreNotFoundError: true});

    if (existingOrder)  {
        logger.warn(fn, 'already processed, ignore this event');
        return;
    }

    const rawUser = await UserBackend.findOne({
        _id: purchasedPlan.created && purchasedPlan.created.by
    }, options);

    const user = UserBackend.getBasicUserInfo(rawUser, options);

    //create new order
    const { users, devices, voicemails, conferences } = items;

    if (!users) {
        logger.warn(fn, 'no users');
        return;
    }

    const { basic, pro, standard } = users;

    let order = {
        ...purchasedPlan,
        metadata: {
            isChangeOrder: true,
            kazoo: {
                sync_id: sync_id,
                account_id: account_id
            },
            mutex: {
                sync_id: sync_id,
                account_id: account_id
            },
        },
        items: []
    };

    let ch = new CARTHANDLER(rawUser);

    let offer = 'avaya-office-sb-de';
    let salesmodel = 'avaya-office-sb-de-monthly';
    let essentialUserSalesModel = 'kazoo-essential-user';
    let standardUserSalesModel = 'kazoo-business-user';
    let powerUserSalesModel = 'kazoo-power-user';

    let flatRateAddonItem = findCartItemsBySalesModelAndTags(purchasedPlan, salesmodel, 'usage-flat-rate-addon');

    let flatRateAddonSalesModel = flatRateAddonItem && flatRateAddonItem[0] && flatRateAddonItem[0].salesModelItem && flatRateAddonItem[0].salesModelItem.identifier;

    let vmBoxAddonSalesmodel = 'kazoo-voicemail-box-addon';
    let deviceAddonSalesmodel = 'kazoo-device-addon';
    let conferenceAddonSalesmodel = 'kazoo-conference-bridge-addon';

    let existingEssentialUserItem, existingStandardUserItem, existingPowerUserItem, vmBoxAddonItem, deviceAddonItem, conferenceAddon;

    const tagToFind = 'uc-kazoo-offer';
    const essentialTag = KAZOO_USER_TYPE_ESSENTIAL, standardTag = KAZOO_USER_TYPE_BUSINESS, powerTag = KAZOO_USER_TYPE_POWER;
    for (let item of purchasedPlan.items) {
        const itemContext = findCartItemContext(item);
        const tags = itemContext && itemContext.tags;
        if (tags && tags.indexOf(tagToFind) > -1) {
            offer = item.offer.identifier;
            salesmodel = item.salesModel.identifier;
        }
        if (tags && tags.indexOf(essentialTag) > -1) {
            existingEssentialUserItem = item;
            essentialUserSalesModel = item.salesModelItem.identifier;
        }
        if (tags && tags.indexOf(standardTag) > -1) {
            existingStandardUserItem = item;
            standardUserSalesModel = item.salesModelItem.identifier;
        }
        if (tags && tags.indexOf(powerTag) > -1) {
            existingPowerUserItem = item;
            powerUserSalesModel = item.salesModelItem.identifier;
        }
        if (itemContext && itemContext.identifier == vmBoxAddonSalesmodel) {
            vmBoxAddonItem = item;
        }
        if (itemContext && itemContext.identifier == deviceAddonSalesmodel) {
            deviceAddonItem = item;
        }
        if (itemContext && itemContext.identifier == conferenceAddonSalesmodel) {
            conferenceAddon = item;
        }
    }

    const essentialUserQuantity = existingEssentialUserItem && existingEssentialUserItem.quantity || 0;
    const standardUserQuantity = existingStandardUserItem && existingStandardUserItem.quantity || 0;
    const powerUserQuantity = existingPowerUserItem && existingPowerUserItem.quantity || 0;

    let changeExists = false;

    order = ch.addItem(order, 1, offer, salesmodel, null, null, { ignoreMappingError: true });

    if (basic && basic.quantity != essentialUserQuantity)   {
        const quantityDiff = (basic.quantity || 0) - essentialUserQuantity;
        if (quantityDiff != 0)   {
            order = ch.addItem(order, quantityDiff, offer, salesmodel, essentialUserSalesModel, null, { ignoreMappingError: true });
            changeExists = true;
        }
    }

    if (standard && standard.quantity != standardUserQuantity)   {
        const quantityDiff = (standard.quantity || 0) - standardUserQuantity;
        if (quantityDiff != 0)   {
            order = ch.addItem(order, quantityDiff, offer, salesmodel, standardUserSalesModel, null, { ignoreMappingError: true });
            changeExists = true;
        }
    }

    if (pro && pro.quantity != powerUserQuantity)   {
        const quantityDiff = (pro.quantity || 0) - powerUserQuantity;
        if (quantityDiff != 0)   {
            order = ch.addItem(order, quantityDiff, offer, salesmodel, powerUserSalesModel, null, { ignoreMappingError: true });
            changeExists = true;
        }
    }

    const proQuantity = pro && pro.quantity;
    const businessQuantity = standard && standard.quantity;
    const essentialQuantity = basic && basic.quantity;

    //Voicemail
    const { vmbox } = voicemails;

    let numVMBoxes = vmbox && vmbox.quantity;

    if (numVMBoxes) {
        numVMBoxes = Math.max(numVMBoxes - 1, 0); //substract 1 for the default system vm box

        numVMBoxes = Math.max(numVMBoxes - proQuantity, 0); //subtract number of power users with vmBox included

        const existingQuantity = vmBoxAddonItem && vmBoxAddonItem.quantity || 0;

        const quantityDiff = numVMBoxes - existingQuantity;

        if (quantityDiff != 0) {
            order = ch.addItem(order, quantityDiff, offer, salesmodel, vmBoxAddonSalesmodel, null, { ignoreMappingError: true });
            changeExists = true;
        }
    }

    //Conferences
    const { conference } = conferences;

    let numConferences = conference && conference.quantity;

    if (numConferences) {
        numConferences = Math.max(numConferences - 1, 0); //substract 1 for the default system conference

        numConferences = Math.max(numConferences - proQuantity, 0); //subtract number of power users with conference included

        const existingQuantity = conferenceAddon && conferenceAddon.quantity || 0;

        const quantityDiff = numConferences - existingQuantity;

        if (quantityDiff != 0) {
            order = ch.addItem(order, quantityDiff, offer, salesmodel, conferenceAddonSalesmodel, null, { ignoreMappingError: true });
            changeExists = true;
        }
    }

    //Devices
    const { _all } = devices;

    let numDevices = _all && _all.quantity;

    if (numDevices) {
        numDevices = Math.max(numDevices - (proQuantity * 3), 0); //subtract number of power users with 3 devices included

        numDevices = Math.max(numDevices - (businessQuantity * 2), 0);  //subtract number of business users with 2 devices included

        numDevices = Math.max(numDevices - essentialQuantity, 0);   //subtract number of essentail users with 1 device included

        const existingQuantity = deviceAddonItem && deviceAddonItem.quantity || 0;

        const quantityDiff = numDevices - existingQuantity;

        if (quantityDiff != 0) {
            order = ch.addItem(order, quantityDiff, offer, salesmodel, deviceAddonSalesmodel, null, { ignoreMappingError: true });
            changeExists = true;
        }
    }

    if (changeExists)   {
        order = ch.addItem(order, 1, offer, salesmodel, flatRateAddonSalesModel, null, { ignoreMappingError: true });

        //Create new order for changes
        logger.info(fn, 'order:', order);

        await OrderBackend.createChangeOrder(user, order, {
            purchasedPlan,
            requestId: options.requestId,
            baseUrl: options.baseUrl,
            localizer: options.localizer,
            region: purchasedPlan.region || 'DE',
            mutex: {
                sync_id: sync_id,
                account_id: account_id
            }
        });
    } else {
        logger.info(fn, 'no change');
    }

    logger.info(fn, 'success');
};

module.exports = {
    processKazooBillingEvent,
};