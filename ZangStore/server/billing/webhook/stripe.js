'use strict';

const ns = '[billing][Webhook]';

import logger from 'applogger';
import config from '../../../config';
import * as constants from '../Constants';
import { BillingError, ERROR_CODES } from '../Error';
import global_constants from '../../../config/constants';
import { nonBlockify } from '../../modules/utils';

import Utils from '../../../common/Utils';

import { CalculateTax, CommitTransaction } from '../Tax';
import { CreateTaxPlan, DeletePlan } from '../Plan';
import { UpdateSubscriptionItem, CreateSubscriptionItem } from '../Subscription';
import { resolveUsersByGatewayId } from '../PaymentMethod';

import localizerUtil from '../../../localizer/localizerUtil';

import UserSchema from '../../../schemas/UserSchema';
import { PurchasedPlanBackend } from '../../purchased-plan/purchased-plan.backend';
import TransactionBackend from '../../transaction/transaction.backend';
import { 
    STATUS as TransactionStatus ,
    REF_OBJECT_TYPE as TransactionRefType
} from '../../transaction/transaction.constants';
import {
    PURCHASED_PLAN_TABLE_NAME,
    PURCHASED_PLAN_STATUS_SUCCESS, 
    PURCHASED_PLAN_SUBSCRIPTION_STATUS_ACTIVE
  } from '../../purchased-plan/purchased-plan.constants';

import sendgrid from '../../modules/email/sendgrid';
import emailTemplater from '../../modules/email/templater';
import moment from 'moment';
import _ from 'lodash';

const { ASEventEmitter } = require('../../modules/event');
const { ASEVENT_PURCHASED_PLAN_INTERVAL } = require('../../modules/event/constants');
const {
    isStripeGateway,
    LoadStripe
} = require('../integrations/stripe');

/**
 * Process webhook requests from payment gateway.
 * @param {*} req 
 * @param {*} res 
 * @param {*} cb 
 */
export async function processWebhook(req, res, gateway)    {
    const func = `[${req.requestId}]${ns}[processWebhook]`;

    try {
        let event;
        let stripe = LoadStripe(gateway);
        event = stripe.ParseStripeEvent(req, res, config.environment == 'development' ? false : true);
        
        if (!event)  {
            throw new BillingError('Unable to parse stripe event.', ERROR_CODES.INVALID_WEBHOOK_EVENT);
        }

        logger.info(func, 'stripe event', event);

        const eventData = event.data.object;

        if (!eventData) {
            throw new BillingError('Unable to find event data.', ERROR_CODES.INVALID_WEBHOOK_EVENT);
        }

        logger.info(func, 'event type', event.type);

        switch (event.type) {
            case constants.STRIPE_EVENTS.CUSTOMER_SUBSCRIPTION_DELETED: {
                await SubscriptionDeleted(req, eventData, event, gateway);
                break;
            }
            case constants.STRIPE_EVENTS.CUSTOMER_SUBSCRIPTION_TRIAL_ENDING:    {
                await TrialEndingSoon(req, eventData, event, gateway);
                break;
            }
            case constants.STRIPE_EVENTS.INVOICE_UPCOMING:  {
                await InvoiceUpcoming(req, eventData, event, gateway);
                break;
            }
            case constants.STRIPE_EVENTS.INVOICE_PAYMENT_SUCCEEDED: {
                await PaymentSuccess(req, eventData, event, gateway);
                break;
            }
            case constants.STRIPE_EVENTS.INVOICE_PAYMENT_FAILED:    {
                await PaymentFailed(req, eventData, event, gateway);
                break;
            }                    
        }
        res.status(200).json({
            received: true,
            ignored: false
        });
    } catch(e)  {
        logger.error(func, 'error', e);
        
        if (e.code == ERROR_CODES.USER_NOT_FOUND)   {
            return res.status(200).json({
                received: true,
                ignored: true
            });
        } else if (e.code == ERROR_CODES.CONTRACT_NOT_FOUND)    {
            return res.status(200).json({
                received: true,
                ignored: true
            });
        }

        res.status(400).json({
            error: JSON.stringify(e)
        }); 
    }
}

