const { Router } = require('express');
const { resolveNumbers } = require('./did.controller');
const router = new Router();

router.get('/availablenumbers/:provider/:country/:prefix', resolveNumbers);

module.exports = router;
