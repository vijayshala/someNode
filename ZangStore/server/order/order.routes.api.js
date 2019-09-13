const { Router } = require('express');
import {requireLoginApi} from '../../middlewares/AuthUserCheckMiddleware';
const { getOrder, getOrders, createOrder } = require('./order.controller');
const router = new Router();

router.get('/', [requireLoginApi, getOrders]);
router.get('/:slug', [requireLoginApi, getOrder]);
router.post('/', [requireLoginApi, createOrder]);

module.exports = router;
