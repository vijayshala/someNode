import express from 'express'
import cors from 'cors'

import {
  apiSubMenu
} from './webapp.controller';

const router = express.Router()
router.get('/submenus/:route', apiSubMenu);
export default router
