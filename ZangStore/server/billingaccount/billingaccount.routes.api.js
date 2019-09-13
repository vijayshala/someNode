const { Router } = require('express');
const { 
    GetBillingAccounts,
    GetBillingAccount,
    DeletePurchaseOrder,
    SavePurchaseOrder
} = require('./billingaccount.controller');

import {requireLoginApi} from '../../middlewares/AuthUserCheckMiddleware';

const router = new Router();

router.get('/', [requireLoginApi, GetBillingAccounts]);
router.get('/:id', [requireLoginApi, GetBillingAccount]);
router.post('/:id/po', [requireLoginApi, SavePurchaseOrder])
router.delete('/:id/po', [requireLoginApi, DeletePurchaseOrder]);
//router.put('/', CreateBillingAccount);



module.exports = router;
