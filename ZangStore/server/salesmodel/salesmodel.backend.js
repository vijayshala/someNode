const ns = '[salesmodel.backend]';
const logger = require('applogger');

const { DbBase } = require('../modules/db/index');
const { ProductBackend } = require('../product/product.backend');
const { SalesModelSchema } = require('./salesmodel.model');
const {
  SALESMODEL_STATUS_ACTIVE
} = require('./salesmodel.constants');
const {
  PRODUCT_STATUS_PUBLISHED
} = require('../product/product.constants');
const { nonBlockify } = require('../modules/utils');

class SalesModelBackend extends DbBase {
  async _getSalesModelProducts(salesModel) {
    const asyncFindProducts = nonBlockify((salesModel) => {
      let productIdsOfOne = [];
      if (salesModel.product && salesModel.product._id) {
        productIdsOfOne.push(salesModel.product._id);
      }
      salesModel.items.map((one) => {
        if (one.product && one.product._id) {
          productIdsOfOne.push(one.product._id);
        }

        if (one.attributes) {
          one.attributes.map((attr) => {
            if (attr.product && attr.product._id) {
              productIdsOfOne.push(attr.product._id);
            }
          });
        }
      });

      return productIdsOfOne;
    });

    return await asyncFindProducts(salesModel);
  }

  async _applySalesModelProducts(salesModel, productsMap) {
    const asyncApplyProducts = nonBlockify((salesModel) => {
      if (salesModel.product && salesModel.product._id && productsMap[salesModel.product._id]) {
        salesModel.product = productsMap[salesModel.product._id];
      }
      salesModel.items.map((one) => {
        if (one.product && one.product._id && productsMap[one.product._id]) {
          one.product = productsMap[one.product._id];
        }

        if (one.attributes) {
          one.attributes.map((attr) => {
            if (attr.product && attr.product._id && productsMap[attr.product._id]) {
              attr.product = productsMap[attr.product._id];
            }
          });
        }
      });
    });

    return await asyncApplyProducts(salesModel);
  }

  async findOneByIdentifier(identifier, options) {
    let fn = `[${options.requestId}]${ns}[findOneByIdentifier]`;

    options = Object.assign({
      identifierType: 'identifier',
      populate: [],
    }, options);
    logger.info(fn, 'options:', options);
    logger.info(fn, 'identifier:', identifier);

    let query = {
      status: SALESMODEL_STATUS_ACTIVE,
    };
    query[options.identifierType] = identifier;
    let salesModel = await this.findOne(query, {
      ...options,
      populate: options.populate.filter(one => one !== 'product'),
    });

    // sort .items by displaySequence
    salesModel.items.sort((a, b) => {
      const sa = a.displaySequence || 0;
      const sb = b.displaySequence || 0;
      return sa - sb;
    });

    logger.info(fn, 'salesModel:', salesModel);

    // populate product
    if (options.populate.indexOf('product') > -1) {
      const productIds = await this._getSalesModelProducts(salesModel);
      if (productIds && productIds.length) {
        const products = await ProductBackend.find({
          _id: { $in: productIds },
          status: PRODUCT_STATUS_PUBLISHED,
        }, options);
        let productsMap = {};
        products.forEach((one) => {
          productsMap[one._id] = one;
        });

        await this._applySalesModelProducts(salesModel, productsMap);
      }
    }

    return salesModel;
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

    let query = {
      status: SALESMODEL_STATUS_ACTIVE,
    };
    query[options.identifierType] = { $in: identifiers };
    let salesModels = await this.find(query, {
      ...options,
      populate: options.populate.filter(one => one !== 'product'),
    });

    // sort .items by displaySequence
    for (let i in salesModels) {
      salesModels[i].items.sort((a, b) => {
        const sa = a.displaySequence || 0;
        const sb = b.displaySequence || 0;
        return sa - sb;
      });
    }

    logger.info(fn, 'salesModels:', salesModels.map((one) => one.identifier));

    // populate product
    if (options.populate.indexOf('product') > -1) {
      let productIds = [];
      for (let salesModel of salesModels) {
        const productIdsOfOne = await this._getSalesModelProducts(salesModel);
        productIds = productIds.concat(productIdsOfOne);
      }
      if (productIds && productIds.length) {
        const products = await ProductBackend.find({
          _id: { $in: productIds },
          status: PRODUCT_STATUS_PUBLISHED,
        }, options);
        let productsMap = {};
        products.forEach((one) => {
          productsMap[one._id] = one;
        });

        for (let salesModel of salesModels) {
          await this._applySalesModelProducts(salesModel, productsMap);
        }
      }
    }
    return salesModels;
  }
}

let backend = new SalesModelBackend(SalesModelSchema, {});

module.exports = {
  SalesModelBackend: backend,
};
