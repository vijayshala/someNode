const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

const {
  PRODUCT_TABLE_NAME,
  PRODUCT_ATTRIBUTE_VALUE_TYPE_STRING,
  PRODUCT_ATTRIBUTE_VALUE_TYPES
} = require('../product/product.constants');

const {
  SALESMODEL_TABLE_NAME,
  SALESMODEL_STATUSES,
  SALESMODEL_STATUS_ACTIVE,
  SALESMODEL_ITEM_TYPES,
  SALESMODEL_SUBSCRIPTION_MONTH,
  SALESMODEL_SUBSCRIPTION_CYCLES
} = require('./salesmodel.constants');

const { LegalDocumentSchema, RuleSchema } = require('../modules/utils/universal-schemas');

const UniversalSalesModelProperties = {
  // identifier usually is used for unique url path
  identifier: {
    type: String,
    required: true,
  },

  // what's type of the node
  type: {
    type: String,
    enum: [SALESMODEL_ITEM_TYPES],
  },
  product: { // only required if type=product
    _id: {
      type: Schema.Types.ObjectId,
      ref: PRODUCT_TABLE_NAME
    },
    identifier: String,
    engines: [{
      type: String
    }],
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
  // list of extra descriptions
  // Example:
  // [{
  //    identifier: 'cart-title',
  //    text: 'This text will be diplayed in cart if the item is added',
  //    resource: ['ITEM_X_CART_TITLE'],
  // }]
  // FIXME: should we deprecate shortTitle, description, shortDescription?
  descriptions: [{
    identifier: {
      type: String,
      required: true
    },
    text: String,
    resource: Schema.Types.Mixed,
  }],
  // list of images
  images: [{
    identifier: {
      type: String,
      required: true
    },
    url: String,
  }],

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

  // references code/ID on other systems
  references: {},
  // use tags to group different purpose of items
  tags: [{
    type: String,
  }],
  // legal documents requires user's attention related to this sales model
  legalDocuments: [LegalDocumentSchema],

  // instructions for front-end
  isPrimary: Boolean, // if this item has siblings, this is the primary item
  hideInCart: Boolean, // if this item should display in cart
  defaultQuantity: Number, // initial quantity the user see the sales model
  quantityUnit: String, // quantity unit can be "GB" if we selling storage. it's for display purpose
  regularPrice: Number, // this is for display purpose, the regularPrice may be displayed as crossing-out

  // quantity related constraints, will be handled by "universal-quantity-restriction"
  minQuantity: Number,
  maxQuantity: Number,
  followParentQuantity: Boolean,

  // charging model
  isOneTimeCharge: Boolean,
  // price
  // - for onetime charge, this is the real price
  // - for subscriptions, this is the price for each billing cycle
  price: Number,

  // special rules
  rules: [RuleSchema],
  
  allowed_regions: [{
    type: String, //'all means all regions
  }],
  restriced_regions: [{
    type: String,
  }],

  // controls display sequence
  displaySequence: {
    type: Number,
    default: 0,
  },
};

const SalesModelSchemaDef = new Schema({
  status: {
    type: String,
    enum: SALESMODEL_STATUSES,
    default: SALESMODEL_STATUS_ACTIVE
  },

  // salesmodel itself life cycle, when to start, when to expire
  lifeCycle: {
    startAt: Date, // the SalesModel won't be available before this date
    expireAt: Date, // after expireAt, the SalesModel should be marked as inactive
  },

  // currency of the price
  currency: {
    type: String,
    default: 'USD',
  },

  // all items not one-time charge will follow this subscription cycle
  subscription: {
    contractLength: {
      type: Number,
      default: 0,
    }, //0= never expires, 1-52
    contractPeriod: {
      type: String,
      enum: SALESMODEL_SUBSCRIPTION_CYCLES,
      default: SALESMODEL_SUBSCRIPTION_MONTH,
    },
    billingInterval: Number, //0-6
    billingPeriod: {
      type: String,
      enum: SALESMODEL_SUBSCRIPTION_CYCLES,
      default: SALESMODEL_SUBSCRIPTION_MONTH,
    },
    trialLength: Number,
    trialPeriod: {
      type: String,
      enum: SALESMODEL_SUBSCRIPTION_CYCLES,
    },
  },

  ...UniversalSalesModelProperties,

  items: [{
    ...UniversalSalesModelProperties,
    // type: {
    //   type: String,
    //   enum: [SALESMODEL_ITEM_TYPES],
    //   required: true, <<<<<<<<<<<<<<<<<<<<
    // },

    // =======================================================
    // section - describe sales model for each product attributes
    // - All product attributes by default are not enabled
    // - To enable an attribute, should define here with price
    // - If we offer an attribute by free, we should add an entry with price 0
    // - Attribute price will be added beyond product price
    //
    // Example of package addon:
    // {
    //   identifier: 'gold_package',
    //   title: {
    //     text: 'Gold Package',
    //   },
    //   valueType: 'array',
    //   value: 'music_on_hold,voicemail,conferencing',
    //   isOneTimeCharge: false,
    //   regularPrice: 6.99,
    //   price: 5.99,
    // }
    attributes: [{
      ...UniversalSalesModelProperties,

      // properties are optional, if they are empty, it will
      // be pulled from product attribute with same identifier
    }],
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

SalesModelSchemaDef.set('toJSON', {
  getters: true,
  virtuals: true
});
SalesModelSchemaDef.set('toObject', {
  getters: true,
  virtuals: true
});

const SalesModelSchema = mongoose.model(SALESMODEL_TABLE_NAME, SalesModelSchemaDef);

module.exports = { SalesModelSchema };
