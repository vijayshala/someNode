const _ = require('lodash');
const constants = require('../../../config/constants');
const {
    PURCHASED_PLAN_STATUS_SUCCESS,
    PURCHASED_PLAN_STATUS_FAILED,
    PURCHASED_PLAN_STATUS_CANCELED,
    PURCHASED_PLAN_STATUS_NEW
} = require('../../purchased-plan/purchased-plan.constants');
const {
    ORDER_STATUS_NEW,
    ORDER_STATUS_FAILED,
    ORDER_STATUS_CANCELED,
    ORDER_STATUS_SUCCESS
} = require('../../order/order.constants');
const CartSalesModelRules = require('../../modules/cart-salesmodel-rules');
const { UserBackend } = require('../../user/user.backend');
const { OfferBackend } = require('../../offer/offer.backend');
const { SalesModelBackend } = require('../../salesmodel/salesmodel.backend');

export const MapLegacyContractStatus = (status)  =>  {
    switch(status)  {
        case constants.CONTRACT_STATUS_TYPES.ENABLED:
            return PURCHASED_PLAN_STATUS_SUCCESS;
        case constants.CONTRACT_STATUS_TYPES.DISABLED:
        case constants.CONTRACT_STATUS_TYPES.DELETED:
            return PURCHASED_PLAN_STATUS_CANCELED;
        case constants.CONTRACT_STATUS_TYPES.IN_PROGRESS:
            return PURCHASED_PLAN_STATUS_NEW;
        default:
            return PURCHASED_PLAN_STATUS_FAILED;
    }
}

export const MapLegacyOrderStatus = (status)  =>  {
    switch(status)  {
        case constants.ORDER_STATUS_TYPES.COMPLETED:
            return ORDER_STATUS_SUCCESS;
        case constants.ORDER_STATUS_TYPES.IN_PROGRESS:
            return ORDER_STATUS_NEW;
        default:
            return ORDER_STATUS_FAILED;
    }
}

export const ConvertLegacyTaxDetails = (taxDetails)  =>  {
    let result = [];
    
    if (!taxDetails)    {
        return result;
    }

    let taxDetailsGrouped = {};
    for (let taxItem of taxDetails)  {
        const tax = _.round(taxItem.tax, 6);

        if (taxDetailsGrouped.hasOwnProperty(taxItem.tid))  {
            taxDetailsGrouped[taxItem.tid].tax += tax;
        } else {
            taxDetailsGrouped[taxItem.tid] = {
                tax: tax,
                name: taxItem.name
            };
        }
    }

    for (let tti in taxDetailsGrouped) {
        const tt = taxDetailsGrouped[tti];
        result.push({
          title: {
            text: tt.name,
          },
          tid: tti,
          amount: tt.tax,
        });
    }

    return result;
}