async function SubscriptionDeleted(req, eventData, event, gateway)    {
    const func = `[${req.requestId}]${ns}[SubscriptionDeleted]`;

    logger.info(func, 'begin');

    //TODO: SUSPEND account if not already suspended. This event will be sent if subscription is manually deleted or if payment fails 3 times
    logger.info(func, 'subscription delete completed');
}

async function PaymentFailed(req, eventData, event, gateway) {
    const func = `[${req.requestId}]${ns}[PaymentFailed]`;

    logger.info(func, 'begin');

    if (eventData.object != constants.STRIPE_OBJECTS.invoice.toLowerCase())   {
        throw new BillingError('Stripe webhook event object type is incorrect.', ERROR_CODES.INVALID_WEBHOOK_EVENT);
    }

    const subscriptionId = eventData.subscription;

    const [ users, contractSubscription ] = await Promise.all([
        getBillingAccountUsers(req, eventData, gateway),
        resolveContractSubscription(req, subscriptionId, gateway)
    ]);

    if (!contractSubscription)  {
        throw new BillingError('Contract not found.', ERROR_CODES.CONTRACT_NOT_FOUND);
    }

    const invoiceId = eventData.id;
    const attemptNumber = eventData.attempted ? eventData.attempt_count : 0;

    let transaction = await TransactionBackend.findByBillingEngineIdentifier(invoiceId, {
        requestId: req.requestId,
        billingEngine: gateway
    });

    if (!transaction)   {
        transaction = await TransactionBackend.findOneAndUpdate({
            'payment.billingEngine': gateway,
            'payment.metadata.subscriptionId': subscriptionId,
            'payment.metadata.periodStart': eventData.period_start,
            'payment.metadata.periodEnd': eventData.period_end,
        }, {
            'payment.metadata.invoiceId': invoiceId
        },{
            new: true
        });
    }

    if (transaction)    {
        if (transaction.status == TransactionStatus.SUCCESS)    {
            return  //Transaction already succeeded, discard payment_failed event
        }

        let updates = {};
        updates[`subscriptions.${contractSubscription.index}.payment.status`] = constants.CHARGE_STATUS.CHARGE_FAILED;

        const [ updatedTransaction, updatedContractSubscription ] = await Promise.all([
            TransactionBackend.findOneAndUpdate({
                _id: transaction._id
            },{
                status: TransactionStatus.FAIL,
                'payment.attempts': attemptNumber,
                'payment.lastAttempt': new Date(),
                'payment.billingEngine': constants.PAYMENT_GATEWAYS.STRIPE,
                'payment.metadata.customerId': eventData.customer,
                'payment.metadata.subscriptionId': subscriptionId,
                'payment.metadata.invoiceId': invoiceId,
                'payment.metadata.periodStart': eventData.period_start,
                'payment.metadata.periodEnd': eventData.period_end,
                'payment.nextAttempt': eventData.next_payment_attempt,
            }),
            PurchasedPlanBackend.findOneAndUpdate({
                _id: contractSubscription.contract._id
            },{
                $set: updates
            })
        ]);

        logger.info(func, 'updated failed contract');
    } else  {
        const currentTimestamp = new Date();
        const newTransaction = {
            transactionInit: currentTimestamp,
            status: TransactionStatus.FAIL,
            refObject: contractSubscription.subscription._id,
            refObjectType: TransactionRefType.SUBSCRIPTION,
            payment: {
                attempts: attemptNumber,
                lastAttempt: currentTimestamp,
                nextAttempt: eventData.next_payment_attempt,
                billingEngine: constants.PAYMENT_GATEWAYS.STRIPE,
                metadata: {
                    customerId: eventData.customer,
                    subscriptionId: subscriptionId,
                    invoiceId: invoiceId,
                    periodStart: eventData.period_start,
                    periodEnd: eventData.period_end
                }
            },
            currency: eventData.currency.toUpperCase(),
            amount: _.round(eventData.total / 100, 2),
            created: {
                on: currentTimestamp
            }
        };

        let updates = {};
        updates[`subscriptions.${contractSubscription.index}.payment.status`] = constants.CHARGE_STATUS.CHARGE_FAILED;

        const [ createdTransaction, updatedContractSubscription ] = await Promise.all([
            TransactionBackend.create(newTransaction),
            PurchasedPlanBackend.findOneAndUpdate({
                _id: contractSubscription.contract._id
            },{
                $set: updates
            })
        ]);
    }

    let templateId = emailTemplater.billingEngineInvoicePaymentFailedEmail.reminderTemplateId['en-US'];

    for (let user of users) {
        const userLanguage = (user.account.languages && user.account.languages.length > 0 && user.account.languages[0].code) || 'en-US';

        req.localizer = localizerUtil(userLanguage);

        if (attemptNumber == 1 || attemptNumber == 0) {
            templateId = emailTemplater.billingEngineInvoicePaymentFailedEmail.reminderTemplateId[userLanguage] || emailTemplater.billingEngineInvoicePaymentFailedEmail.finalTemplateId['en-US'];
        } else if (attemptNumber == 2)  {
            templateId = emailTemplater.billingEngineInvoicePaymentFailedEmail.finalReminderTemplateId[userLanguage] || emailTemplater.billingEngineInvoicePaymentFailedEmail.finalTemplateId['en-US'];
        } else if (attemptNumber == 3)  {
            templateId = emailTemplater.billingEngineInvoicePaymentFailedEmail.finalTemplateId[userLanguage] || emailTemplater.billingEngineInvoicePaymentFailedEmail.finalTemplateId['en-US'];
        }

        if (!templateId)    {
            throw new BillingError('Delinquency template not found.', ERROR_CODES.EMAIL_TEMPLATE_NOT_FOUND);
        }

        await sendgrid.sendBillingEngineInvoicePaymentFailedEmail({
            requestId: req.requestId,
            templateId: templateId,
            toEmail: user.account.username,
            clientName: user.account.name.givenname + ' ' + user.account.name.familyname,
            makePayment: `${Utils.getBaseURL(req)}/billingaccount/creditcard`,
            customerSuccessEmail: global_constants.SUPPORT_EMAILS.CLOUD_CS // fix me
        });

        logger.info(func, 'delinquency email sent');
    }
}

