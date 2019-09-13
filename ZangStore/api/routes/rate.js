import express from 'express'
var BaseController = require('../../controllers/BaseController');
var LongDistanceRateController = require('../controllers/LongDistanceRateController');

const router = express.Router()

router.post('/long-distance/providers/:provider/import', [BaseController.authorizeAdmin, LongDistanceRateController.import]);
router.get('/long-distance/search', LongDistanceRateController.search);
export default router