export const ConvertLegacyItems = async (order, spacesOrder)  =>  {
    const planOption = _.get(order, 'items[0].product.planOption');

    const contractLength = GetLegacyContractLength(planOption);
    const contractPeriod = GetLegacyContractPeriod(planOption);

    const user = await UserBackend.findOne({
        _id: _.get(order, 'created.by')
    });

    let ch = new CartSalesModelRules(user);
    
    const salesmodels = await SalesModelBackend.find({});
    const offers = await OfferBackend.find({});

    ch.initOffersMapping(offers);
    ch.initSalesModelsMapping(salesmodels);
    
    let cart = ch.initCart();

    let salesmodel = '';
    if (contractPeriod == 'year') {
        if (contractLength == 1)    {
            salesmodel = 'ip-office-legacy-yearly';
        } else if (contractLength == 3) {
            salesmodel = 'ip-office-legacy-3-years';
        } else if (contractLength == 5) {
            salesmodel = 'ip-office-legacy-5-years';
        }
    } else if (contractPeriod == 'month') {
        if (contractLength == 1)    {
            salesmodel = 'ip-office-legacy-monthly';
        }
    }

    const offeridentifier = 'ip-office-legacy';

    const ipOfficeBasicUsers = _.get(order, 'items[0].product.salesmodel.basicUser.users', []);
    const ipOfficeStandardUsers = _.get(order, 'items[0].product.salesmodel.standardUser.users', []);
    const ipOfficePowerUsers = _.get(order, 'items[0].product.salesmodel.powerUser.users', []);

    cart = ch.addItem(cart, 1, offeridentifier, salesmodel, null, null, {});
    
    if (ipOfficeBasicUsers.length > 0) {
        cart = ch.addItem(cart, ipOfficeBasicUsers.length, offeridentifier, salesmodel, 'ip-office-basic-user', null, {});

        let devices = {};
        for (let user of ipOfficeBasicUsers)    {
            if (devices[user.device])   {
                devices[user.device].count++;
            } else {
                devices[user.device] = {
                    count: 1,
                    sku: user.device
                }
            }
        }

        for (let di of Object.keys(devices)) {
            let device = devices[di];
            if (device.sku == 'ipoapplication') {
                continue;
            }
            cart = ch.addItem(cart, device.count, offeridentifier, salesmodel, 'ip-office-basic-user', device.sku, {});
        }
    }

    if (ipOfficeStandardUsers.length > 0) {
        cart = ch.addItem(cart, ipOfficeStandardUsers.length, offeridentifier, salesmodel, 'ip-office-standard-user', null, {});

        let devices = {};
        for (let user of ipOfficeStandardUsers)    {
            if (devices[user.device])   {
                devices[user.device].count++;
            } else {
                devices[user.device] = {
                    count: 1,
                    sku: user.device
                }
            }
        }

        for (let di of Object.keys(devices)) {
            let device = devices[di];
            if (device.sku == 'ipoapplication') {
                continue;
            }
            cart = ch.addItem(cart, device.count, offeridentifier, salesmodel, 'ip-office-standard-user', device.sku, {});
        }
    }

    if (ipOfficePowerUsers.length > 0) {
        cart = ch.addItem(cart, ipOfficePowerUsers.length, offeridentifier, salesmodel, 'ip-office-power-user', null, {});

        let devices = {};
        for (let user of ipOfficePowerUsers)    {
            if (devices[user.device])   {
                devices[user.device].count++;
            } else {
                devices[user.device] = {
                    count: 1,
                    sku: user.device
                }
            }
        }

        for (let di of Object.keys(devices)) {
            let device = devices[di];
            if (device.sku == 'ipoapplication') {
                continue;
            }
            cart = ch.addItem(cart, device.count, offeridentifier, salesmodel, 'ip-office-power-user', device.sku, {});
        }
    }

    const didType = _.get(order, 'items[0].product.salesmodel.system.metadata.number.type');
    const did = _.get(order, 'items[0].product.salesmodel.system.metadata.number.value');
    const tempdid = _.get(order, 'items[0].product.salesmodel.system.metadata.number.tempNumber');

    const e911Address = {
        address1: _.get(order, 'items[0].product.salesmodel.system.e911Information.address'),
        country: _.get(order, 'items[0].product.salesmodel.system.e911Information.country'),
        city: _.get(order, 'items[0].product.salesmodel.system.e911Information.city'),
        state: _.get(order, 'items[0].product.salesmodel.system.e911Information.stateProvince'),
        zip: _.get(order, 'items[0].product.salesmodel.system.e911Information.postalCode'),
    };

    if (didType == 'existingNumber')    {
        cart = ch.addItem(cart, 1, offeridentifier, salesmodel, 'did-existing', null, { helper:  { number: tempdid, e911Address: e911Address } });    
    } else if (didType == 'preselectedNumber')  {
        cart = ch.addItem(cart, 1, offeridentifier, salesmodel, 'did-tollfree', null, { helper:  { number: did, e911Address: e911Address } });    
    } else if (didType == 'localNumber')    {
        cart = ch.addItem(cart, 1, offeridentifier, salesmodel, 'did-local', null, { helper:  { number: did, e911Address: e911Address } });    
    }

    // const spacesBasicUsers = _.get(spacesOrder, 'items[0].product.salesmodel.users.basic.qty', 0);
    // const spacesPlusUsers = _.get(spacesOrder, 'items[0].product.salesmodel.users.team.qty', 0);
    // const spacesBusinessUsers = _.get(spacesOrder, 'items[0].product.salesmodel.users.business.qty', 0);

    // if (spacesBasicUsers > 0) {
    //     cart = ch.addItem(cart, spacesBasicUsers, offeridentifier, salesmodel, 'zang-spaces-basic-user', null, {});    
    // }

    // if (spacesPlusUsers > 0) {
    //     cart = ch.addItem(cart, spacesPlusUsers, offeridentifier, salesmodel, 'zang-spaces-plus-user', null, {});    
    // }

    // if (spacesBusinessUsers > 0) {
    //     cart = ch.addItem(cart, spacesBusinessUsers, offeridentifier, salesmodel, 'zang-spaces-business-user', null, {});    
    // }

    cart = ch.update(cart);

    cart.items[0].metadata = {
        tempPhoneNumber: _.get(order, 'items[0].product.salesmodel.system.metadata.number.tempNumber', null),
        phoneNumber: _.get(order, 'items[0].product.salesmodel.system.metadata.number.value', null)
    };

    return cart.items;
}

export const GetLegacyContractLength = (planOption)  => {
    let parts = planOption.split('-');
    parts = parts[1].split(':');
    return parts[0];
}

export const GetLegacyContractPeriod = (planOption) =>    {
    let parts = planOption.split('-');
    return parts[0];
}