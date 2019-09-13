const ns = '[migrate.migrate-contracts]';
const logger = require('applogger');
const _ = require('lodash');

const { nonBlockify } = require('../../modules/utils');
const ContractSchema = require('../../../schemas/ContractSchema');
const OrderSchema = require('../../../schemas/OrderSchema');
const PartnerOrderSchema = require('../../../schemas/PartnerOrderSchema');
const constants = require('../../../config/constants');
const moment = require('moment');

const { OrderBackend } = require('../../order/order.backend');
const { PurchasedPlanBackend } = require('../../purchased-plan/purchased-plan.backend');
const {
    PURCHASED_PLAN_STATUS_SUCCESS,
    PURCHASED_PLAN_STATUS_FAILED,
    PURCHASED_PLAN_STATUS_CANCELED,
    PURCHASED_PLAN_STATUS_NEW,
    PURCHASED_PLAN_SUBSCRIPTION_STATUS_NEW
} = require('../../purchased-plan/purchased-plan.constants');
const { generateSubscriptionIdentifier } = require('../../modules/cart-salesmodel-rules/utils');
const {
    MapLegacyContractStatus,
    ConvertLegacyTaxDetails,
    ConvertLegacyItems,
    GetLegacyContractLength,
    GetLegacyContractPeriod
} = require('./utils');

var total = 0;

export async function MigrateContracts(options) {
    const fn = `${ns}[migrateContracts]`;

    logger.info(fn, 'begin');

    const legacyContractsCursor = await ContractSchema.find({}).cursor().eachAsync(migrateContract);

    logger.info(fn, 'finish', total);
}

const migrateContract = async (legacyContract)  =>  {
    const fn = `${ns}[processContract]`;

    logger.info(fn, 'begin', legacyContract.orderId);

    const newOrder = await OrderBackend.findOne({
        'metadata.legacy': true,
        'metadata.legacyOrderId': legacyContract.orderId
    }, {
        ignoreNotFoundError: true
    });

    if (!newOrder)  {
        return;
    }

    logger.info(fn, 'found new order');

    const legacyOrder = await OrderSchema.findOne({
        _id: legacyContract.orderId
    });

    // const legacyPartnerOrder = await PartnerOrderSchema.findOne({
    //     order: legacyContract.orderId
    // });

    if (newOrder && legacyOrder)  {
        let purchasedPlanPayload = {
            ...newOrder,
            status: MapLegacyContractStatus(_.get(legacyContract, 'trdParty.status')),
            confirmationNumber: legacyContract.contractNumber,
            created: {
                on: _.get(legacyContract, 'created.on'),
                by: _.get(legacyContract, 'created.by')
            },
            metadata: {
                legacy: true,
                legacyContractId: legacyContract._id,
                legacyOrderId: legacyOrder._id
            },
            orderIds: [
                newOrder._id
            ]
        };

        purchasedPlanPayload.items[0].metadata = {
            sipDomain: _.get(legacyContract, 'trdParty.sipDomain', null),
            ipaclSID: _.get(legacyContract, 'trdParty.ipaclSID', null),
            applicationSID: _.get(legacyContract, 'trdParty.applicationSID', null),
            IPO_HostName: _.get(legacyContract, 'trdParty.IPO_HostName', null),
            IPO_IPAddress: _.get(legacyContract, 'trdParty.IPO_IPAddress', null)
        };

        delete purchasedPlanPayload._id;
        delete purchasedPlanPayload.id;
        delete purchasedPlanPayload.__v;

        for (let si in purchasedPlanPayload.subscriptions) {
            let subscription = purchasedPlanPayload.subscriptions[si];
            subscription.status = PURCHASED_PLAN_SUBSCRIPTION_STATUS_NEW;
            subscription.payment = {
                billingEngine: _.get(legacyContract, 'paymentMethod.gateway', null),
                next: moment().add(subscription.billingInterval, subscription.billingPeriod),
                on: _.get(legacyContract, 'paymentMethod.lastSuccessfulCharge', null),
                status: 'CHARGE_SUCCESS',
                metadata: {
                    subscriptionId: _.get(legacyContract, 'paymentMethod.subscriptionId', null)
                }
            };
        }
    
        const newPP = await PurchasedPlanBackend.findOneAndUpdate({
            'metadata.legacy': true,
            'metadata.legacyContractId': legacyContract._id
        },
        purchasedPlanPayload,
        {
            upsert: true,
            new: true
        });
    
        logger.info(fn, 'purchased plan created');
        total++;
    }
};

