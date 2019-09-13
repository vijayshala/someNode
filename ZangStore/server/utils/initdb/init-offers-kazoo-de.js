const logger = require('applogger');

const { OfferBackend } = require('../../offer/offer.backend');
const { SalesModelBackend } = require('../../salesmodel/salesmodel.backend');

const initKazooOffersDe = async(options) => {
  const fn = `[initKazooOffersDe]`;
  const collection = 'offer';
  options = Object.assign({
    emptyCollection: false,
  }, options);

  let doc, docs;

  logger.info(fn, `loading salesmodels...`);
  const salesModels = await SalesModelBackend.find();
  if (!salesModels || !salesModels.length) {
    throw new Error('SalesModel is empty');
  }
  logger.info(fn, `${salesModels.length} salesmodels found.`);
  const salesModelsMap = {};
  salesModels.forEach((one) => {
    salesModelsMap[one.identifier] = one;
  });

  if (options.emptyCollection) {
    logger.info(fn, `empty ${collection}s collection...`);
    await OfferBackend.remove();
  }

  doc = {
    identifier: 'uc-de',
    slug: 'uc-de',
    title: {
      text: 'We have the right solution for you!',
      resource: 'UC_OFFER_TITLE'
    },
    
    description: {
      text: 'Regardless of whether you are a small, medium-sized or large corporation, we have what you\'re looking for! What type of business are you?',
      resource: 'UC_OFFER_DESCRIPTION'
    },
    displaySequence: 0,
    allowed_regions:['DE']
  };
  logger.info(fn, `creating "${doc.identifier}" ...`);
  let result = await OfferBackend.findOneAndUpdate({
    identifier: doc.identifier,
  }, doc, { upsert: true, new: true, returnNewDocument: true });
  logger.info(fn, `    "${doc.identifier}" created`, result);

  docs = [{
    identifier: 'avaya-office-sb-de',
    active: true,
    slug: 'avaya-office-sb-de',
    title: {
      text: 'Avaya Office (DE)',
      resource: 'AVAYA_OFFICE_KZ'
    },
    parent: {
      _id: result._id,
      identifier: 'uc',
    },
    salesModels: [{
      salesModel: {
        identifier: 'avaya-office-sb-de-monthly',
        _id: salesModelsMap['avaya-office-sb-de-monthly'] && salesModelsMap['avaya-office-sb-de-monthly']._id,
      }
    }],
    displaySequence: 0,
    allowed_regions:['DE'],
    tags: ['avaya-office-sb']
  }];

  for (let doc of docs) {
    logger.info(fn, `creating "${doc.identifier}" ...`);
    let result = await OfferBackend.findOneAndUpdate({
      identifier: doc.identifier,
    }, doc, { upsert: true, returnNewDocument: true });
    logger.info(fn, `    "${doc.identifier}" created`, result);
  }
};

module.exports = initKazooOffersDe;