async function PaymentSuccess(req, eventData, event, gateway)    {
    const func = `[${req.requestId}]${ns}[PaymentSuccess]`;

    logger.info(func, 'begin');

    if (eventData.object != constants.STRIPE_OBJECTS.invoice.toLowerCase())   {
        throw new BillingError('Stripe webhook event object type is incorrect.', ERROR_CODES.INVALID_WEBHOOK_EVENT);
    }

    const subscriptionId = eventData.subscription;
    const invoiceId = eventData.id;

    const [ users, contractSubscription ] = await Promise.all([
        getBillingAccountUsers(req, eventData, gateway),
        resolveContractSubscription(req, subscriptionId, gateway)
    ]);

    if (!contractSubscription)  {
        throw new BillingError('Contract not found.', ERROR_CODES.CONTRACT_NOT_FOUND);
    }

    let transaction = await TransactionBackend.findByBillingEngineIdentifier(invoiceId, {
        requestId: req.requestId,
        billingEngine: gateway
    });

    logger.info(func, 'trans', transaction);

    if (!transaction)   {
        transaction = await TransactionBackend.findOneAndUpdate({
            'payment.billingEngine': gateway,
            'payment.metadata.subscriptionId': subscriptionId,
            'payment.metadata.periodStart': eventData.period_start,
            'payment.metadata.periodEnd': eventData.period_end,
        }, {
            'payment.metadata.invoiceId': invoiceId
        },{
            new: true
        });
    }
    
    logger.info(func, 'trans2', transaction);

    const attemptNumber = eventData.attempted ? eventData.attempt_count : 0;
    let newPurchasedPlan;
    if (transaction)    {
        if (transaction.status == TransactionStatus.SUCCESS)    {
            logger.info(func, 'discard event');
            return  //Transaction already succeeded, discard event
        }

        logger.info(func, 'transaction', transaction);

        const taxCalcId = transaction.tax && transaction.tax.metadata && transaction.tax.metadata.documentCode;

        const commitTaxResultRecurring = await CommitTransaction(req, taxCalcId, undefined, true);

        logger.info(func, 'tax committed');

        let updates = {};
        const now = new Date();
        updates[`subscriptions.${contractSubscription.index}.payment.status`] = constants.CHARGE_STATUS.CHARGED;
        updates[`subscriptions.${contractSubscription.index}.payment.on`] = now;
        updates[`subscriptions.${contractSubscription.index}.payment.next`] = moment(now).add(contractSubscription.subscription.billingInterval, contractSubscription.subscription.billingPeriod);
        updates[`subscriptions.${contractSubscription.index}.payment.billingEngine`] = constants.PAYMENT_GATEWAYS.STRIPE;
        updates[`subscriptions.${contractSubscription.index}.payment.metadata.subscriptionId`] = subscriptionId;
        updates[`subscriptions.${contractSubscription.index}.status`] = PURCHASED_PLAN_SUBSCRIPTION_STATUS_ACTIVE;

        const [ updatedTransaction, updatedContractSubscription ] = await Promise.all([
            TransactionBackend.endTransaction(transaction._id, TransactionStatus.SUCCESS, {
                transactionCompleteOn: now,
                'payment.attempts': attemptNumber,
                'payment.lastAttempt': now,
                'payment.metadata.invoiceId': invoiceId,
                'payment.metadata.periodStart': eventData.period_start,
                'payment.metadata.periodEnd': eventData.period_end,
                'payment.metadata.paymentId': eventData.charge,
                'tax.metadata.commit': true
            }, {
                requestId: req.requestId
            }),
            PurchasedPlanBackend.findOneAndUpdate({
                _id: contractSubscription.contract._id
            },{
                $set: updates
            })
        ]);

        newPurchasedPlan = updatedContractSubscription;
    } else {
        const tax = await calculateSubscriptionTax(req, eventData, event, contractSubscription.contract, gateway, constants.TAX_GATEWAYS.AVALARA);

        let taxDetails = [];
        for (let tti in tax.taxTypes) {
            const tt = tax.taxTypes[tti];
            taxDetails.push({
                title: {
                    text: tt.name,
                },
                amount: tt.tax,
            });
        }

        const commitTaxResultRecurring = await CommitTransaction(req, tax.taxId, undefined, true);

        logger.info(func, 'tax committed');

        const currentTimestamp = new Date();
        const newTransaction = {
            transactionInit: currentTimestamp,
            transactionCompleteOn: currentTimestamp,
            status: TransactionStatus.SUCCESS,
            refObject: contractSubscription.subscription._id,
            refObjectType: TransactionRefType.SUBSCRIPTION,
            payment: {
                attempts: attemptNumber,
                lastAttempt: currentTimestamp,
                billingEngine: constants.PAYMENT_GATEWAYS.STRIPE,
                metadata: {
                    customerId: eventData.customer,
                    subscriptionId: subscriptionId,
                    invoiceId: invoiceId,
                    periodStart: eventData.period_start,
                    periodEnd: eventData.period_end,
                    paymentId: eventData.charge
                }
            },
            tax: {
                taxDetails: taxDetails,
                amount: tax.tax,
                taxEngine: constants.TAX_GATEWAYS.AVALARA,
                metadata: {
                    documentCode: tax.taxId,
                    commit: true
                }
            },
            currency: eventData.currency.toUpperCase(),
            amount: _.round(eventData.total / 100, 2),
            created: {
                on: currentTimestamp
            }
        };

        let updates = {};
        updates[`subscriptions.${contractSubscription.index}.payment.status`] = constants.CHARGE_STATUS.CHARGED;
        updates[`subscriptions.${contractSubscription.index}.payment.on`] = currentTimestamp;
        updates[`subscriptions.${contractSubscription.index}.payment.next`] = moment(currentTimestamp).add(contractSubscription.subscription.billingInterval, contractSubscription.subscription.billingPeriod); // fix me
        updates[`subscriptions.${contractSubscription.index}.payment.billingEngine`] = constants.PAYMENT_GATEWAYS.STRIPE;
        updates[`subscriptions.${contractSubscription.index}.payment.metadata.subscriptionId`] = subscriptionId;
        updates[`subscriptions.${contractSubscription.index}.status`] = PURCHASED_PLAN_SUBSCRIPTION_STATUS_ACTIVE;

       const [ createdTransaction, updatedContractSubscription ] = await Promise.all([
           TransactionBackend.create(newTransaction),
            PurchasedPlanBackend.findOneAndUpdate({
                _id: contractSubscription.contract._id
            },{
                $set: updates
            })
        ]);

        newPurchasedPlan = updatedContractSubscription;

        logger.info(func, 'transaction created');
    }
    
    //Trigger event to extend any licensing
    const context = {
        requestId: req.requestId,
        purchasedPlan: newPurchasedPlan
    };
    const eventResult = await ASEventEmitter.emitPromise(ASEVENT_PURCHASED_PLAN_INTERVAL, context);
    if (eventResult && eventResult instanceof Error) {
        logger.error(func, 'Error continuing provisioning event', eventResult);
    }

    logger.info(func, 'should send email?', eventData.amount_paid > 0 & transaction);
    if (eventData.amount_paid > 0 & transaction)    {
        try{
            await SendIntervalInvoice(req, newPurchasedPlan, users, eventData.period_start, eventData.period_end);
            logger.info(func, 'invoice email sent');
        } catch(e)  {
            logger.error(func, 'Failed to send email.', e);
        }
    }
}

