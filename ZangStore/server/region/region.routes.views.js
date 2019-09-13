const ns = '[region.routes.api]'
import { Router } from 'express';
import logger from 'applogger'
import { requireLoginApi } from '../../middlewares/AuthUserCheckMiddleware';
import BaseController from '../../controllers/BaseController'
import constants from '../../config/constants';
import { 
  viewChooseRegion
} from './region.controller';


const router = new Router();


router.get('/choose', viewChooseRegion);

export default router;