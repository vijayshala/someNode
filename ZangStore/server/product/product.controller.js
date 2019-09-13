const ns = '[product.controller]';
const logger = require('applogger');

const { ProductBackend } = require('./product.backend');
const { BadRequestError } = require('../modules/error');

/**
 * /api/products/:slug
 *
 * Return product by ID
 *
 * @param  {String} slug      product identifier
 * @param  {String} id-type   identifier type, can be '_id', 'identifier'. Default is 'identifier'
 * @param  {String} populate  if populate fields, can be one of many 'children'. Separated by comma ','.
 */
const getProduct = async(req, res, next) => {
  const fn = `[${req.requestId}]${ns}[getProduct]`;
  const slug = req.params.slug;
  const identifierType = req.query['id-type'] || 'identifier';
  const populate = (req.query.populate && req.query.populate.split(',')) || [];
  logger.info(fn, 'slug=', slug, 'identifierType=', identifierType, 'populate=', populate);

  try {
    if (['_id', 'identifier'].indexOf(identifierType) === -1) {
      throw new BadRequestError();
    }
    if (identifierType === '_id' && !slug.match(/^[0-9a-f]{24}$/)) {
      throw new BadRequestError('Invalid ID');
    }

    let product = await ProductBackend.findOneByIdentifier(slug, {
      requestId: req.requestId,
      localizer: req.localizer,
      identifierType,
      populate,
    });
    logger.info(fn, 'product:', product);

    res.status(200).json({
      error: false,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * /api/products
 *
 * Return products by tags or [TODO]
 *
 * @param  {String} tags       tag list
 * @param  {String} populate  if populate fields, can be one of many 'children'. Separated by comma ','.
 */
const getProducts = async(req, res, next) => {
  const fn = `[${req.requestId}]${ns}[getProduct]`;
  const slug = req.params.slug;
  const tags = (req.query.tags && req.query.tags.split(',')) || [];
  const populate = (req.query.populate && req.query.populate.split(',')) || [];
  logger.info(fn, 'slug=', slug, 'tags=', tags, 'populate=', populate);

  try {
    if (!tags || tags.length === 0) {
      throw new BadRequestError('Tag list (tags) is required');
    }

    let products = await ProductBackend.findAllByIdentifiers(tags, {
      requestId: req.requestId,
      localizer: req.localizer,
      populate,
    });
    logger.info(fn, 'products:', products);

    res.status(200).json({
      error: false,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProduct,
  getProducts,
};
