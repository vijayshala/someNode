const { Router } = require('express');
const { initDB, initCountriesDB, initRegionsDB } = require('./initdb');
const { migrateLegacyModel } = require('./migrate');
const BaseController = require('../../controllers/BaseController');
const router = new Router();

router.get('/init-db', [BaseController.authorizeAdmin, initDB]);
// router.get('/init-countries-db', [BaseController.authorizeAdmin, initCountriesDB]);
router.get('/init-regions-db', [BaseController.authorizeAdmin, initRegionsDB]);
router.get('/migrate-legacy-orders', [BaseController.authorizeAdmin, migrateLegacyModel])

module.exports = router;
 