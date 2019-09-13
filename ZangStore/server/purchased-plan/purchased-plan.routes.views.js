const { Router } = require('express');

import cors from 'cors'
import {requireLoginPage} from '../../middlewares/AuthUserCheckMiddleware';

import BaseController from '../../controllers/BaseController'
const { viewPurchasedPlan, viewPurchasedPlans } = require('./purchased-plan.controller');
const router = new Router();

router.get('/', [requireLoginPage, cors(), BaseController.authorizeAdmin, viewPurchasedPlans]);
router.get('/:slug', viewPurchasedPlan);

module.exports = router;
