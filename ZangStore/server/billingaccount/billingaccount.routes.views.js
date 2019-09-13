const { Router } = require('express');
const {
  ViewBillingAccounts,
  ViewBillingAccount
} = require('./billingaccount.controller');

import {requireLoginPage} from '../../middlewares/AuthUserCheckMiddleware';
import BaseController from '../../controllers/BaseController'

const router = new Router();

router.get('/', [requireLoginPage, BaseController.authorizeAdmin, ViewBillingAccounts]);
router.get('/:id', [requireLoginPage, BaseController.authorizeAdmin, ViewBillingAccount]);

module.exports = router;