async function SendIntervalInvoice(req, purchasedPlan, users, startDate, endDate)    {
    const fn = `[${req.requestId}]${ns}[SendIntervalInvoice]`;

    logger.info(fn, 'begin');

    const { template } = require('../../modules/email/templates/order-confirmation-subscription');
    const { generateSubscriptionIdentifier } = require('../../modules/cart-salesmodel-rules/utils');
    const currencyFormatter = require('currency-formatter');

    logger.info(fn, 'users', users);
    
    for (let user of users) {
        const localizer = localizerUtil(user.account.languages[0].code || 'en-US');

        const compiled = _.template(template, {
            imports: {
            currency: (val) => currencyFormatter.format(val, { code: purchasedPlan.currency }),
            generateSubscriptionIdentifier: generateSubscriptionIdentifier,
            L: localizer,
            moment: moment,
            LV: (val) =>
                (val && val.resource) ?
                localizer.get(val.resource) :
                ((val && val.text) ? val.text : ''),
            },
        });

        logger.debug(fn, 'date', startDate, endDate);

        const summary = compiled({
            startDate: moment(startDate * 1000).format('YYYY-MM-DD'),
            endDate: moment(endDate * 1000).format('YYYY-MM-DD'),
            order: purchasedPlan,
            hasProvisioning: false,
            isInvoice: true,
            withExtraInfo: false, // FIXME
            details: { extraInfo: [] }, // FIXME
            supportEmail: global_constants.SUPPORT_EMAILS.CLOUD_SUPPORT, // FIXME
        });

        let product = purchasedPlan.items && purchasedPlan.items[0] && purchasedPlan.items[0].title && purchasedPlan.items[0].title;
        let productName = (product && (product.resource && localizer.get(product.resource)) || product.text) || '';

        logger.debug(fn, 'summary', summary);

        const result = await sendgrid.sendOrderEmail({
            requestId: req.requestId,
            language: user.account.languages[0].code || 'en-US',
    
            firstName: purchasedPlan.contact.firstName,
            lastName: purchasedPlan.contact.lastName,
    
            email: user.account.username,
    
            phoneNumber: purchasedPlan.contact.phone,
            companyName: purchasedPlan.company.name,
    
            productName,
            confirmationType: 'Subscriptions',
            confirmationNumber: purchasedPlan.confirmationNumber,
            notes: purchasedPlan.notes,
    
            shippingAddress: purchasedPlan.shippingAddress.address1,
            shippingCountry: purchasedPlan.shippingAddress.country,
            shippingCity: purchasedPlan.shippingAddress.city,
            shippingStateProvince: purchasedPlan.shippingAddress.state,
            shippingPostalCode: purchasedPlan.shippingAddress.zip,
    
            billingAddress: purchasedPlan.billingAddress.address1,
            billingCountry: purchasedPlan.billingAddress.country,
            billingCity: purchasedPlan.billingAddress.city,
            billingStateProvince: purchasedPlan.billingAddress.state,
            billingPostalCode: purchasedPlan.billingAddress.zip,

            baseUrl: Utils.getBaseURL(req),
    
            summary,
        });

        logger.info(fn, 'result', result);
    }
}

