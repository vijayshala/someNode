const ns = '[offer.backend]';
const logger = require('applogger');

const { DbBase } = require('../modules/db/index');
const { OfferSchema } = require('./offer.model');
const { SalesModelBackend } = require('../salesmodel/salesmodel.backend');

class OfferBackend extends DbBase {
  async findOneByIdentifier(identifier, options) {
    let fn = `[${options.requestId}]${ns}[findOneByIdentifier]`;

    options = Object.assign({
      identifierType: 'slug',
      populate: [],
    }, options);
    // logger.info(fn, 'options:', options);
    logger.info(fn, 'identifier:', identifier);

    let offer = await this.findOneBy(options.identifierType, identifier, options);

    // sort .salesModels by displaySequence
    offer.salesModels.sort((a, b) => {
      const sa = a.displaySequence || 0;
      const sb = b.displaySequence || 0;
      return sa - sb;
    });

    // logger.info(fn, 'offer:', offer);

    // populate children
    if (options.populate.indexOf('children') > -1) {
      offer.children = await this.find({
        'parent._id': offer._id
      }, { ...options, sort: { displaySequence: 1 } });
    }

    // populate salesmodel
    if (options.populate.indexOf('salesmodel') > -1) {
      const salesModelIds = offer.salesModels.map((one) => one.salesModel._id);
      if (salesModelIds && salesModelIds.length) {
        const salesModels = await SalesModelBackend.find({
          _id: { $in: salesModelIds },
        }, options);
        let salesModelMaps = {};
        salesModels.forEach((one) => {
          salesModelMaps[one._id] = one;
        });
        for (let i in offer.salesModels) {
          offer.salesModels[i].salesModel = salesModelMaps[offer.salesModels[i].salesModel._id];
        }
      }
    }

    return offer;
  }

  async findOneByIdentifierWithPupulateAll(identifier, options) {
    let fn = `[${options.requestId}]${ns}[findOneByIdentifierWithPupulateAll]`;
    options = Object.assign({
      identifierType: 'slug',
      populate: ['children', 'salesmodel'],
    }, options);
    // logger.info(fn, 'options:', options);
    logger.info(fn, 'identifier:', identifier);
    let offer = await this.findOneByIdentifier(identifier, options);
    let salesModelIds = [];

    for (var child of offer.children) {
      for (var slm of child.salesModels) {
        salesModelIds.push(slm.salesModel._id);
      }
    }
    logger.info(fn, 'salesModelIds:', salesModelIds);

    if (salesModelIds && salesModelIds.length) {
      let salesModels = await SalesModelBackend.find({
        _id: { $in: salesModelIds },
      }, {});
      let salesModelMaps = {};

      salesModels.forEach((one) => {
        salesModelMaps[one._id] = one;
      });

      // logger.info(fn, 'salesModelMaps:', salesModelMaps);
      var newChildren = [];
      for (var child of offer.children) {
        let childSalesModel = []
        for (var slm of child.salesModels) {
          slm.salesModel = salesModelMaps[slm.salesModel._id]
          childSalesModel.push(slm);
        }
        child.salesModels = childSalesModel;
        newChildren.push(child);
      }
    }
    offer.children = newChildren;
    return offer;
  }

  async findOfferByRegions(region, options) {
    let fn = `[${options.requestId}]${ns}[findOfferByRegions]`;
    options = Object.assign({
      identifierType: 'tags',
      populate: [],
    }, options);
    let query = {
      active: true,
      allowed_regions: region,
      salesModels: { "$exists": true }
    }
    console.log('QUERY', query)
    let offers = await this.find(query);
    
    return offers;
  }


  /**
   * [findAllByIdentifiers description]
   * @param  {Array} identifiers  what we looking for
   * @param  {Object} options     options to adjust query
   *                              - identifierType: tags, or _id
   * @return {Array}              all matched SalesModels
   */
  async findAllByIdentifiers(identifiers, options) {
    let fn = `[${options.requestId}]${ns}[findAllByIdentifiers]`;

    options = Object.assign({
      identifierType: 'tags',
      populate: [],
    }, options);
    logger.info(fn, 'options:', options);
    logger.info(fn, 'identifiers:', identifiers);

    let query = {};
    query[options.identifierType] = { $in: identifiers };
    let offers = await this.find(query, { ...options, sort: { displaySequence: 1 } });

    // sort .salesModels by displaySequence
    for (let i in offers) {
      offers[i].salesModels.sort((a, b) => {
        const sa = a.displaySequence || 0;
        const sb = b.displaySequence || 0;
        return sa - sb;
      });
    }

    logger.info(fn, 'offers:', offers.map((one) => one.identifier));

    // populate children
    if (options.populate.indexOf('children') > -1) {
      for (let i in offers) {
        offers[i].children = [];
      }
      const offerIds = offers.map((one) => one._id);
      const children = await this.find({
        'parent._id': { $in: offerIds }
      }, { ...options, sort: { displaySequence: 1 } });

      children.forEach((child) => {
        const parentId = '' + child.parent._id;
        for (let i in offers) {
          if ('' + offers[i]._id === parentId) {
            offers[i].children.push(child);
          }
        }
      });
    }

    // populate salesmodel
    if (options.populate.indexOf('salesmodel') > -1) {
      const salesModelIds = offers.reduce((accumulator, offer) => {
        const oneSalesModelIds = offer.salesModels.map((one) => one.salesModel._id);
        return [...accumulator, ...oneSalesModelIds];
      }, []);
      if (salesModelIds && salesModelIds.length) {
        const salesModels = await SalesModelBackend.find({
          _id: { $in: salesModelIds },
        }, options);
        let salesModelsMap = {};
        salesModels.forEach((one) => {
          salesModelsMap[one._id] = one;
        });
        for (let i in offers) {
          for (let j in offers[i].salesModels) {
            offers[i].salesModels[j].salesModel = salesModelsMap[offers[i].salesModels[j].salesModel._id];
          }
        }
      }
    }

    return offers;
  }

}

let backend = new OfferBackend(OfferSchema, {});

module.exports = {
  OfferBackend: backend,
};
