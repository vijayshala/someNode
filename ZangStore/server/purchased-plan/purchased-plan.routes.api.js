const { Router } = require('express');
const { requireLoginApi, requireAPIorUserAuth } = require('../../middlewares/AuthUserCheckMiddleware');
const BaseController = require('../../controllers/BaseController');
const { 
    getPurchasedPlan, 
    getPurchasedPlans, 
    requestCancel, 
    cancel
} = require('./purchased-plan.controller');
const router = new Router();

router.get('/', requireLoginApi, getPurchasedPlans);
router.get('/:slug', requireAPIorUserAuth, getPurchasedPlan);
router.post('/:id/requestcancel', requireLoginApi, requestCancel);
router.post('/:id/cancel', BaseController.authorizeAdmin, requireLoginApi, cancel);

module.exports = router;
