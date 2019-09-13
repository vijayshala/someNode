const ns = '[migrate.migrate-orders]';
const logger = require('applogger');
const moment = require('moment');
const _ = require('lodash');

const { nonBlockify } = require('../../modules/utils');
const ContractSchema = require('../../../schemas/ContractSchema');
const OrderSchema = require('../../../schemas/OrderSchema');
const PartnerOrderSchema = require('../../../schemas/PartnerOrderSchema');
const constants = require('../../../config/constants');

const { OrderBackend } = require('../../order/order.backend');
const { PurchasedPlanBackend } = require('../../purchased-plan/purchased-plan.backend');

const { generateSubscriptionIdentifier } = require('../../modules/cart-salesmodel-rules/utils');
const {
    MapLegacyOrderStatus,
    MapLegacyContractStatus,
    ConvertLegacyTaxDetails,
    ConvertLegacyItems,
    GetLegacyContractLength,
    GetLegacyContractPeriod
} = require('./utils');

var total = 0;

export async function MigrateOrders(options)    {
    const fn = `${ns}[migrateOrders]`;

    logger.info(fn, 'begin');

    const legacyOrdersCursor = await OrderSchema.find({
        status: 'COMPLETED'
    }).cursor().eachAsync(migrateOrder);

    logger.info(fn, 'finish', total);
}

