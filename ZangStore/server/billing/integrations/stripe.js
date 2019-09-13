const ns = '[integrations][stripe]';

import logger from 'applogger';
import stripe from 'stripe';
import config from '../../../config';
import { PAYMENT_GATEWAYS, STRIPE_OBJECTS } from '../Constants';
import { nonBlockify } from '../../modules/utils';

class StripeBackend {
  constructor(stripeConfig, gateway) {
    this.stripe = stripe(stripeConfig.secretKey);
    this.stripe.setApiVersion('2017-12-14');
    this.webhookSecret = stripeConfig.webhookSecret;
    this.publicKey = stripeConfig.publicKey;
    this.gateway = gateway;

  }

  /**
   * Create new product.
   * @param {*} product 
   */
  async initProduct(product) {
    let func = `${ns}[initProduct]`;

    logger.info(func, 'begin', product);
    
    return await this.stripe.products.create({
      //id: product.id,
      name: product.name,
      type: product.type,
      metadata: product.metadata,
      //statement_descriptor: product.statement_descriptor
    });
  }

  async createSource(customerId, source)  {
    return await this.stripe.customers.createSource(customerId, {
      source: source
    });
  }

  async createCustomer(customerObj) {
    return await this.stripe.customers.create(customerObj);
  }

  async updateCustomer(customerId, customerObj) {
    return await this.stripe.customers.update(customerId, customerObj);
  }

  async getCustomer(customerId) {
    return await this.stripe.customers.retrieve(customerId);
  }

  async deleteCustomer(customerId) {
    return await this.stripe.customers.del(customerId);
  }

  async deleteSource(customerId, sourceId) {
    return await this.stripe.customers.deleteSource(customerId, sourceId);
  }

  /**
   * Create new sku.
   * @param {*} sku 
   */
  async initSKU(sku) {
    let func = `${ns}[initSKU]`;

    logger.info(func, 'begin', sku);
    
    return await this.stripe.skus.create({
        product: sku.product,
        currency: sku.currency || 'usd',
        inventory: sku.inventory,
        price: sku.price,
        metadata: sku.metadata
    });
  }

  async CreatePlan(plan) {
    let func = `${ns}[CreatePlan]`;

    logger.info(func, 'begin', plan);

    return await this.stripe.plans.create({
      currency: plan.currency || 'usd',
      interval: plan.interval,
      product: plan.product,
      amount: Math.round(plan.price),
      interval_count: plan.interval_count,
      metadata: plan.metadata
    })
  }

  async DeletePlan(planId)  {
    let func = `${ns}[DeletePlan]`;

    logger.info(func, 'begin', planId);

    return await this.stripe.plans.del(planId);
  }

  async CreateSubscription(req, data) {
    let func = `[${req.requestId}][${ns}][CreateSubscription]`;
    logger.info(func, 'begin', data);

    let subscriptionPayload = {
      customer: data.customerId,
      billing: data.billing || 'charge_automatically',
      billing_cycle_anchor: data.billingStartDate || 'now',
      items: data.items,
      metadata: data.metadata,
      prorate: data.prorate !== false && data.prorate !== 'false',
      source: data.source
    };

    logger.info(func, subscriptionPayload);

    return await this.stripe.subscriptions.create(subscriptionPayload);
  }

  async CancelSubscription(req, subscriptionId) {
    let func = `[${req.requestId}][${ns}][CancelSubscription]`;
    logger.info(func, 'begin', subscriptionId);

    return await this.stripe.subscriptions.del(subscriptionId);
  }

  async UpdateSubscriptionItem(req, subscriptionItemId, data)  {
    let func = `[${req.requestId}]${ns}[UpdateSubscriptionItem]`;

    logger.info(func, 'begin');

    let subscriptionItemPayload = {
      plan: data.plan,
      prorate: data.prorate || false,
      ...(data.proration_date ? {proration_date: data.proration_date} : {}),
      quantity: data.quantity || 1
    };

    logger.info(func, 'subscriptionItemPayload', subscriptionItemPayload);

    return await this.stripe.subscriptionItems.update(subscriptionItemId, subscriptionItemPayload);
  }

  async CreateSubscriptionItem(req, data) {
    let func = `[${req.requestId}]${ns}[CreateSubscriptionItem]`;

    logger.info(func, 'begin');

    let subscriptionItemPayload = {
      plan: data.plan,
      subscription: data.subscription,
      metadata: data.metadata,
      prorate: data.prorate || false,
      ...(data.proration_date ? {proration_date: data.proration_date} : {}),
      quantity: data.quantity || 1
    };

    logger.info(func, 'subscription item payload', subscriptionItemPayload);

    return await this.stripe.subscriptionItems.create(subscriptionItemPayload);
  }

  async UpdateSubscription(req, data) {
    let func = `[${req.requestId}][${ns}][UpdateSubscription]`;
    logger.info(func, 'begin', data);

    let subscriptionPayload = {
      ...(data.billing ? {billing: data.billing} : {}),
      ...(data.billingStartDate ? {billing_cycle_anchor: data.billingStartDate} : {}),
      ...(data.billingEndDate ? {cancel_at_period_end: data.billingEndDate} : {}),
      ...(data.prorate ? {prorate: data.prorate} : {}),
      ...(data.source ? {source: data.source} : {}),
      ...(data.prorate ? {prorate: data.prorate} : {}),
      ...(data.proration_date ? {proration_date: data.proration_date} : {}),
      items: data.items,
      metadata: data.metadata
    };

    return await this.stripe.subscriptions.update(data.subscriptionId, subscriptionPayload);
  }

