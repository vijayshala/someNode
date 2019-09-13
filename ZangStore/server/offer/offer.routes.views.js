import express from 'express'
import cors from 'cors'
import {requireLoginPage} from '../../middlewares/AuthUserCheckMiddleware';

import {
  viewOffer  
} from './offer.controller'


const router = express.Router()
router.get('/:slug', [requireLoginPage, viewOffer]);
router.get('/*', viewOffer);

export default router
