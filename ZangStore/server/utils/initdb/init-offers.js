const logger = require('applogger');

const { OfferBackend } = require('../../offer/offer.backend');
const { SalesModelBackend } = require('../../salesmodel/salesmodel.backend');

const initOffers = async(options) => {
  const fn = `[initOffers]`;
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
    identifier: 'uc',
    active: false,
    slug: 'uc',
    title: {
      text: 'We have the right solution for you!',
      resource: 'UC_OFFER_TITLE'
    },
    description: {
      text: 'Regardless of whether you are a small, medium-sized or large corporation, we have what you\'re looking for! What type of business are you?',
      resource: 'UC_OFFER_DESCRIPTION'
    },
    displaySequence: 0,
    allowed_regions:['US']
  };
  logger.info(fn, `creating "${doc.identifier}" ...`);
  let result = await OfferBackend.findOneAndUpdate({
    identifier: doc.identifier,
  }, doc, { upsert: true, new: true, returnNewDocument: true });
  logger.info(fn, `    "${doc.identifier}" created`, result);

  docs = [{
    identifier: 'uc-solution',
    active: true,
    slug: 'uc-solution',
    title: {
      text: 'Avaya Office (US)',
      resource: 'AVAYA_OFFICE',
    },
    parent: {
      _id: result._id,
      identifier: 'uc',
    },
    salesModels: [{
      salesModel: {
        identifier: 'uc-solution-monthly',
        _id: salesModelsMap['uc-solution-monthly'] && salesModelsMap['uc-solution-monthly']._id,
      }
    }, {
      salesModel: {
        identifier: 'uc-solution-yearly',
        _id: salesModelsMap['uc-solution-yearly'] && salesModelsMap['uc-solution-yearly']._id,
      }
    }, {
      salesModel: {
        identifier: 'uc-solution-3-years',
        _id: salesModelsMap['uc-solution-3-years'] && salesModelsMap['uc-solution-3-years']._id,
      },
      isDefault: true
    }, {
      salesModel: {
        identifier: 'uc-solution-5-years',
        _id: salesModelsMap['uc-solution-5-years'] && salesModelsMap['uc-solution-5-years']._id,
      }
    }],
    displaySequence: 0,
    allowed_regions: ['US'],
    tags: ['avaya-office']
  },{
      identifier: 'ip-office-legacy',
      active: false,
    slug: 'ip-office-legacy',
    title: {
      text: 'IP Office (US)',
    },
    // parent: {
    //   _id: result._id,
    //   identifier: 'uc',
    // },
    salesModels: [{
      salesModel: {
        identifier: 'ip-office-legacy-monthly',
        _id: salesModelsMap['ip-office-legacy-monthly'] && salesModelsMap['ip-office-legacy-monthly']._id,
      }
    }, {
      salesModel: {
        identifier: 'ip-office-legacy-yearly',
        _id: salesModelsMap['ip-office-legacy-yearly'] && salesModelsMap['ip-office-legacy-yearly']._id,
      }
    }, {
      salesModel: {
        identifier: 'ip-office-legacy-3-years',
        _id: salesModelsMap['ip-office-legacy-3-years'] && salesModelsMap['ip-office-legacy-3-years']._id,
      },
      isDefault: true
    }, {
      salesModel: {
        identifier: 'ip-office-legacy-5-years',
        _id: salesModelsMap['ip-office-legacy-5-years'] && salesModelsMap['ip-office-legacy-5-years']._id,
      }
    }],
      displaySequence: 0,
      allowed_regions:['US']
  }];

  for (let doc of docs) {
    logger.info(fn, `creating "${doc.identifier}" ...`);
    let result = await OfferBackend.findOneAndUpdate({
      identifier: doc.identifier,
    }, doc, { upsert: true, returnNewDocument: true });
    logger.info(fn, `    "${doc.identifier}" created`, result);
  }
};

module.exports = initOffers;
