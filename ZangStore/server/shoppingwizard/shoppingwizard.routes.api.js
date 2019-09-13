import express from 'express'
import cors from 'cors'
import {
  // viewProductWizard,
  getWizardDefaults,
  // getOfferInfo,
  // controllerGetOffersByCategory
} from './shoppingwizard.controller'

const router = express.Router()
// router.get('/category/:category', controllerGetOffersByCategory);
// router.get('/:slug/wizard', cors(), getProductWizardInfo);
router.get('/:slug/wizarddefaults', getWizardDefaults);
// router.get('/:slug/info', getOfferInfo);



export default router
