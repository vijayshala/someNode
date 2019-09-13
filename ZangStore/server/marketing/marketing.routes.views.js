import express from 'express'
import { regionHandler } from '../region/region.constants'
import cors from 'cors'
import {requireLoginPage} from '../../middlewares/AuthUserCheckMiddleware';

import {
  view, rootView, viewWithSlug
} from './marketing.controller';




const router = express.Router({mergeParams: true})
//should redirect
// router.get('/', rootView);
// router.get('/home', view);
router.get('/*', [viewWithSlug]);

export default router
