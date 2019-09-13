import express from 'express'
var BaseController = require('../controllers/BaseController');
var TaskController = require('../controllers/taskhandle');

const router = express.Router()

router.post('/run', [BaseController.authorizeAdminApi, TaskController.run]);
router.post('/run_proxied', [BaseController.authorizeAdminApi, TaskController.run_proxied]);
router.get('/run/:id', [BaseController.authorizeAdminApi, TaskController.runStatus]);
export default router