const migrateOrder = async (legacyOrder)  =>  {
    const fn = `${ns}[processOrder]`;

    logger.info(fn, 'begin', legacyOrder._id);

    if (legacyOrder)  {
        const planOption = _.get(legacyOrder, 'items[0].product.planOption');
        const slug = _.get(legacyOrder, 'items[0].product.slug');

        if (slug == 'ip-office')  {
            const day = new Date(_.get(legacyOrder, 'created.on'));
            const dayFrom = moment(day).subtract(30, 'm');
            const dayTo = moment(day).add(30, 'm');

            // const legacySpacesOrder = await OrderSchema.findOne({
            //     'created.by': _.get(legacyOrder, 'created.by'),
            //     'items.0.product.slug': 'zang-spaces',
            //     'billingAccountId': legacyOrder.billingAccountId,
            //     'created.on': {
            //         $lte: dayTo,
            //         $gte: dayFrom
            //     }
            // });

            const legacyPartnerOrder = await PartnerOrderSchema.findOne({
                order: legacyOrder._id
            });

            //logger.info(fn, 'legacyPartnerOrder', legacyPartnerOrder && legacyPartnerOrder._id);

            const orderPayload = {
                billingAccountId: legacyOrder.billingAccountId,
                notes: legacyOrder.notes,
                ...(legacyPartnerOrder ? { partner: legacyPartnerOrder.partner, partnerAgent: legacyPartnerOrder.agent } : {}),
                status: MapLegacyOrderStatus(legacyOrder.status),
                confirmationNumber: legacyOrder.confirmationNumber,
                created: {
                    on: _.get(legacyOrder, 'created.on'),
                    by: _.get(legacyOrder, 'created.by')
                },
                payment: {
                    billingEngine: _.get(legacyOrder, 'paymentMethod.gateway'),
                    metadata: {
                        customerId: _.get(legacyOrder, 'paymentMethod.customerId'),
                        sourceId: _.get(legacyOrder, 'paymentMethod.paymentSourceId'),
                        paymentType: _.get(legacyOrder, 'paymentMethod.paymentSourceType'),
                        paymentId: _.get(legacyOrder, 'paymentMethod.paymentId'),
                        creditCard: {
                            brand: _.get(legacyOrder, 'paymentMethod.creditCardMetadata.brand'),
                            last4: _.get(legacyOrder, 'paymentMethod.creditCardMetadata.last4'),
                            expMonth: _.get(legacyOrder, 'paymentMethod.creditCardMetadata.expMonth'),
                            expYear: _.get(legacyOrder, 'paymentMethod.creditCardMetadata.expYear'),
                            holderName: _.get(legacyOrder, 'paymentMethod.creditCardMetadata.holderName'),
                        },
                    }
                },
                legalDocumentConsents: [
                    {
                        identifier: 'general-term-conditions',
                        consent: true
                    },
                    {
                        identifier: 'ipoffice-term-conditions',
                        consent: true
                    }
                ],
                subscriptions: [
                    {
                        identifier: generateSubscriptionIdentifier({
                            billingInterval: 1,
                            billingPeriod: 'month',
                            contractLength: GetLegacyContractLength(planOption),
                            contractPeriod: GetLegacyContractPeriod(planOption)
                        }),
                        billingPeriod: 'month',
                        billingInterval: 1,
                        contractPeriod: GetLegacyContractPeriod(planOption),
                        contractLength: GetLegacyContractLength(planOption),
                        subTotal: _.round(_.get(legacyOrder, 'items[0].product.price.intervalBeforeTax', 0) / 100, 4),
                        discount: _.round(_.get(legacyOrder, 'items[0].product.price.intervalDiscount', 0) / 100, 4),
                        tax: _.round(_.get(legacyOrder, 'items[0].product.price.intervalTax', 0) / 100, 4),
                        shipping: 0,
                        total: _.round(_.get(legacyOrder, 'items[0].product.price.intervalAfterTax', 0) / 100, 4),
                        taxDetails: ConvertLegacyTaxDetails(_.get(legacyOrder, 'items[0].product.price.intervalTaxDetail'))
                    }
                ],
                onetime: {
                    subTotal: _.round(_.get(legacyOrder, 'items[0].product.price.oneTimeBeforeTax', 0) / 100, 4),
                    discount: _.round(_.get(legacyOrder, 'items[0].product.price.oneTimeDiscount', 0) / 100, 4),
                    tax: _.round(_.get(legacyOrder, 'items[0].product.price.oneTimeTax', 0) / 100, 4),
                    shipping: 0,
                    total: _.round(_.get(legacyOrder, 'items[0].product.price.oneTimeAfterTax', 0) / 100, 4),
                    taxDetails: ConvertLegacyTaxDetails(_.get(legacyOrder, 'items[0].product.price.oneTimeTaxDetail'))
                },
                items: await ConvertLegacyItems(legacyOrder), //await ConvertLegacyItems(legacyOrder, legacySpacesOrder),
                currency: 'USD',
                shippingAddress: {
                    zip: _.get(legacyOrder, 'shippingInformation.shippingPostalCode'),
                    state: _.get(legacyOrder, 'shippingInformation.shippingStateProvince'),
                    city: _.get(legacyOrder, 'shippingInformation.shippingCity'),
                    country: _.get(legacyOrder, 'shippingInformation.shippingCountry'),
                    address1: _.get(legacyOrder, 'shippingInformation.shippingAddress')
                },
                billingAddress: {
                    zip: _.get(legacyOrder, 'billingInformation.billingPostalCode'),
                    state: _.get(legacyOrder, 'billingInformation.billingStateProvince'),
                    city: _.get(legacyOrder, 'billingInformation.billingCity'),
                    country: _.get(legacyOrder, 'billingInformation.billingCountry'),
                    address1: _.get(legacyOrder, 'billingInformation.billingAddress')
                },
                company: {
                    isIncorporated: false,
                    industry: _.get(legacyOrder, 'accountInformation.industryType'),
                    name: _.get(legacyOrder, 'accountInformation.companyName'),
                    domain: _.get(legacyOrder, 'accountInformation.companyDomain'),
                    nid: _.get(legacyOrder, 'accountInformation.companyId')
                },
                contact: {
                    email: _.get(legacyOrder, 'accountInformation.emailAddress'),
                    phone: _.get(legacyOrder, 'accountInformation.phoneNumber'),
                    lastName: _.get(legacyOrder, 'accountInformation.lastName'),
                    firstName: _.get(legacyOrder, 'accountInformation.firstName'),
                    allowToContact: _.get(legacyOrder, 'accountInformation.allowToContact')
                },
                metadata: {
                    legacy: true,
                    legacyOrderId: legacyOrder._id
                }
            };

            //logger.info(fn, 'order payload:', orderPayload);
        
            const newOrder = await OrderBackend.findOneAndUpdate({
                'metadata.legacy': true,
                'metadata.legacyOrderId': legacyOrder._id
            },
            orderPayload,
            {
                upsert: true,
                new: true
            });
        
            logger.info(fn, 'order created', newOrder._id);
            total++;
        }
    }
}