const { Router } = require('express');
const { 
    getPurchasedPlan, 
    cancel,
} = require('./gsmb.controller');
const BaseController = require('../../../api/controllers/BaseController');

const router = new Router();

router.get('/purchased-plan/:id', BaseController.authorizeAdminApiGSMB, getPurchasedPlan);
router.post('/purchased-plan/:id/cancel', BaseController.authorizeAdminApiGSMB, cancel);

module.exports = router;
