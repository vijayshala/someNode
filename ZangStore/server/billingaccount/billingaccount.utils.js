import { PO_STATUS_APPROVED } from './billingaccount.constants';
import localizerUtil from '../../localizer/localizerUtil';

const ns  = '[billingaccount.utils]';

const logger = require('applogger');
const config = require('../../config');
const {
    PAYMENT_GATEWAYS
} = require('../billing/Constants');
const { isStripeGateway, LoadStripe } = require('../billing/integrations/stripe');
const sendgrid = require('../modules/email/sendgrid');
const globalconstants = require('../../config/constants');
const { OrderBackend } = require('../order/order.backend');
const { ORDER_STATUS_SUCCESS, ORDER_STATUS_NEW, ORDER_STATUS_PENDING_APPROVAL } = require('../order/order.constants');
const { nonBlockify } = require('../modules/utils');
const { VerifyAddress } = require('../billing/Tax');
const { VIOLATIONS, ErrorMessage, BadRequestError, ValidationError } = require('../modules/error');
const _ = require('lodash');

export async function PopulatePaymentMethods(billingAccount, options)    {
    const fn = `[${options && options.requestId}]${ns}[PopulatePaymentMethods]`;

    let creditCards = [];
    let IBANs = [];
    let po = {};

    const unblocked = nonBlockify(async (gateway) => {
        let gatewayObj = billingAccount.paymentGateways[gateway];
        if (!gatewayObj)    {
            return;
        }
        if (isStripeGateway(gateway)) {
            let stripe = LoadStripe(gateway);
            let cards = await stripe.GetCreditCards(gatewayObj.customerId);
            creditCards.concat(cards);
        } else if (gateway == PAYMENT_GATEWAYS.NATIVE) {
            po = gatewayObj.purchaseOrder;
        } else if (gateway == PAYMENT_GATEWAYS.GSMB)    {
            IBANs.push(gatewayObj.value);
        }
        delete billingAccount.paymentGateways[gateway];
    });

    if (billingAccount && billingAccount.paymentGateways) {
        for (let gateway of Object.keys(billingAccount.paymentGateways)) {
            await unblocked(gateway);
        }
        
        billingAccount.purchaseOrder = po;
        billingAccount.creditCards = creditCards;
        billingAccount.IBANs = IBANs;
    }

    //return billingAccount;
}

export function IsImmediatePaymentType(payment) {
    const fn = `${ns}[IsImmediatePaymentType]`;

    logger.info(fn, 'po status:', payment.metadata);

    let result = payment && 
        !(payment.billingEngine === PAYMENT_GATEWAYS.NATIVE && payment.metadata 
            && payment.metadata.purchaseOrder 
            && payment.metadata.purchaseOrder.status != PO_STATUS_APPROVED)

    return result;
}

export async function CheckPOLimit(billingAccount)  {
    const fn = `${ns}[CheckPOLimit]`;

    const approvedLimit = billingAccount && billingAccount.purchaseOrder && billingAccount.purchaseOrder.approvedLimit || 0;

    const operation = [
        {
            $match: {
                $and: [
                    {status: { $in: [ORDER_STATUS_SUCCESS, ORDER_STATUS_NEW, ORDER_STATUS_PENDING_APPROVAL]}},
                    {billingAccountId: billingAccount._id},
                    {'payment.billingEngine': PAYMENT_GATEWAYS.NATIVE},
                    {'payment.metadata.purchaseOrder': {
                        $exists: true
                        }
                    },
                    {'created.on': {
                        $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000))) //last 30 days
                        }   
                    }
                ]
            }
        },
        {
            $unwind: '$subscriptions'
        },
        {
            $group: {
                _id: null, 
                totalOnetime: {
                    $sum: '$onetime.total'
                },
                totalSubscription:  {
                    $sum: '$subscriptions.total'
                }
            },
        },
        {
            $project: {
                total: {
                    $sum: ['$totalOnetime', '$totalSubscription']
                }
            }
        }
    ];

    logger.info(fn, 'operation:', JSON.stringify(operation));

    const pendingSum = await OrderBackend.aggregate(operation, {
        allowDiskUse: true
    });

    logger.info(fn, 'sum:', pendingSum);

    const pendingAmount = pendingSum && pendingSum[0] && pendingSum[0].total || 0;

    logger.info(fn, 'pending amount:', pendingAmount, 'limit:', approvedLimit);

    return pendingAmount <= approvedLimit;
}

