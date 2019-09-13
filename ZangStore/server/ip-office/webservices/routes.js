const { Router } = require('express');
const { getStatus } = require('./controller');

const router = new Router();

router.get('/', getStatus);

module.exports = router;
