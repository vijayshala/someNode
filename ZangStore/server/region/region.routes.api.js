const ns = '[region.routes.api]'
import { Router } from 'express';
import logger from 'applogger'
import { requireLoginApi } from '../../middlewares/AuthUserCheckMiddleware';
import BaseController from '../../controllers/BaseController'
import constants from '../../config/constants';
import { 
  getCountries, getCountryByCode,
  getRegions, getRegionByCode, getRegionsByPartner
} from './region.controller';


const router = new Router();


router.get('/', getRegions);
router.get('/partners/:partnerId', getRegionsByPartner);
router.get('/code/:shortCode', getRegionByCode);

router.get('/countries', [getCountries]);
router.get('/countries/code/:countryCode', [getCountryByCode]);
export default router;