export async function SendPOEmailConfirmation(context)  {
    const fn = `${ns}[SendPOEmailConfirmation]`;

    logger.info(fn, 'begin');

    const { template } = require('../modules/email/templates/po-pending-for-user');
    const compiled = _.template(template, {
        imports: {
            L: context.localizer,
            LV: (val) =>
            (val && val.resource) ?
            context.localizer.get(val.resource) :
            ((val && val.text) ? val.text : ''),
        },
    });



    const summary = compiled({
        COMPANY_NAME: context.companyName,
        CUSTOMER_SERVICE_EMAIL: globalconstants.SUPPORT_EMAILS.CLOUD_SVC,
        details: { extraInfo: [] }, // FIXME
    });

    logger.info(fn, '[Summary]', summary);

    for (let user of context.toUsers) {
        const result = await sendgrid.sendPOEmail({
            requestId: context.requestId,
            language: _.get(user, 'user.account.languages[0].code', 'en-US'),
    
            toEmail: user.account.username,
    
            subject: 'Purchase Order Pending Approval',
    
            summary,
        });
    }

    logger.info(fn, 'email sent');
}

export async function SendPORejectedEmail(context)  {
    const fn = `${ns}[SendPORejectedEmail]`;

    logger.info(fn, 'begin');

    const { template } = require('../modules/email/templates/po-denied');
    const compiled = _.template(template, {
        imports: {
            L: context.localizer,
            LV: (val) =>
            (val && val.resource) ?
            context.localizer.get(val.resource) :
            ((val && val.text) ? val.text : ''),
        },
    });

    const summary = compiled({
        COMPANY_NAME: context.companyName,
        PO_LIMIT: context.approvedLimit,
        CUSTOMER_SERVICE_EMAIL: globalconstants.SUPPORT_EMAILS.CLOUD_SVC,
        details: { extraInfo: [] }, // FIXME
    });

    for (let user of context.toUsers) {
        const result = await sendgrid.sendPOEmail({
            requestId: context.requestId,
            language: _.get(user, 'user.account.languages[0].code', 'en-US'),
    
            toEmail: user.account.username,
    
            subject: 'Purchase Order Rejected',
    
            summary,
        });
    }

    logger.info(fn, 'email(s) sent');
}

export async function SendPOApprovedEmail(context)  {
    const fn = `${ns}[SendPOApprovedEmail]`;

    logger.info(fn, 'begin');

    const { template } = require('../modules/email/templates/po-approved');
    const compiled = _.template(template, {
        imports: {
            L: context.localizer,
            LV: (val) =>
            (val && val.resource) ?
            context.localizer.get(val.resource) :
            ((val && val.text) ? val.text : ''),
        },
    });

    const summary = compiled({
        PO_LIMIT: context.approvedLimit,
        COMPANY_NAME: context.companyName,
        CUSTOMER_SERVICE_EMAIL: globalconstants.SUPPORT_EMAILS.CLOUD_SVC,
        details: { extraInfo: [] }, // FIXME
    });

    for (let user of context.toUsers) {
        const result = await sendgrid.sendPOEmail({
            requestId: context.requestId,
            language: _.get(user, 'user.account.languages[0].code', 'en-US'),
    
            toEmail: user.account.username,
    
            subject: 'Purchase Order Approved',
    
            summary,
        });
    }

    logger.info(fn, 'email(s) sent');
}

export async function SendPOPendingEmail(context)  {
    const fn = `${ns}[SendPOPendingEmail]`;

    logger.info(fn, 'begin');

    const { template } = require('../modules/email/templates/po-pending-for-cs');
    const compiled = _.template(template, {
        imports: {
            L: context.localizer,
            LV: (val) =>
            (val && val.resource) ?
            context.localizer.get(val.resource) :
            ((val && val.text) ? val.text : ''),
        },
    });

    const summary = compiled({
        po_approval_url: `${context.baseUrl}/purchase-orders`,
        CUSTOMER_SERVICE_EMAIL: globalconstants.SUPPORT_EMAILS.CLOUD_SVC,
        details: { extraInfo: [] }, // FIXME
    });

    const result = await sendgrid.sendPOEmail({
        requestId: context.requestId,
        language: 'en-US',

        toEmail: config.environment == 'production' ? globalconstants.SUPPORT_EMAILS.CLOUD_SVC :  config.currentDeveloperEmails,

        subject: 'Purchase Order Pending Approval',

        summary,
    });

    logger.info(fn, 'email sent');
}

