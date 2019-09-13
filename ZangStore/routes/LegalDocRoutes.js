var ns = '[LegalDocumentRoutes]';
var express = require('express');
var csrf = require('csurf');
var router = express.Router();
var LegalDocController = require('../controllers/LegalDocController');


router.get('/', LegalDocController.index)
router.get('/:slug', LegalDocController.doc)




module.exports = router;