async function InvoiceUpcoming(req, eventData, event, gateway)   {
    const func = `[${req.requestId}]${ns}[InvoiceUpcoming]`;

    logger.info(func, 'begin');

    if (eventData.object != constants.STRIPE_OBJECTS.invoice.toLowerCase())   {
        throw new BillingError('Stripe webhook event object type is incorrect.', ERROR_CODES.INVALID_WEBHOOK_EVENT);
    }

    const subscriptionId = eventData.subscription;

    const contractSubscription = await resolveContractSubscription(req, subscriptionId, gateway);

    if (!contractSubscription)  {
        throw new BillingError('Contract not found.', ERROR_CODES.CONTRACT_NOT_FOUND);
    }

    const invoiceId = eventData.id;

    const transaction = await TransactionBackend.findOne({
        'payment.metadata.subscriptionId': eventData.subscription,
        'payment.metadata.periodStart': eventData.period_start,
        'payment.metadata.periodEnd': eventData.period_end,
        'payment.billingEngine': gateway,
    }, {
        requestId: req.requestId,
        ignoreNotFoundError: true
    });

    if (transaction)    {
        return; //transaction exists drop this event
    } else {
        const tax = await calculateSubscriptionTax(req, eventData, event, contractSubscription.contract, gateway, constants.TAX_GATEWAYS.AVALARA);

        let taxDetails = [];
        for (let tti in tax.taxTypes) {
            const tt = tax.taxTypes[tti];
            taxDetails.push({
                title: {
                    text: tt.name,
                },
                amount: tt.tax,
            });
        }

        const details = {
            payment: {
                billingEngine: constants.PAYMENT_GATEWAYS.STRIPE,
                metadata: {
                    customerId: eventData.customer,
                    subscriptionId: subscriptionId,
                    invoiceId: invoiceId,
                    periodStart: eventData.period_start,
                    periodEnd: eventData.period_end
                }
            },
            currency: eventData.currency.toUpperCase(),
            amount: _.round(eventData.total / 100, 2),
            tax: {
                taxEngine: constants.TAX_GATEWAYS.AVALARA,
                metadata: {
                    documentCode: tax.taxId,
                    commit: false
                },
                amount: tax.tax,
                taxDetails: taxDetails
            }
        };

        const createdTransaction = await TransactionBackend.startTransaction(TransactionRefType.SUBSCRIPTION, contractSubscription.subscription._id, details, null, {
            requestId: req.requestId
        });
    }
}

