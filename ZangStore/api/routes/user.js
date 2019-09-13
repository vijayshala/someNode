
import express from 'express'
var BaseController = require('../controllers/BaseController');
var UserController = require('../controllers/user');

const router = express.Router()

router.post('/sync', [BaseController.authorizeAdminApi, UserController.syncUsers]);
export default router