const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

const {
  SALESMODEL_TABLE_NAME
} = require('../salesmodel/salesmodel.constants');
const {
  OFFER_TABLE_NAME
} = require('./offer.constants');

let OfferSchemaDef = new Schema({
  identifier: {
    type: String,
    unique: true,
    required: true,
  },
  active: {
    type: Boolean,
    default: true
  },
  slug: {
    type: String,
    unique: true,
    required: true,
  },
  title: {
    text: String,
    resource: String,
  },
  description: {
    text: String,
    resource: String,
  },
  // IMPORTANT ASSUMPTION: currently backend only handles 3 levels tree
  parent: {
    _id: {
      type: Schema.Types.ObjectId,
      ref: OFFER_TABLE_NAME,
      index: true,
    },
    identifier: String,
  },
  salesModels: [{
    salesModel: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: SALESMODEL_TABLE_NAME
      },
      identifier: String,
    },
    isDefault: Boolean,
    displaySequence: {
      type: Number,
      default: 0,
    },
  }],
  tags: [{
    type: String,
  }],
  allowed_regions: [{
    type: String, //'all means all regions
  }],
  restriced_regions: [{
    type: String,
  }],
  displaySequence: {
    type: Number,
    default: 0,
  },
});

OfferSchemaDef.index({ tags: 1 });

const OfferSchema = mongoose.model(OFFER_TABLE_NAME, OfferSchemaDef);

module.exports = { OfferSchema };
