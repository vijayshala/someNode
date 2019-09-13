const ns = '[ip-office][event-hooks][send-tos-email]';
const logger = require('applogger');

const { BadRequestError, ServerInternalError } = require('../../modules/error');
const { PRODUCT_ENGINE_NAME } = require('../constants');

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const U = require('../../modules/utils');
  const { cartHasProductsOf } = require('../../modules/cart-salesmodel-rules/utils');
  const sendgrid = require('../../modules/email/sendgrid');
  let purchasedPlan = context.purchasedPlan;
  const ipofficeItemIndexes = purchasedPlan && cartHasProductsOf(purchasedPlan, PRODUCT_ENGINE_NAME);

  logger.info(fn, 'started', 'purchased plan id=', purchasedPlan && purchasedPlan._id);
  if (!purchasedPlan || !ipofficeItemIndexes) {
    logger.info(fn, `No "${PRODUCT_ENGINE_NAME}" product found in purchased plan, skipped`);
    return next();
  }
  const ipofficeItemIndex = ipofficeItemIndexes && ipofficeItemIndexes[0];
  logger.info(fn, 'ipofficeItemIndex=', ipofficeItemIndex);
  const ipofficeItem = purchasedPlan.items[ipofficeItemIndex];
  logger.info(fn, 'ipofficeItem=', ipofficeItem && ipofficeItem.identifier);
  const ipofficeItemLegalDocuments = ipofficeItem && ipofficeItem.legalDocuments;
  logger.info(fn, 'ipofficeItemLegalDocuments=', JSON.stringify(ipofficeItemLegalDocuments));
  if (!ipofficeItemLegalDocuments || !ipofficeItemLegalDocuments[0]) {
    logger.info(fn, `No legal documents found, skipped`);
    return next();
  }
  if (ipofficeItemLegalDocuments && ipofficeItemLegalDocuments[1]) {
    logger.warn(fn, `There are more than one legal documents:`, JSON.stringify(ipofficeItemLegalDocuments));
  }
  const ipofficeLegalDocument = ipofficeItemLegalDocuments.find(one => one.identifier === 'ipoffice-term-conditions');
  if (!ipofficeLegalDocument) {
    logger.warn(fn, `No Avaya Cloud legal document found`);
    return next();
  }

  U.P()
    .then(async() => {
      if (!ipofficeLegalDocument.version) {
        logger.warn(fn, 'legal doc doesn\'t have version', JSON.stringify(ipofficeLegalDocument));
        throw new ServerInternalError('Legal document doesn\'t have version');
      }
      if (!ipofficeLegalDocument.pdf) {
        logger.warn(fn, 'legal doc doesn\'t have pdf', JSON.stringify(ipofficeLegalDocument));
        throw new ServerInternalError('Legal document doesn\'t have PDF link');
      }

      let emailConfig = {
        requestId: context.requestId,
        toEmail: purchasedPlan.contact.email,
        firstName: purchasedPlan.contact.firstName,
        lastName: purchasedPlan.contact.lastName,
        TOSversion: ipofficeLegalDocument.version,
        TOSlink: ipofficeLegalDocument.pdf
      }

      logger.info(fn, ':emailConfig', JSON.stringify(emailConfig));

      //await sendgrid.sendLegalDocEmail(emailConfig);

      logger.info(fn, 'TOS email sent', JSON.stringify(emailConfig));
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
