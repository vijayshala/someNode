const { Router } = require('express');
import {requireLoginApi} from '../../middlewares/AuthUserCheckMiddleware';
const { getMyself, setUserLanguages } = require('./user.controller');
const router = new Router();
router.get('/me', [requireLoginApi, getMyself]);
router.post('/me/languages', [requireLoginApi, setUserLanguages]);

module.exports = router;
