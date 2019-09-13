const ns = '[order.controller]';
const logger = require('applogger');

const { OrderBackend } = require('./order.backend');
const { UnauthorizedError, BadRequestError } = require('../modules/error');

import { asyncGetCreditCards } from '../billing/PaymentMethod';
const { getStripeAccountByRegion } = require('../billing/integrations/stripe');

const getOrder = async(req, res, next) => {
  const fn = `[${req.requestId}]${ns}[getOrder]`;
  const user = req.userInfo;
  logger.info(fn, 'user:', user);
  const slug = req.params.slug;
  const identifierType = req.query['id-type'] || 'confirmationNumber';
  const populate = (req.query.populate && req.query.populate.split(',')) || [];
  logger.info(fn, 'slug=', slug, 'identifierType=', identifierType, 'populate=', populate);

  try {
    if (!user) {
      // FIXME: this should be handled by middleware
      throw new UnauthorizedError();
    }
    if (['_id', 'confirmationNumber'].indexOf(identifierType) === -1) {
      throw new BadRequestError();
    }
    if (identifierType === '_id' && !slug.match(/^[0-9a-f]{24}$/)) {
      throw new BadRequestError('Invalid ID');
    }

    let order = await OrderBackend.findOneByIdentifier(user, slug, {
      requestId: req.requestId,
      localizer: req.localizer,
      identifierType,
      populate,
    });
    logger.info(fn, 'order:', order);

    res.status(200).json({
      error: false,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const getOrders = async(req, res, next) => {
  const fn = `[${req.requestId}]${ns}[getOrders]`;
  const user = req.userInfo;
  logger.info(fn, 'user:', user);
  const populate = (req.query.populate && req.query.populate.split(',')) || [];
  logger.info(fn, 'populate=', populate);

  try {
    if (!user) {
      // FIXME: this should be handled by middleware
      throw new UnauthorizedError();
    }

    let orders = await OrderBackend.findByUser(user, {
      requestId: req.requestId,
      localizer: req.localizer,
      populate,
    });
    logger.info(fn, 'orders:', orders);

    res.status(200).json({
      error: false,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

const createOrder = async(req, res, next) => {
  const fn = `[${req.requestId}]${ns}[createOrder]`;
  const { getBaseURL } = require('../../common/Utils');
  const user = req.userInfo;
  const order = req.body;
  logger.info(fn, 'user:', user);
  logger.info(fn, 'order:', order);

  try {
    if (!user) {
      // FIXME: this should be handled by middleware
      throw new UnauthorizedError();
    }

    let created = await OrderBackend.createOrder(user, order, {
      requestId: req.requestId,
      baseUrl: getBaseURL(req),
      localizer: req.localizer,
      region: req.region
    });
    logger.debug(fn, 'created:', created);

    res.status(200).json({
      error: false,
      data: created,
    });
  } catch (error) {
    next(error);
  }
};


const viewOrdersList = async(req, res, next) => { 
  const fn = `[${req.requestId}]${ns}[viewOrdersList]`;
  const user = req.userInfo;
  logger.info(fn, 'user:', user);
  try {
    if (!user) {
      // FIXME: this should be handled by middleware
      throw new UnauthorizedError();
    }
    let query = {};

    logger.info(fn, 'query', req.query.search);
    if(req.query.search) {
      query = {
         "confirmationNumber": req.query.search
      }
    }
    let orders = await OrderBackend.find(query, {
      requestId: req.requestId,
      localizer: req.localizer,
      populate: [],
      sort: {
        _id: -1
      }
    });
    
    logger.info('orders:', orders);

    res.render('order-view/OrderList', {
      error: false,
      slug: '',
      orders: orders,
      query: req.query
    });
  } catch (error) {
    next(error);
  }
};

const viewOrder = async(req, res, next) => {
  const fn = `[${req.requestId}]${ns}[viewOrder]`;
  const user = req.userInfo;
  logger.debug(fn, 'user:', user);
  const slug = req.params.slug;
  const identifierType = req.query['id-type'] || '_id'; // 'confirmationNumber';
  const populate = (req.query.populate && req.query.populate.split(',')) || [];
  logger.info(fn, 'slug=', slug, 'identifierType=', identifierType, 'populate=', populate);

  const dbOptions = {
    requestId: req.requestId,
  };

  try {
    if (!user) {
      // FIXME: this should be handled by middleware
      throw new UnauthorizedError();
    }
    if (['_id', 'confirmationNumber'].indexOf(identifierType) === -1) {
      throw new BadRequestError();
    }
    if (identifierType === '_id' && !slug.match(/^[0-9a-f]{24}$/)) {
      throw new BadRequestError('Invalid ID');
    }

    let order = await OrderBackend.findOneByIdentifier(user, slug, {
      ...dbOptions,
      localizer: req.localizer,
      identifierType,
      populate,
    });
    logger.debug(fn, 'order:', order);

    let partnerOrder = {};

    try {
      if (order.partner && order.partnerAgent) {
        // FIXME: in the future, the partnerOrder should be retrieved from order table
        partnerOrder = {
          partner: order.partner,
          agent: order.partnerAgent,
        };
      } else {
        // FIXME: this is back compatible way, and it should be removed in the future
        const { PartnerOrderBackend } = require('../partner/partner-order.backend');
        partnerOrder = await PartnerOrderBackend.getByOrderId(order._id, dbOptions);
      }

      if (partnerOrder.partner) {
        const { PartnerBackend } = require('../partner/partner.backend');
        partnerOrder.partner = await PartnerBackend.findOneById(partnerOrder.partner, dbOptions);
      }
      if (partnerOrder.agent) {
        const { PartnerAgentBackend } = require('../partner/partner-agent.backend');
        partnerOrder.agent = await PartnerAgentBackend.findOneById(partnerOrder.agent, {
          ...dbOptions,
          populate: ['user'],
        });
      }
    } catch (partnerErr) {
      logger.warn(fn, 'partner read error:', partnerErr);
    }

    let creditCards=[];
    // get all credit cards of the user if the payment type is credit card
    if (order.payment.metadata.paymentType == 'CREDIT_CARD') {
      try {
        let stripe = getStripeAccountByRegion(order.region);
        creditCards = await asyncGetCreditCards(req, order.billingAccountId, stripe.gateway);
      } catch (e) {
        logger.error(req.requestId, ns, 'error', e);
        //error = e.message;
      }
    }

    

    res.render('order-view/OrderView', {
      // _csrf: req.csrfToken(),
      error: false,
      order: order,
      partnerOrder,
      cards: creditCards,
      query: req.query,
      orderRegion: order.region
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrder,
  getOrders,
  createOrder,
  viewOrder,
  viewOrdersList
};