async function TrialEndingSoon(req, eventData, event, gateway)   {
    let func = `[${req.requestId}]${ns}[TrialEndingSoon]`;

    logger.info(func, 'begin', eventData);

    if (eventData.object != constants.STRIPE_OBJECTS.subscription.toLowerCase())   {
        throw new BillingError('Stripe webhook event object type is incorrect.', ERROR_CODES.INVALID_WEBHOOK_EVENT);
    }

    const subscriptionId = eventData.id;

    const contractSubscription = await resolveContractSubscription(req, subscriptionId, gateway);

    if (!contractSubscription)  {
        throw new BillingError('Contract not found.', ERROR_CODES.CONTRACT_NOT_FOUND);
    }

    // await PurchasedPlanBackend.findOneAndUpdate({
    //     _id: contractsubscription.contract._id,
    //     subscriptions: {
    //         $elemMatch: {
    //             _id: contractsubscription.subscription._id,
    //             status: TRIAL
    //         }
    //     }
    // },{
    //     'subscriptions.$[byId].status': ACTIVE
    // },{
    //     arrayFilters: [
    //         {
    //             byId: {
    //                 _id: contractsubscription.subscription._id
    //             }
    //         }
    //     ]
    // })
}

/**
 * Convert invoice line items received from payment gateway webhook to plan items to calculate tax.
 * @param {array} items 
 * @param {string} gateway 
 */
