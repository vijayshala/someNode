const ns = '[event.hooks.process-salesmodel-rules]';
const logger = require('applogger');

const { BadRequestError } = require('../../error');

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const emitter = this;
  const U = require('../../utils');
  let payload = context.order || context.cart || context.quote;

  logger.info(fn, 'started', 'payload id=', payload && payload._id);
  if (!payload) {
    return next(new BadRequestError('Cannot find cart or order payload'));
  }

  U.P()
    .then(async() => {
      const CARTHANDLER = require('../../cart-salesmodel-rules');
      const { SalesModelBackend } = require('../../../salesmodel/salesmodel.backend');
      const { OfferBackend } = require('../../../offer/offer.backend');

      const ch = new CARTHANDLER(context.user);
      const options = {
        requestId: context.requestId,
      };

      // find all Offers used in the cart
      let identifierType = '_id';
      let offerIds = (payload && payload.items && payload.items.map((one) => {
        if (one && one.offer && one.offer._id) {
          return one.offer._id;
        } else {
          identifierType = 'identifier';
          return (one && one.offer && one.offer.identifier) || null;
        }
      }).filter((one) => {
        // remove empty items
        return one;
      })) || [];
      // load Offers
      if (offerIds && offerIds.length) {
        // find unique
        offerIds = [...new Set(offerIds)];
        const offers = await OfferBackend.findAllByIdentifiers(offerIds, { ...options, identifierType });
        if (offers.length > 0) {
          ch.initOffersMapping(offers);
        } else {
          logger.warn(fn, 'Failed to find offer(s): ' + offerIds.join(', '));
        }
      } else if (payload && payload.items && payload.items.length) {
        logger.warn(fn, 'Cart is not empty, but no offer found');
      }

      // find all SalesModels used in the cart
      identifierType = '_id';
      let salesModelIds = (payload && payload.items && payload.items.map((one) => {
        if (one && one.salesModel && one.salesModel._id) {
          return one.salesModel._id;
        } else {
          identifierType = 'identifier';
          return (one && one.salesModel && one.salesModel.identifier) || null;
        }
      }).filter((one) => {
        // remove empty items
        return one;
      })) || [];
      // load SalesModels
      if (salesModelIds && salesModelIds.length) {
        // find unique
        salesModelIds = [...new Set(salesModelIds)];
        const salesModels = await SalesModelBackend.findAllByIdentifiers(salesModelIds, { ...options, identifierType });
        if (salesModels.length > 0) {
          ch.initSalesModelsMapping(salesModels);
        } else {
          logger.warn(fn, 'Failed to find salesmodel(s): ' + salesModelIds.join(', '));
        }
      } else if (payload && payload.items && payload.items.length) {
        logger.warn(fn, 'Cart is not empty, but no salesmodel found');
      }

      ch.update(payload);
      const logs = ch.logging.getAll();
      if (logs.infos && logs.infos.length > 0) {
        logger.info(fn, 'update cart handler informations:', JSON.stringify(logs.infos));
        emitter.importInfos(context.event, logs.infos);
      }
      if (logs.warnings && logs.warnings.length > 0) {
        logger.info(fn, 'update cart handler warnings:', JSON.stringify(logs.warnings));
        emitter.importWarnings(context.event, logs.warnings);
      }
      if (logs.errors && logs.errors.length > 0) {
        logger.info(fn, 'update cart handler errors:', JSON.stringify(logs.errors));
        emitter.importErrors(context.event, logs.errors);
        throw new BadRequestError('Cart is invalid', logs.errors);
      }

      // logger.info(fn, 'cart rules processed', JSON.stringify(payload));
      logger.info(fn, 'cart rules processed');
    })
    .then(() => {
      next();
    })
    .catch((err) => {
      logger.error(fn, 'Error:', err);
      next(err);
    });
};

module.exports = processEvent;
