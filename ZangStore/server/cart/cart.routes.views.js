import express from 'express'
import {requireLoginPage} from '../../middlewares/AuthUserCheckMiddleware';
import cors from 'cors'
import {
  viewCart,
  viewCheckout
} from './cart.controller'

const router = express.Router({mergeParams: true})
router.get('/', [requireLoginPage, viewCart]);
router.get('/checkout', [requireLoginPage, viewCheckout]);

export default router

