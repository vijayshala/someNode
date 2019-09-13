const ns = '[kazoo][tasks][unprovision]';
const logger = require('applogger');
 
const handler = (src, data, cb) => {
    const fn = `[${src.requestId}]${ns}[processEvent]`;
    const U = require('../../modules/utils');
    const { PRODUCT_ENGINE_NAME, PROVISION_STATUS_CANCELED, PROVISION_STATUS_CANCEL_FAILED } = require('../constants');
    const { PurchasedPlanBackend } = require('../../purchased-plan/purchased-plan.backend');
    
    logger.info(fn, 'started, data:', data);

    const options = {
        requestId: src.requestId,
    };

    let purchasedPlan, progress = {}, kazooItemIndex, updates = {};

    const immediateDelete = data.account_id;

    U.P()
    .then(async()   =>  {
        if (immediateDelete)    {
            return;
        }
        const { cartHasProductsOf } = require('../../modules/cart-salesmodel-rules/utils');
        purchasedPlan = await PurchasedPlanBackend.findOneById(data.purchasedPlanId, options);

        const kazooItemIndexes = purchasedPlan && cartHasProductsOf(purchasedPlan, PRODUCT_ENGINE_NAME);
        
        if (purchasedPlan && !kazooItemIndexes) {
            logger.warn(fn, `No "${PRODUCT_ENGINE_NAME}" product found in purchased plan, skipped`);
            throw new Error('Invalid product engine.');
        }

        kazooItemIndex = kazooItemIndexes[0];
        logger.info(fn, 'kazooItemIndex=', kazooItemIndex);
        const kazooItem = purchasedPlan.items[kazooItemIndex];
        logger.info(fn, 'kazooItem=', kazooItem && kazooItem.identifier);

        progress = kazooItem && kazooItem.metadata && kazooItem.metadata.kazoo;

        logger.info(fn, 'got provisioning progress', progress);
    })
    .then(async()   =>  {
        if (!progress.account_id && !immediateDelete)    {
            return;
        }
        const { DeleteAccount } = require('../models/kazoo.backend');

        await DeleteAccount(immediateDelete ? immediateDelete : progress.account_id, options);

        updates[`items.${kazooItemIndex}.metadata.kazoo`] = null;

        logger.info(fn, 'Kazoo account deleted');
    })
    .then(async() =>  {
        logger.info(fn, 'unprovisioning success');

        updates[`items.${kazooItemIndex}.metadata.provisionStatus`] = PROVISION_STATUS_CANCELED;

        if (immediateDelete)   {
            return;
        }
        purchasedPlan = await PurchasedPlanBackend.findOneAndUpdate({
            _id: purchasedPlan._id
        }, {
            $set: updates,
        }, options);
        
        logger.info(fn, 'unprovisioning status updated');
    })
    .then(()   =>  {
        return cb();
    })
    .catch(async(err)    =>  {
        logger.error(fn, 'error:', err);

        if (immediateDelete)    {
            return cb(err);
        }

        updates[`items.${kazooItemIndex}.metadata.provisionStatus`] = PROVISION_STATUS_CANCEL_FAILED;

        try{
            await PurchasedPlanBackend.findOneAndUpdate({
                _id: purchasedPlan._id
            }, {
                $set: updates,
            }, options);
            logger.info(fn, 'unprovisioning status updated');
        } catch(err2)   {
            logger.error(fn, 'failed to update purchased plan', err2);
        }

        return cb(err);
    });
};

module.exports = handler;