export async function validatePO(payload, options)   {
    const fn = `[${options && options.requestId}]${ns}[validatePO]`;
    let errors = [];
    logger.info(fn, 'PAYLOAD: ', payload);
    if (!payload.billingAddress || !payload.billingAddress.address1) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
            text: 'Billing address is required',
            resource: ['VIOLATION.FIELD_IS_EMPTY2', 'BILLING_INFORMATION', 'ADDRESS'],
        }, 'billingAddress.address1'));
    }
    if (!payload.billingAddress || !payload.billingAddress.city) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
            text: 'Billing address (city) is required',
            resource: ['VIOLATION.FIELD_IS_EMPTY2', 'BILLING_INFORMATION', 'CITY'],
        }, 'billingAddress.city'));
    }
/*     if (!payload.billingAddress || !payload.billingAddress.state) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
            text: 'Billing address (state/province) is required',
            resource: ['VIOLATION.FIELD_IS_EMPTY2', 'BILLING_INFORMATION', 'STATE_PROVINCE'],
        }, 'billingAddress.state'));
    } */
    if (!payload.billingAddress || !payload.billingAddress.zip) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
            text: 'Billing address (zip/postal) is required',
            resource: ['VIOLATION.FIELD_IS_EMPTY2', 'BILLING_INFORMATION', 'ZIP_POSTAL_CODE'],
        }, 'billingAddress.zip'));
    }
    if (!payload.billingAddress || !payload.billingAddress.country) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
            text: 'Billing address (country) is required',
            resource: ['VIOLATION.FIELD_IS_EMPTY2', 'BILLING_INFORMATION', 'COUNTRY'],
        }, 'billingAddress.country'));
    }
    if (!payload.company || !payload.company.name) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
            text: 'Company name is required',
            resource: ['VIOLATION.FIELD_IS_EMPTY2', 'COMPANY', 'NAME'],
        }, 'company.name'));
    }
    if (!payload.company || !_.isBoolean(payload.company.isIncorporated)) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
            text: 'Company incorporation is required',
            resource: ['VIOLATION.FIELD_IS_EMPTY2', 'COMPANY', 'IS_INCORPORATED'],
        }, 'company.isIncorporated'));
    }
    if (!payload.contact || !payload.contact.firstName) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
            text: 'Contact first name is required',
            resource: ['VIOLATION.FIELD_IS_EMPTY2', 'CONTACT', 'FIRST_NAME'],
        }, 'contact.firstName'));
    }
    if (!payload.contact || !payload.contact.lastName) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
            text: 'Contact last name is required',
            resource: ['VIOLATION.FIELD_IS_EMPTY2', 'CONTACT', 'LAST_NAME'],
        }, 'contact.lastName'));
    }
    if (!payload.contact || !payload.contact.phone) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
            text: 'Contact phone is required',
            resource: ['VIOLATION.FIELD_IS_EMPTY2', 'CONTACT', 'PHONE'],
        }, 'contact.phone'));
    }
    if (!payload.contact || !payload.contact.email) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
            text: 'Contact email is required',
            resource: ['VIOLATION.FIELD_IS_EMPTY2', 'CONTACT', 'EMAIL'],
        }, 'contact.email'));
    }

    try{
        const verifiedAddress = await VerifyAddress(options, payload.billingAddress, payload.billingAddress.countryISO); // fix me
        logger.info(fn, 'Purchase ORDER ok:', verifiedAddress);
    } catch(e)  {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
            text: 'Billing address is invalid',
            resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'BILLING_INFORMATION', 'ADDRESS'],
        }, 'billingAddress.address1'));

        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
            text: 'Billing address is invalid',
            resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'BILLING_INFORMATION', 'CITY'],
        }, 'billingAddress.city'));

        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
            text: 'Billing address is invalid',
            resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'BILLING_INFORMATION', 'STATE_PROVINCE'],
        }, 'billingAddress.state'));

        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
            text: 'Billing address is invalid',
            resource: ['VIOLATION.FIELD_VALUE_INVALID2', 'BILLING_INFORMATION', 'ZIP_POSTAL_CODE'],
        }, 'billingAddress.zip'));
    }
    
    return errors;
}

