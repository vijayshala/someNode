const { Router } = require('express');
const { getSalesModel, getSalesModels } = require('./salesmodel.controller');
const router = new Router();

router.get('/', getSalesModels);
router.get('/:slug', getSalesModel);

module.exports = router;
