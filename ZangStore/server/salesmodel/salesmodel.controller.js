const ns = '[salesmodel.controller]';
const logger = require('applogger');

const { SalesModelBackend } = require('./salesmodel.backend');
const { BadRequestError } = require('../modules/error');

/**
 * /api/salesmodels/:slug
 *
 * Return SalesModel by ID
 *
 * @param  {String} slug      SalesModel identifier
 * @param  {String} id-type   identifier type, can be '_id', 'identifier'. Default is 'identifier'
 * @param  {String} populate  if populate fields, can be one of many 'product'. Separated by comma ','.
 */
const getSalesModel = async(req, res, next) => {
  const fn = `[${req.requestId}]${ns}[getSalesModel]`;
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

    let salesModel = await SalesModelBackend.findOneByIdentifier(slug, {
      requestId: req.requestId,
      localizer: req.localizer,
      identifierType,
      populate,
    });
    logger.info(fn, 'salesModel:', salesModel);

    res.status(200).json({
      error: false,
      data: salesModel,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * /api/salesmodels
 *
 * Return SalesModels by tags or [TODO]
 *
 * @param  {String} tags      tag list
 * @param  {String} populate  if populate fields, can be one of many 'product'. Separated by comma ','.
 */
const getSalesModels = async(req, res, next) => {
  const fn = `[${req.requestId}]${ns}[getSalesModel]`;
  const identifierType = req.query['id-type'] || 'identifier';
  const tags = (req.query.tags && req.query.tags.split(',')) || [];
  const populate = (req.query.populate && req.query.populate.split(',')) || [];
  logger.info(fn, 'identifierType=', identifierType, 'tags=', tags, 'populate=', populate);

  try {
    if (!tags || tags.length === 0) {
      throw new BadRequestError('Tag list (tags) is required');
    }

    let salesModels = await SalesModelBackend.findAllByIdentifiers(tags, {
      requestId: req.requestId,
      localizer: req.localizer,
      populate,
    });
    logger.info(fn, 'salesModels:', salesModels);

    res.status(200).json({
      error: false,
      data: salesModels,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSalesModel,
  getSalesModels,
};
