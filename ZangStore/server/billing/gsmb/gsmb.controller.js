const ns = '[billing][gsmb.controller]';
const logger = require('applogger');

const { PurchasedPlanBackend } = require('../../purchased-plan/purchased-plan.backend');
const { PartnerBackend } = require('../../partner/partner.backend');
const { UnauthorizedError, BadRequestError } = require('../../modules/error');

const constants = require('../../../config/constants');

const getPurchasedPlan = async(req, res, next)  =>  {
    const fn = `[${req.requestId}]${ns}[getPurchasedPlan]`;
    const ppid = req.params.id;

    try {
        if (!ppid)  {
            throw new BadRequestError();
        }

        const partner = await PartnerBackend.findOne({
            'metadata.regionMaster': 'DE'
        }, {
            requestId: req.requestId,
            ignoreNotFoundError: true
        });

        if (!partner)   {
            throw new BadRequestError();
        }

        const purchasedPlan = await PurchasedPlanBackend.findOneByIdMSA(partner._id, ppid, {
            requestId: req.requestId,
            ignoreNotFoundError: true
        });

        logger.debug(fn, 'purchased-plan:', purchasedPlan);

        if (!purchasedPlan) {
            logger.debug(fn, 'purchased-plan not found');
            throw new BadRequestError();
        }

        res.status(200).json(purchasedPlan);
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

        const partner = await PartnerBackend.findOne({
            'metadata.regionMaster': 'DE'
        }, {
            requestId: req.requestId,
            ignoreNotFoundError: true
        });

        if (!partner)   {
            throw new BadRequestError();
        }

        const purchasedPlan = await PurchasedPlanBackend.findOneByIdMSA(partner._id, ppId, {
            requestId: req.requestId,
            ignoreNotFoundError: true
        });

        if (!purchasedPlan)    {
            throw new BadRequestError();
        }

        const result = await PurchasedPlanBackend.cancel(user, purchasedPlan._id, {
            requestId: req.requestId,
            localizer: req.localizer,
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

module.exports = {
    getPurchasedPlan,
    cancel,
};