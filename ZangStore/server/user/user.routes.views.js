
import express from 'express'
import cors from 'cors'
import {requireLoginPage} from '../../middlewares/AuthUserCheckMiddleware';
import { getUserMe } from './user.controller'

const router = express.Router()
// router.get('/me/', cors(), getUserMe);
export default router
