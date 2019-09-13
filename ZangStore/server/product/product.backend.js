const ns = '[product.backend]';
const logger = require('applogger');

const { DbBase } = require('../modules/db/index');
const { ProductSchema } = require('./product.model');
const {
  PRODUCT_STATUS_PUBLISHED,
} = require('./product.constants');

class ProductBackend extends DbBase {
  async findOneByIdentifier(identifier, options) {
    let fn = `[${options.requestId}]${ns}[findOneByIdentifier]`;

    options = Object.assign({
      identifierType: 'identifier',
      populate: [],
    }, options);
    logger.info(fn, 'options:', options);

    let query = {
      status: PRODUCT_STATUS_PUBLISHED,
    };
    query[options.identifierType] = identifier;
    let product = await this.findOne(query, options);

    logger.info(fn, 'product:', product);

    // populate children
    if (options.populate.indexOf('children') > -1) {
      product.children = await this.find({
        'parent._id': product._id,
        status: PRODUCT_STATUS_PUBLISHED,
      }, options);
    }

    return product;
  }

  async findAllByIdentifiers(identifiers, options) {
    let fn = `[${options.requestId}]${ns}[findAllByIdentifiers]`;

    options = Object.assign({
      identifierType: 'tags',
      populate: [],
    }, options);
    logger.info(fn, 'options:', options);

    let query = {
      status: PRODUCT_STATUS_PUBLISHED,
    };
    query[options.identifierType] = { $in: identifiers };
    let products = await this.find(query, options);

    logger.info(fn, 'products:', products);

    // populate children
    if (options.populate.indexOf('children') > -1) {
      const productIds = products.map((one) => one._id);
      const childrenProducts = await this.find({
        'parent._id': { $in: productIds },
        status: PRODUCT_STATUS_PUBLISHED,
      }, options);

      for (let i in products) {
        products[i].children = childrenProducts.filter((child) => {
          return '' + products[i]._id === '' + child.parent._id;
        });
      }
    }

    return products;
  }
}

let backend = new ProductBackend(ProductSchema, {});

module.exports = {
  ProductBackend: backend,
};