export async function ProcessRecurringPO(purchasedPlan, options) {
    const fn = `[${options && options.requestId}]${ns}[ProcessRecurringPO]`;

    const { BillingAccountBackend } = require('./billingaccount.backend');
    const moment = require('moment');
    const TransactionBackend = require('../transaction/transaction.backend');;
    const { STATUS, REF_OBJECT_TYPE } = require('../transaction/transaction.constants');
    const { CalculateTax, CommitTransaction, PrepareItems } = require('../billing/Tax');
    const { PAYMENT_GATEWAYS, TAX_GATEWAYS } = require('../billing/Constants');
    const { PurchasedPlanBackend } = require('../purchased-plan/purchased-plan.backend');
    const globalconstants = require('../../config/constants');
    const { ASEventEmitter } = require('../modules/event');
    const { ASEVENT_PURCHASED_PLAN_INTERVAL } = require('../modules/event/constants');

    logger.info(fn, 'begin');

    const billingAccount = await BillingAccountBackend.findOneById(purchasedPlan.billingAccountId, options);

    //const users = await BillingAccountBackend.getMembers(billingAccount, options);

    const taxableItems = PrepareItems(purchasedPlan, options);

    logger.info(fn, 'items prepared:', taxableItems);

    let updatedpp = purchasedPlan;

    for (let si in purchasedPlan.subscriptions) {
        const subscription = purchasedPlan.subscriptions[si];
        logger.info(fn, 'subscription:', subscription);

        if (subscription.payment && subscription.payment.next && moment().isSameOrAfter(subscription.payment.next))   {
            const nextPaymentDate = moment(subscription.payment.next).add(subscription.billingInterval, subscription.billingPeriod);

            logger.info(fn, 'next payment:', nextPaymentDate);

            const billingAddress = {
                street: purchasedPlan.billingAddress.address1,
                city: purchasedPlan.billingAddress.city,
                state: purchasedPlan.billingAddress.state,
                zip: purchasedPlan.billingAddress.zip,
                country: purchasedPlan.billingAddress.country
            };
            const shippingAddress = {
                street: purchasedPlan.shippingAddress.address1,
                city: purchasedPlan.shippingAddress.city,
                state: purchasedPlan.shippingAddress.state,
                zip: purchasedPlan.shippingAddress.zip,
                country: purchasedPlan.shippingAddress.country
            };
            const company = {
                isIncorporated: purchasedPlan.company.isIncorporated
            };

            const recurringTax = await CalculateTax(options, billingAddress, shippingAddress, taxableItems[subscription._id], company.isIncorporated, `${subscription._id}_purchasedplan.subscriptions_${moment(nextPaymentDate).unix()}`);
            logger.info(fn, `recurring tax "${subscription._id}" result`, JSON.stringify(recurringTax));

            await CommitTransaction(options, `${subscription._id}_purchasedplan.subscriptions_${moment(nextPaymentDate).unix()}`);

            // update taxItems
            let taxDetails = [];
            for (let tti in recurringTax.taxTypes) {
                const tt = recurringTax.taxTypes[tti];
                taxDetails.push({
                    title: {
                        text: tt.name,
                    },
                    tid: tti,
                    amount: tt.tax,
                });
            }
            
            const currentTimestamp = new Date();
            const newTransaction = {
                transactionInit: currentTimestamp,
                transactionCompleteOn: currentTimestamp,
                status: STATUS.SUCCESS,
                refObject: subscription._id,
                refObjectType: REF_OBJECT_TYPE.SUBSCRIPTION,
                payment: {
                    attempts: 1,
                    lastAttempt: currentTimestamp,
                    billingEngine: PAYMENT_GATEWAYS.NATIVE,
                    metadata: {
                        purchaseOrder: billingAccount.purchaseOrder,
                        periodStart: moment(subscription.payment.next).unix(),
                        periodEnd: moment(nextPaymentDate).unix()
                    }
                },
                tax: {
                    taxDetails: taxDetails,
                    amount: recurringTax.tax,
                    taxEngine: TAX_GATEWAYS.AVALARA,
                    metadata: {
                        documentCode: recurringTax.taxId,
                        commit: true
                    }
                },
                currency: purchasedPlan.currency,
                amount: subscription.total,
                created: {
                    on: currentTimestamp
                }
            };

            await TransactionBackend.create(newTransaction);

            let updates = {};
            updates[`subscriptions.${si}.payment.next`] = nextPaymentDate;
            updates[`subscriptions.${si}.payment.on`] = new Date();
            updates[`subscriptions.${si}.taxDetails`] = taxDetails;

            updatedpp = await PurchasedPlanBackend.findOneAndUpdate({
                _id: purchasedPlan._id
            }, {
                $set: updates
            }, {...options, new: true});

            //Trigger event to extend any licensing
            const context = {
                ...options,
                purchasedPlan: updatedpp
            };
            const eventResult = await ASEventEmitter.emitPromise(ASEVENT_PURCHASED_PLAN_INTERVAL, context);
            if (eventResult && eventResult instanceof Error) {
                logger.error(fn, 'Error continuing provisioning event', eventResult);
            }

            logger.info(fn, 'updates:', updatedpp);
        }
    }

    const localizer = localizerUtil('en-US');

    const currencyFormatter = require('currency-formatter');
    const { template } = require('../modules/email/templates/order-confirmation-subscription');
    const { generateSubscriptionIdentifier } = require('../modules/cart-salesmodel-rules/utils');

    try{
        const compiled = _.template(template, {
            imports: {
            currency: (val) => currencyFormatter.format(val, { code: purchasedPlan.currency }),
            generateSubscriptionIdentifier: generateSubscriptionIdentifier,
            moment: moment,
            L: localizer,
            LV: (val) =>
                (val && val.resource) ?
                localizer.get(val.resource) :
                ((val && val.text) ? val.text : ''),
            },
        });

        let product = purchasedPlan.items && purchasedPlan.items[0] && purchasedPlan.items[0].title && purchasedPlan.items[0].title;
        let productName = (product && (product.resource && localizer.get(product.resource)) || product.text) || '';

        const summary = compiled({
            order: updatedpp,
            hasProvisioning: false,
            isInvoice: true,
            withExtraInfo: false, // FIXME
            details: { extraInfo: [] }, // FIXME
            supportEmail: globalconstants.SUPPORT_EMAILS.CLOUD_SUPPORT, // FIXME
        });

        logger.info(fn, 'template done', summary);

        const result = await sendgrid.sendOrderEmail({
            requestId: options.requestId,
            language: 'en-US',

            firstName: purchasedPlan.contact.firstName,
            email: config.purchaseOrderUtilityEmails || globalconstants.SUPPORT_EMAILS.CLOUD_SVC,

            productName,
            confirmationType: 'Subscriptions',
            confirmationNumber: purchasedPlan.confirmationNumber,

            baseUrl: options.baseUrl,

            additionalBcc: [],
            
            noBCC: true,

            summary,
        });
    } catch(e)  {
        logger.error(fn, 'error:', e);
    }
}

