import express from 'express'
import cors from 'cors'

import {
  viewOffer  
} from './offer.controller'


const router = express.Router()
router.get('/:slug', viewOffer);



export default router
