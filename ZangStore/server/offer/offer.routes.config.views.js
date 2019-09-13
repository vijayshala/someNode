import express from 'express'
import cors from 'cors'
import {requireLoginPage} from '../../middlewares/AuthUserCheckMiddleware';

import {
  viewOfferRegionAutoDetect  
} from './offer.controller'


const router = express.Router()
router.get('/:offerType', [viewOfferRegionAutoDetect]);
export default router
