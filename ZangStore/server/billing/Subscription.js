const ns = '[billing][Subscription]';

import logger from 'applogger';
import { BillingError, ERROR_CODES } from './Error';
import { GetPlan, CreateTaxPlan, DeleteTaxPlans } from './Plan';
import config from '../../config';
import * as constants from './Constants';

const {
  isStripeGateway,
  LoadStripe
} = require('./integrations/stripe');

/**
 * Create a new subscription on a payment gateway.
 * @param {*} req 
 * @param {array} plans 
 * @param {string} contractId 
 * @param {string} gateway 
 */
export async function CreateSubscription(req, customerId, plans, tax, contractId, gateway = constants.PAYMENT_GATEWAYS.STRIPE)  {
  let func = `[${req.requestId}][${ns}][CreateSubscription]`;

  if (!constants.PAYMENT_GATEWAYS.hasOwnProperty(gateway))  {
    logger.error(func, 'gateway does not exist', gateway);
    throw new BillingError("Gateway does not exist", ERROR_CODES.PAYMENT_GATEWAY_NOT_FOUND);
  }

  logger.info(func, 'begin');

  if (!plans || plans.length == 0) {
    logger.error(func, 'no plans provided');
    throw new BillingError('No plans provided', ERROR_CODES.NO_PLANS);
  }

  const data = {
    customerId: customerId,
    items: [],
    metadata: {
      //AvayaStoreUserId: req.userInfo.userId.toString(),
      //ZAccountUserId: req.userInfo.accountId.toString(),
      AvayaStoreContractId: contractId.toString(),
      AvayaStoreEnvironment: config.environment
    }
  }

  if (isStripeGateway(gateway)) {
    let stripe = LoadStripe(gateway);
    let taxPlanCreated = false;
    for (let plan of plans) {
      const stripePlan = await GetPlan(plan.sku, true, gateway);
      
      if (!stripePlan) {
        throw new BillingError('Plan not found.', ERROR_CODES.PLAN_NOT_FOUND);
      }

      if (plan.quantity > 0)  {
        if (!taxPlanCreated)  {
          const taxPlan = await CreateTaxPlan({
            tax: tax,
            contractId: contractId.toString(),
            interval: stripePlan.interval,
            currency: stripePlan.currency,
            interval_count: stripePlan.interval_count
          }, gateway);

          data.items.push({
            plan: taxPlan.id,
            quantity: 1
          });

          taxPlanCreated = true;
        }
        
        //push product plan
        data.items.push({
          plan: stripePlan.id,
          quantity: plan.quantity
        });
      }
    }

    return await stripe.CreateSubscription(req, data);
  }
}

/**
 * Update a single subscription item.
 * @param {*} req 
 * @param {string} subscriptionItemId 
 * @param {string} newPlan 
 * @param {number} quantity 
 * @param {boolean} prorate 
 * @param {date} proration_date 
 * @param {string} gateway 
 */
export async function UpdateSubscriptionItem(req, subscriptionItemId, newPlan, quantity, prorate = false, gateway = constants.PAYMENT_GATEWAYS.STRIPE)  {
  let func = `[${req.requestId}]${ns}[UpdateSubscriptionItem]`;

  if (!constants.PAYMENT_GATEWAYS.hasOwnProperty(gateway))  {
    logger.error(func, 'gateway does not exist', gateway);
    throw new BillingError("Gateway does not exist", ERROR_CODES.PAYMENT_GATEWAY_NOT_FOUND);
  }

  logger.info(func, 'begin');

  if (isStripeGateway(gateway)) {
    let stripe = LoadStripe(gateway);
    let data = {
      plan: newPlan,
      prorate: prorate,
      quantity: quantity
    };
    return await stripe.UpdateSubscriptionItem(req, subscriptionItemId, data);
  } 
}

export async function CreateSubscriptionItem(req, subscriptionId, planId, quantity, prorate = false, gateway = constants.PAYMENT_GATEWAYS.STRIPE) {
  let func = `[${req.requestId}]${ns}[CreateSubscriptionItem]`;

  if (!constants.PAYMENT_GATEWAYS.hasOwnProperty(gateway))  {
    logger.error(func, 'gateway does not exist', gateway);
    throw new BillingError("Gateway does not exist", ERROR_CODES.PAYMENT_GATEWAY_NOT_FOUND);
  }

  logger.info(func, 'begin');

  if (isStripeGateway(gateway)) {
    let stripe = LoadStripe(gateway);
    let data = {
      plan: planId,
      subscription: subscriptionId,
      prorate: prorate,
      quantity: quantity
    };

    return await stripe.CreateSubscription(req, data);
  } 
}

/**
 * Update a subscription.
 * @param {*} req 
 * @param {string} subscriptionId 
 * @param {array} plans 
 * @param {string} gateway 
 */
export async function UpdateSubscription(req, subscriptionId, plans, gateway = constants.PAYMENT_GATEWAYS.STRIPE) {
  let func = `[${req.requestId}][${ns}][UpdateSubscription]`;

  if (!constants.PAYMENT_GATEWAYS.hasOwnProperty(gateway))  {
    logger.error(func, 'gateway does not exist', gateway);
    throw new BillingError("Gateway does not exist", ERROR_CODES.PAYMENT_GATEWAY_NOT_FOUND);
  }

  logger.info(func, 'begin');

  
  let data = {
    subscriptionId: subscriptionId,
    items: plans
  }

  if (isStripeGateway(gateway)) {
    let stripe = LoadStripe(gateway);
    return await stripe.UpdateSubscription(req, data);
  }
}

/**
 * Cancel a subscription.
 * @param {*} req 
 * @param {string} gateway 
 * @param {string} subscriptionId 
 */
export async function CancelSubscription(req, subscriptionId, gateway = constants.PAYMENT_GATEWAYS.STRIPE)  {
  let func = `[${req.requestId}][${ns}][CancelSubscription]`;

  if (!constants.PAYMENT_GATEWAYS.hasOwnProperty(gateway))  {
    logger.error(func, 'gateway does not exist', gateway);
    throw new BillingError("Gateway does not exist", ERROR_CODES.PAYMENT_GATEWAY_NOT_FOUND);
  }

  logger.info(func, 'begin', subscriptionId);

  await DeleteTaxPlans(req, subscriptionId, gateway);

  if (isStripeGateway(gateway)) {
    let stripe = LoadStripe(gateway);
    return await stripe.CancelSubscription(req, subscriptionId);
  }
}