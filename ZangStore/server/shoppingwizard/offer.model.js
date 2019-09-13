var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

import {
  PRODUCT_TABLE_NAME
} from '../product'

import {
  OFFER_TYPES,
  OFFER_TABLE_NAME,
  OFFER_ITEM_TYPES
} from './offer.constants'

var OfferItemSchema = new Schema({  
  type: {
    type: String,
    "enum": [OFFER_ITEM_TYPES],
    required: true
  },
  product: {
    _id: {
      type: Schema.Types.ObjectId,
      ref: PRODUCT_TABLE_NAME
    },
    identifier: String
  },
  sort: Number,
  skus: [{
    type: String
  }],
  defaultQty: Number,
  isOneTimeCharge: Boolean,
  regularPrice: Number,
  salePrice: Number
})

OfferItemSchema.virtual('price').get(function () {
  return this.salePrice ? this.salePrice : this.regularPrice
});
OfferItemSchema.virtual('onSale').get(function () {
  return this.salePrice ? true : false
});

var OfferSchemaDef = new Schema({
  type: {
    type: String,
    "enum": OFFER_TYPES,
    required: true
  }, //simple, subscription, variation, subscription_variation 
  status: {
    type: String,
    default: 'published'
  }, //draft, pending, private, published, 

  //slug usually is used for unique url path
  slug: {
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

  subscriptionInterval: Number, //0-6
  subscriptionPeriod: {
    type: String
  }, //day, week, month, year
  subscriptionLength: {
    type: Number,
    default: 0
  }, //0= never expires, 1-52

  items: [OfferItemSchema],
  categories: [String], //ProductCategories ids  
  images: [], //list of images  
  menuOrder: Number,
  // readOnlyInCart: { type: Boolean, default: false },
  soldIndividually: {
    type: Boolean,
    default: false
  }, //Allow one item to be bought in a single order. Default is false.  
  created: {
    by: Schema.Types.ObjectId,
    on: Date
  },
  updated: {
    by: Schema.Types.ObjectId,
    on: Date
  }
});

OfferSchemaDef.set('toJSON', {
  getters: true,
  virtuals: true
});
OfferSchemaDef.set('toObject', {
  getters: true,
  virtuals: true
});

export const OfferSchema = mongoose.model(OFFER_TABLE_NAME, OfferSchemaDef);