async function prepareSubscriptionItems(items, gateway = constants.PAYMENT_GATEWAYS.STRIPE) {
    const func = `${ns}[prepareSubscriptionItems]`;

    logger.info(func, 'begin');

    let planItems = [];
    let taxItem;

    const prepareItems = nonBlockify((item) =>  {
        if (item.plan.metadata.isTaxPlan)  {
            taxItem = {
                id: item.plan.id,
                subscriptionItemId: item.subscription_item,
                price: item.plan.amount / 100,
                interval: item.plan.interval,
                interval_count: item.plan.interval_count,
                currency: item.plan.currency,
                contractId: item.plan && item.plan.metadata && item.plan.metadata.AvayaStoreContractId
            };
        } else  {
            planItems.push({
                id: item.plan.id,
                subscriptionItemId: item.subscription_item,
                quantity: item.quantity,
                sku: item.plan && item.plan.metadata && item.plan.metadata.sku,
                price: item.plan.amount /100,
                interval: item.plan.interval,
                interval_count: item.plan.interval_count,
                currency: item.plan.currency,
                contractId: item.plan && item.plan.metadata && item.plan.metadata.AvayaStoreContractId
            });
        }
    });
    if (isStripeGateway(gateway))   {
        for (let item of items)  {
            await prepareItems(item);
        }
    }
    
    return {
        planItems, taxItem
    };
}

