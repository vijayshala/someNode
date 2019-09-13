const { Router } = require('express');
const { getProduct, getProducts } = require('./product.controller');
const router = new Router();

router.get('/', getProducts);
router.get('/:slug', getProduct);

module.exports = router;
