const { Router } = require('express');
const { triggerClock12Hour } = require('./controller');
const BaseController = require('../../../api/controllers/BaseController');

const router = new Router();



module.exports = router;