  async GetSubscription(req, subscriptionId)  {
    let func = `[${req.requestId}][${ns}][UpdateSubscription]`;
    logger.info(func, 'begin');

    return await this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async CreateCharge(req, data) {
    let func = `[${req.requestId}][${ns}][CreateCharge]`;
    logger.info(func, 'begin', data);

    logger.info(func, 'amount unrounded', data.amount, 'amount rounded', Math.round(data.amount))

    let chargePayload = {
      amount: Math.round(data.amount),
      currency: data.currency || 'usd',
      capture: data.capture !== false && data.capture !== 'false',
      description: data.description,
      metadata: data.metadata,
      customer: data.customerId,
      source: data.sourceId,
      statement_descriptor: data.statement_descriptor
    };

    logger.info(func, 'request', chargePayload);

    return await this.stripe.charges.create(chargePayload);
  }

  async getPlan(planId) {
    let func = `[${ns}[getPlan]`;
    logger.info(func, 'begin planId', planId);
    return await this.stripe.plans.retrieve(planId);
  }

  async getProduct(productId) {
    let func = `${ns}[getProduct]`;
    logger.info(func, 'begin productId', productId);
    return await this.stripe.products.retrieve(productId);
  }

  ParseStripeEvent(req, res, validateSignature = true) {
    let func = `[${req.requestId}]${ns}[ParseStripeEvent]`;

    logger.info(func, 'begin');

    //logger.debug(func, 'body', req.body);

    let event;
    if (validateSignature)  {
      let requestSignature = req.headers['stripe-signature'];

      try{
        event = this.stripe.webhooks.constructEvent(req.body, requestSignature, this.webhookSecret);
      }
      catch(err)  {
        logger.error(func, 'error', err);
        res.status(401).end();
      }
    } else  {
      try{
        event = JSON.parse(req.body);
      }
      catch(err)  {
        logger.error(func, 'error', err);
        res.status(400).end();
      }
    }
    
    return event;
  }

  async CreateCardToken(req, cardObj)  {
    let func = `[${req.requestId}]${ns}[CreateCardToken]`;

    logger.info(func, 'begin');

    let data = {
      card: cardObj
    };

    return await this.stripe.tokens.create(data);
  }

  async GetCreditCards(req, customerId) {
    let func = `[${req.requestId}]${ns}[GetCreditCards]`;

    if (!customerId)  {
      return []
    }
    let customer = await this.stripe.customers.retrieve(customerId);

    logger.info(func, 'customer obj', customer);
    let pMethods = [];
    if (customer && customer.sources && customer.sources.data)  {
      const parseCards = nonBlockify((card) =>  {
        if (card.object == "card")  {
          if (card.id == customer.default_source) {
            card.default = true;
          }
          card.paymentMethodObject = {
            billingEngine: PAYMENT_GATEWAYS.STRIPE,
            metadata: {
              paymentType: STRIPE_OBJECTS.card,
              customerId: customer.id,
              sourceId: card.id,
            },
          };
          pMethods.push(card);
        }
      });

      for (let card of customer.sources.data) {
        await parseCards(card);
      }
    }
  }
}

let backendUS = new StripeBackend(config.stripe, PAYMENT_GATEWAYS.STRIPE);
let backendCA = new StripeBackend(config.stripe_ca, PAYMENT_GATEWAYS.STRIPE_CA);

function LoadStripe(gateway) {
  const { PAYMENT_GATEWAYS } = require('../Constants');
  if (gateway == PAYMENT_GATEWAYS.STRIPE) {
      return backendUS;
  } else if (gateway == PAYMENT_GATEWAYS.STRIPE_CA)   {
      return backendCA;
  } else {
    return null;
  }
}

function isStripeGateway(gateway) {
  return [PAYMENT_GATEWAYS.STRIPE, PAYMENT_GATEWAYS.STRIPE_CA].indexOf(gateway) > -1;
}

function hasStripePaymentGateway(paymentGateways) {
  if (paymentGateways[PAYMENT_GATEWAYS.STRIPE]) {
    return PAYMENT_GATEWAYS.STRIPE
  } else if (paymentGateways[PAYMENT_GATEWAYS.STRIPE_CA]) {
    return PAYMENT_GATEWAYS.STRIPE_CA
  }
  else {
    return null;
  }
}

function getStripeAccountByRegion(region = 'US') {
  let fn = `${ns}[getStripeAccountByRegion]`;
  region = region.toUpperCase();
  logger.info(fn, 'region', region)
  if (region == 'CA') {
    return backendCA
  }

  return backendUS
}

module.exports = {
  StripeBackendCA: backendCA,
  StripeBackendUS: backendUS,
  LoadStripe,
  isStripeGateway,
  hasStripePaymentGateway,
  getStripeAccountByRegion
};