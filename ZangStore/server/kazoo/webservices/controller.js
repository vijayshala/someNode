const ns = '[kazoo.controller]';
const logger = require('applogger');

const { PRODUCT_ENGINE_NAME } = require('../constants');
const { UnauthorizedError, BadRequestError } = require('../../modules/error');

const servicePlan = async (req, res, next)  =>  {
  const fn = `[${req.requestId}]${ns}[servicePlan]`;
  const { SendServicePlanPayload } = require('../../billing/gsmb/gsmb.backend');
  const { processKazooBillingEvent } = require('./backend');
  const { getBaseURL } = require('../../../common/Utils');

  try{
    let options = {
      requestId: req.requestId,
      baseUrl: getBaseURL(req)
    };
  
    const payload = req.body;
  
    logger.info(fn, 'kazoo webhook:', payload);
   
    let failureExists = false;

    try{
      const result = await SendServicePlanPayload(payload, options);

      logger.info(fn, 'service plan sent', result);
    } catch(err) {
      logger.error(fn, 'failure from german billing engine', err);
      failureExists = true;
    }

    try{
      await processKazooBillingEvent(payload, options);
    } catch(err)  {
      logger.error(fn, 'failure from store processing of kazoo billing event');
      failureExists = true;
    }
    
    if (failureExists)  {
      res.status(500).json({
        error: true,
        data: {
          productEngine: PRODUCT_ENGINE_NAME,
        },
      });
    } else {
      res.status(200).json({
        error: false,
        data: {
          productEngine: PRODUCT_ENGINE_NAME,
        },
      });
    }
  } catch(err)  {
    logger.error(fn, 'Error:', err);
    next(err);
  }
};

const provision = async (req, res, next)  =>  {
  const fn = `[${req.requestId}]${ns}[provision]`;
  const { triggerProvisionKazoo } = require('../utils');
  const ppId = req.params.id;

  try{
    if (!ppId)  {
      throw new BadRequestError();
    }
  
    logger.info(fn, 'start provision kazoo');
    
    let data = {
      purchasedPlanId: ppId
    };
  
    await triggerProvisionKazoo(req, data);
  
    res.status(200).json({
      error: false,
      data: 'Provisioning started'
    });
  } catch(err)  {
    next(err);
  }
};

const getProvisionStatus = async (req, res, next) =>  {
  const fn = `[${req.requestId}]${ns}[getProvisionStatus]`;
  const { PurchasedPlanBackend } = require('../../purchased-plan/purchased-plan.backend');
  const { cartHasProductsOf } = require('../../modules/cart-salesmodel-rules/utils');
  const ppId = req.params.id;

  try{
    if (!ppId)  {
      throw new BadRequestError();
    }
  
    const purchasedPlan = await PurchasedPlanBackend.findOneById(ppId, {
      requestId: req.requestId
    });
  
    const kazooItemIndexes = purchasedPlan && cartHasProductsOf(purchasedPlan, PRODUCT_ENGINE_NAME);
  
    if (purchasedPlan && !kazooItemIndexes) {
      logger.warn(fn, `No Kazoo product found in purchased plan`);
  
      throw new BadRequestError();
    }
  
    const kazooItemIndex = kazooItemIndexes[0];
    logger.info(fn, 'kazooItemIndex=', kazooItemIndex);
    const kazooItem = purchasedPlan.items[kazooItemIndex];
    logger.info(fn, 'kazooItem=', kazooItem && kazooItem.identifier);
  
    res.status(200).json({
      error: false,
      data: kazooItem && kazooItem.metadata && kazooItem.metadata.provisionStatus
    });
  } catch(err)  {
    next(err);
  }
};

module.exports = {
  servicePlan,
  provision,
  getProvisionStatus,
};
