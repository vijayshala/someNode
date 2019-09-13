import express from 'express'
import csrf from 'csurf'
import AppAuthController from '../controllers/AppAuthController'

const ns = '[CartRoutes]'
const router = express.Router()

router.get('/login', AppAuthController.login);
router.get('/callback', AppAuthController.callback);
router.get('/logout', AppAuthController.logout);
router.get('/logmeout', AppAuthController.logmeout);
export default router