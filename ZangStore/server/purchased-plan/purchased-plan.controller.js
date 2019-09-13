const ns = '[purchased-plan.controller]';
const logger = require('applogger');

const { PurchasedPlanBackend } = require('./purchased-plan.backend');
const { UnauthorizedError, BadRequestError } = require('../modules/error');
const { getBaseURL } = require('../../common/Utils');

const constants = require('../../config/constants');

const getPurchasedPlan = async (req, res, next) => {
  const fn = `[${req.requestId}]${ns}[getPurchasedPlan]`;
  let user = req.userInfo;
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

    let subscription = await PurchasedPlanBackend.findOneByIdentifier(user, slug, {
      requestId: req.requestId,
      localizer: req.localizer,
      identifierType,
      populate,
    });
    logger.info(fn, 'subscription:', subscription);

    res.status(200).json({
      error: false,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

const getPurchasedPlans = async (req, res, next) => {
  const fn = `[${req.requestId}]${ns}[getPurchasedPlans]`;
  const user = req.userInfo;
  logger.info(fn, 'user:', user);
  const populate = (req.query.populate && req.query.populate.split(',')) || [];
  logger.info(fn, 'populate=', populate);


  try {
    if (!user) {
      // FIXME: this should be handled by middleware
      throw new UnauthorizedError();
    }

    let subscriptions = await PurchasedPlanBackend.findByUser(user, {
      requestId: req.requestId,
      localizer: req.localizer,
      populate,
    });
    logger.info(fn, 'subscriptions:', subscriptions);

    res.status(200).json({
      error: false,
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};




const viewPurchasedPlans = async (req, res, next) => {
  const fn = `[${req.requestId}]${ns}[viewPurchasedPlans]`;
  const user = req.userInfo;
  // logger.info(fn, 'user:', user);
  const populate = (req.query.populate && req.query.populate.split(',')) || [];
  logger.info(fn, 'populate=', populate);

  try {
    if (!(user)) {
      // FIXME: this should be handled by middleware
      throw new UnauthorizedError();

    }

    let query = {};
    logger.info(fn, 'query', req.query.search);
    if (req.query.search) {
      query = {
        "confirmationNumber": req.query.search
      }
    }

    let purchasedPlans = await PurchasedPlanBackend.find(query, {
      requestId: req.requestId,
      localizer: req.localizer,
      populate,
      sort: {
        _id: -1
      }
    });
    // logger.info(fn, 'purchasedPlans:', purchasedPlans);

    res.render('purchased-plans/SubscriptionsList', {
      error: false,
      purchasedPlans
    });
  } catch (error) {
    next(error);
  }
};

const viewPurchasedPlan = async (req, res, next) => {
  const fn = `[${req.requestId}]${ns}[viewPurchasedPlan]`;
  const user = req.userInfo;
  // logger.info(fn, 'user:', user);
  const slug = req.params.slug;
  const identifierType = req.query['id-type'] || '_id';//'confirmationNumber';
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

    let subscription = await PurchasedPlanBackend.findOneByIdentifier(user, slug, {
      requestId: req.requestId,
      localizer: req.localizer,
      identifierType,
      populate,
    });
    logger.info(fn, 'subscription:', subscription);

    const { cartHasProductsOf } = require('../modules/cart-salesmodel-rules/utils');
    const { PRODUCT_ENGINE_NAME, PROVISION_STATUS_COMPLETED } = require('../kazoo/constants');

    const kazooItemIndexes = subscription && cartHasProductsOf(subscription, PRODUCT_ENGINE_NAME);

    const kazooItemIndex = kazooItemIndexes[0];
    logger.info(fn, 'kazooItemIndex=', kazooItemIndex);
    const kazooItem = subscription.items[kazooItemIndex];

    const provisionStatus = kazooItem && kazooItem.metadata && kazooItem.metadata.provisionStatus;

    res.render('purchased-plans/SubscriptionView', {
      // _csrf: req.csrfToken(),
      error: false,
      subscription,
      isKazooPlan: !!kazooItemIndexes,
      provisionStatus: provisionStatus,
      currentRegion: subscription.region || 'US'
    });
  } catch (error) {
    next(error);
  }

};

const cancel = async(req, res, next)  =>  {
  const fn = `[${req.requestId}]${ns}[cancel]`;
  const user = req.userInfo;
  const ppId = req.params.id;

  try{
    if (!user) {
      throw new UnauthorizedError();
    }
    if (!ppId) {
      throw new BadRequestError();
    }

    const result = await PurchasedPlanBackend.cancel(user, ppId, {
      requestId: req.requestId,
      localizer: req.localizer,
      region: req.region || 'US'
    });

    logger.debug(fn, 'result:', result);

    res.status(200).json({
      error: false,
      data: result
    });
  } catch(err)  {
    logger.error(fn, 'Error:', err);
    next(err);
  }
}

const requestCancel = async(req, res, next)  =>  {
  const fn = `[${req.requestId}]${ns}[requestCancel]`;
  const user = req.userInfo;
  const ppId = req.params.id;

  try{
    if (!user) {
      throw new UnauthorizedError();
    }
    if (!ppId) {
      throw new BadRequestError();
    }

    const result = await PurchasedPlanBackend.requestCancel(user, ppId, {
      requestId: req.requestId,
      localizer: req.localizer,
      baseUrl: getBaseURL(req),
      region: req.region || 'US'
    });

    logger.info(fn, 'result:', result);

    res.status(200).json({
      
    });
  } catch(err)  {
    logger.error(fn, 'Error:', err);
    next(err);
  }
}


module.exports = {
  getPurchasedPlan,
  getPurchasedPlans,
  viewPurchasedPlan,
  viewPurchasedPlans,
  requestCancel,
  cancel,
};
