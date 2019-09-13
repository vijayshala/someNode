const logger = require('applogger');

const { OfferBackend } = require('../../offer/offer.backend');
const { SalesModelBackend } = require('../../salesmodel/salesmodel.backend');

const initSpacesOffers = async (options) => {
  const fn = `[initSpacesOffers]`;
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
    identifier: 'collaborations-de',
    slug: 'collaborations-de',
    title: {
      text: 'Your meeting room of the future has arrived with messaging, file uploading, video and audio conferencing.',
      resource: 'SPACES_OFFER_TITLE'
    },
    description: {
      text: 'Avaya Spaces is a cloud-based team collaboration and meeting app. It seamlessly integrates voice, video, tasks, sharing and more into one app you can access anywhere. Use it on your laptop at work, your tablet at home, your phone on-the-go, or even from your space computer in the dark depths of outer space (well, that last one could be an exaggeration).',
      resource: 'SPACES_OFFER_DESCRIPTION'
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
    identifier: 'avaya-spaces-de',
    active: true,
    slug: 'avaya-spaces-de',
    title: {
      text: 'Avaya Spaces (DE)',
      resource: 'AVAYA_SPACES'
    },
    parent: {
      _id: result._id,
      identifier: 'collaborations-de',
    },
    salesModels: [{
      salesModel: {
        identifier: 'spaces-solution-monthly-de',
        _id: salesModelsMap['spaces-solution-monthly-de'] && salesModelsMap['spaces-solution-monthly-de']._id,
      }
    }, {
      salesModel: {
        identifier: 'spaces-solution-yearly-de',
        _id: salesModelsMap['spaces-solution-yearly-de'] && salesModelsMap['spaces-solution-yearly-de']._id,
      }
    }
    ],
    displaySequence: 0,
    allowed_regions:['DE'],
    tags: ['avaya-spaces']
  }];

  for (let doc of docs) {
    logger.info(fn, `creating "${doc.identifier}" ...`);
    let result = await OfferBackend.findOneAndUpdate({
      identifier: doc.identifier,
    }, doc, { upsert: true, returnNewDocument: true });
    logger.info(fn, `    "${doc.identifier}" created`, result);
  }
};

module.exports = initSpacesOffers;
