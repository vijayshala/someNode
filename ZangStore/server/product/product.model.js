const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

const {
  PRODUCT_TYPES,
  PRODUCT_TYPE_SIMPLE,
  PRODUCT_TABLE_NAME,
  PRODUCT_STATUSES,
  PRODUCT_STATUS_PUBLISHED,
  PRODUCT_ATTRIBUTE_VALUE_TYPE_STRING,
  PRODUCT_ATTRIBUTE_VALUE_TYPES
} = require('./product.constants');

let ProductSchemaDef = new Schema({
  type: {
    type: String,
    enum: PRODUCT_TYPES,
    default: PRODUCT_TYPE_SIMPLE,
    required: true,
  },
  status: {
    type: String,
    enum: PRODUCT_STATUSES,
    default: PRODUCT_STATUS_PUBLISHED,
    required: true,
  },

  // if a product is inherited from another product,
  // these informations will inherit (and can be overwritten) from parent
  // - engines
  // - attributes
  // - taxStatus, taxCodes
  // these informations will NOT inherit from parent
  // - status
  // - identifier
  // - title, shortTitle, description, shortDescription, images
  // - tags
  // IMPORTANT ASSUMPTION: currently backend only handles 2 levels tree
  parent: {
    _id: {
      type: Schema.Types.ObjectId,
      ref: PRODUCT_TABLE_NAME
    },
    identifier: String
  },

  // unique identifier
  identifier: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    text: String,
    resource: String
  },
  shortTitle: {
    text: String,
    resource: String
  },
  description: {
    text: String,
    resource: String
  },
  shortDescription: {
    text: String,
    resource: String
  },
  // FIXME: should we deprecate shortTitle, description, shortDescription?
  descriptions: [{
    identifier: {
      type: String,
      required: true
    },
    text: String,
    resource: Schema.Types.Mixed,
  }],
  images: [{
    identifier: {
      type: String,
      required: true
    },
    url: String,
  }], //list of images

  engines: [{
    type: String
  }],

  taxStatus: {
    type: String
  }, //taxable, shipping and none. Default is taxable.
  taxCodes: [{
    type: String
  }],

  // attribute describes the product itself
  //
  // Example 1:
  // attriubte is "static", the end-user cannot adjust it.
  // {
  //   identifier: 'color',
  //   title: {
  //     text: 'Color',
  //   },
  //   isStatic: true,
  //   valueType: 'string',
  //   value: 'red',
  // }
  // this particular product color is red. No matter how the end-user buys this,
  // it's always red.
  //
  // Example 2:
  // an attribute "size" is non-static, which describe T-Shirt Size,
  // {
  //   identifier: 'size',
  //   title: {
  //     text: 'Size',
  //   },
  //   isStatic: false,
  //   valueType: 'string',
  //   value: 'L',
  //   helper: {
  //     display: 'dropdown',
  //     choices: ['XS', 'S', 'L', 'XL', 'XXL'],
  //     sizeTableUrl: 'http://......',
  //   },
  //   tags: ['display-options'],
  // }
  // the end-user can choose to buy XL size before addint to shopping cart
  //
  // Example 3:
  // this describe one feature of Zang Office product
  // {
  //   identifier: 'music_on_hold',
  //   title: {
  //     text: 'Music On Hold',
  //   },
  //   isStatic: false,
  //   valueType: 'boolean',
  //   helper: {
  //     category: 'billing',
  //   },
  //   tags: ['zangoffice-features'],
  // }
  // The end-user can choose to buy or not buy this feature based on SalesModel
  attributes: [{
    identifier: { // should be unique within the product
      type: String,
      required: true
    },
    title: {
      text: String,
      resource: String,
    },
    // if the attribute can be overwritten by salesmodel or end-user
    isStatic: {
      type: Boolean,
      default: false,
    },
    valueType: {
      enum: PRODUCT_ATTRIBUTE_VALUE_TYPES,
      default: PRODUCT_ATTRIBUTE_VALUE_TYPE_STRING,
      type: String,
    },
    value: {
      type: String,
    },
    // extra helper information of the attribute
    // different attribute may have require extra information
    helper: Schema.Types.Mixed,
    // use tags to group different purpose of features
    tags: [{
      type: String
    }],
  }],

  // let's leave it here and revisit later
  // groupedProducts: [{
  //   // _id: false,
  //   type: {
  //     type: String,
  //     "enum": [PRODUCT_BUNDLE_TYPE_LINKED, PRODUCT_BUNDLE_TYPE_GROUPED],
  //     required: true
  //   },
  //   qty: {
  //     type: Number,
  //     default: 0
  //   },
  //   product: {
  //     _id: {
  //       type: Schema.Types.ObjectId,
  //       ref: PRODUCT_TABLE_NAME
  //     },
  //     identifier: String
  //   },
  //   sort: Number,
  // }],

  // reserve categories for future, because category could be from another collection
  // we use tags for now
  tags: [{
    type: String
  }],

  created: {
    by: Schema.Types.ObjectId,
    on: Date
  },
  updated: {
    by: Schema.Types.ObjectId,
    on: Date
  }
});

ProductSchemaDef.set('toJSON', {
  getters: true,
  virtuals: true
});
ProductSchemaDef.set('toObject', {
  getters: true,
  virtuals: true
});

const ProductSchema = mongoose.model(PRODUCT_TABLE_NAME, ProductSchemaDef);

module.exports = { ProductSchema };
