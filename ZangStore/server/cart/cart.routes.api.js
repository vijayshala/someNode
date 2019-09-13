const { Router } = require('express');
const {requireLoginApi} = require('../../middlewares/AuthUserCheckMiddleware');
const { 
    getCart, 
    updateCart, 
    deleteCart,
    sendSummary
} = require('./cart.controller');
const router = new Router();

router.get('/', [requireLoginApi, getCart]);
router.post('/', [requireLoginApi, updateCart]);
router.delete('/', [requireLoginApi, deleteCart]);
router.post('/sendsummary', requireLoginApi, sendSummary);

module.exports = router;