async function calculateSubscriptionTax(req, eventData, event, contract, gateway = constants.PAYMENT_GATEWAYS.STRIPE, taxGateway = constants.TAX_GATEWAYS.AVALARA)   {
    const func = `[${req.requestId}]${ns}[calculateSubscriptionTax]`;

    logger.info(func, 'begin');

    const subscriptionId = eventData.subscription;

    const taxCalcId = `${event.id}_webhookevent_${subscriptionId}`;

    const bill_address_obj = {
        country: contract.billingAddress.country,
        state: contract.billingAddress.state,
        city: contract.billingAddress.city,
        zip: contract.billingAddress.zip,
        street: contract.billingAddress.address1
    };

    const ship_address_obj = {
        country: contract.shippingAddress.country,
        state: contract.shippingAddress.state,
        city: contract.shippingAddress.city,
        zip: contract.shippingAddress.zip,
        street: contract.shippingAddress.address1
    };

    const preparedItems = await prepareSubscriptionItems(eventData.lines.data, gateway);

    logger.info(func, 'prepared items');

    const calculatedTax = await CalculateTax(req, bill_address_obj, ship_address_obj, preparedItems.planItems, contract.company.isIncorporated, taxCalcId, taxGateway);

    logger.info(func, 'tax calculated');

    const newTaxAmount = calculatedTax.tax * 100;
    const planTemplate = preparedItems.planItems[0];

    if (!preparedItems.taxItem)   {
        logger.info(func, 'new tax plan');
        const taxPlan = await CreateTaxPlan({
            tax: newTaxAmount,
            contractId: contract._id,
            interval: planTemplate.interval,
            currency: planTemplate.currency,
            interval_count: planTemplate.interval_count
        }, gateway);

        try{
            const newTaxSubscriptionItem = await CreateSubscriptionItem(req, subscriptionId, taxPlan.id, 1, false, gateway);
            logger.info(func, 'created tax plan for subscription item');
        } catch(err)    {
            logger.warn(func, 'Unable to create tax plan', taxPlan.id, 'err:', err);
        }
    } else if (Math.floor(preparedItems.taxItem.price * 100) != Math.floor(newTaxAmount))   {
        logger.info(func, 'oldtax', preparedItems.taxItem.price * 100);
        logger.info(func, 'update tax plan', newTaxAmount);
        const taxPlan = await CreateTaxPlan({
            tax: newTaxAmount,
            contractId: contract._id,
            interval: planTemplate.interval,
            currency: planTemplate.currency,
            interval_count: planTemplate.interval_count,
        }, gateway);

        logger.info(func, 'tax plan created');
        try{
            const updatedSubscriptionItem = await UpdateSubscriptionItem(req, preparedItems.taxItem.subscriptionItemId, taxPlan.id, 1, false, gateway);
            logger.info(func, 'updated subscription item tax');

            const deleteOldTaxPlanConfirmation = await DeletePlan(req, preparedItems.taxItem.id, gateway);
            logger.info(func, 'deleted old tax plan');
        } catch(err)    {
            logger.warn(func, 'Unable to delete old tax plan', preparedItems.taxItem.id, 'err:', err);
        }
        
    }

    return calculatedTax;
}

/**
 * Find store contractId from payment gateway subscriptionId.
 * @param {string} subscriptionId 
 * @param {string} gateway 
 */
async function resolveContractSubscription(req, subscriptionId, gateway = constants.PAYMENT_GATEWAYS.STRIPE) {
    const func = `[${req.requestId}]${ns}[resolveContractSubscription]`;

    logger.info(func, 'begin');

    const contract = await PurchasedPlanBackend.findOneByBillingEngineIdentifier(subscriptionId, {
        requestId: req.requestId,
        gateway
    });

    if (!contract)  {
        throw new BillingError('Contract not found.', ERROR_CODES.CONTRACT_NOT_FOUND);
    }

    logger.info(func, 'contract', contract);

    let resolvedSubscription;

    let i = 0;
    for (let subscription of contract.subscriptions) {
        if (subscription.payment.billingEngine == gateway && subscription.payment.metadata[constants.STRIPE_PROPERTY_NAMES.SUBSCRIPTION] == subscriptionId)   {
            resolvedSubscription = subscription;
            break;
        }
        i++;
    }

    return {
        contract,
        subscription: resolvedSubscription,
        index: i
    };
}

async function getBillingAccountUsers(req, eventData, gateway = constants.PAYMENT_GATEWAYS.STRIPE)    {
    const func = `[${req.requestId}]${ns}[getBillingAccountUsers]`;

    const users = await resolveUsersByGatewayId(eventData.customer, gateway);

    if (!users)   {
        throw new BillingError('Unable to find relevant user.', ERROR_CODES.USER_NOT_FOUND);
    }

    logger.info(func, 'users:', JSON.stringify(users));

    return users
}