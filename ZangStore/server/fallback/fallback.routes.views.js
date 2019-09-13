import express from 'express'
import { browserRedirect } from './fallback.controller';


const router = express.Router()
router.get('/', [browserRedirect]);
export default router
