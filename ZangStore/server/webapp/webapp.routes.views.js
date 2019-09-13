import express from 'express'
import cors from 'cors'

import {
  viewWebApp
} from './webapp.controller';

const router = express.Router()
router.get('/*', viewWebApp);
export default router
