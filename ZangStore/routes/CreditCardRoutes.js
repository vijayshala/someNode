import express from 'express'
import BaseController from '../controllers/BaseController'
import CreditCardController from '../controllers/CreditCardController'

const ns = '[MeRoutes]'
const router = express.Router()

/* GET home page. */
router.get('/creditcard', [BaseController.authenticate, CreditCardController.list]);
router.get('/po', [BaseController.authenticate, CreditCardController.listPO]);
router.post('/creditcard', [BaseController.authenticate, CreditCardController.add])
router.get('/:id/delete', [BaseController.authenticate, CreditCardController.delete])
router.get('/:id/setdefault', [BaseController.authenticate, CreditCardController.setDefault])

export default router