export function HasIBAN(billingAccount, IBAN)   {
    const fn = `${ns}[HasIBAN]`;

    const IBANs = billingAccount && billingAccount.GSMB && billingAccount.GSMB.IBAN;

    if (IBANs && IBANs.length > 0)  {
        for (let i of IBANs)    {
            if (i.value == IBAN)    {
                return true;
            }
        }
    }

    return false;
}

export async function CancelBilling(purchasedPlan, options)   {
    const fn = `[${options.requestId}]${ns}[CancelBilling]`;
    const { PurchasedPlanBackend } = require('../purchased-plan/purchased-plan.backend');

    for (let si in purchasedPlan.subscriptions) {
        const subscription = purchasedPlan.subscriptions[si];

        const billingEngine = subscription.payment && subscription.payment.billingEngine;

        if (billingEngine === PAYMENT_GATEWAYS.STRIPE)  {
            const { CancelSubscription } = require('../billing/Subscription');
            const { CHARGE_STATUS } = require('../billing/Constants');
            const subscriptionId = subscription.payment && subscription.payment.metadata && subscription.payment.metadata.subscriptionId;
            const isCanceled = subscription.payment && subscription.payment.status === CHARGE_STATUS.CANCELED;

            if (subscriptionId && !isCanceled)   {
                await CancelSubscription(options, subscriptionId);

                let update = {};
                update[`subscriptions.${si}.payment.status`] = CHARGE_STATUS.CANCELED;

                await PurchasedPlanBackend.findOneAndUpdate({
                    _id: purchasedPlan
                }, {
                    $set: update
                }, { new: true});

                logger.info(fn, 'stripe subscription canceled');
            } else {
                logger.warn(fn, 'subscription already canceled or no subscriptionID');
            }

        }
    }

    logger.info(fn, 'all billing canceled');
}