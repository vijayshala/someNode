const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

const {
  SALESMODEL_TABLE_NAME
} = require('../salesmodel/salesmodel.constants');

const {
  OFFER_TABLE_NAME
} = require('../offer/offer.constants');

const {
  CART_TABLE_NAME
} = require('./cart.constants');

const CartItemSchema = require('./cartitem.model');

const { LegalDocumentSchema } = require('../modules/utils/universal-schemas');

/**
 * Example cart items
 *
 * [{
 *   level: 0,
 *   salesModel: {
 *     _id: ....,
 *     identifier: 'zang-office-monthly-201701',
 *   },
 *   isOneTimeCharge: false,
 *   quantity: 1,
 * }, {
 *   level: 1,
 *   salesModel: {
 *     _id: ....,
 *     identifier: 'zang-office-monthly-201701',
 *   },
 *   salesModelItem: {
 *     _id: ....,
 *     identifier: 'zang-office',
 *   },
 *   isOneTimeCharge: false,
 *   price: 14.95,
 *   quantity: 10,
 * }, {
 *   level: 2,
 *   salesModel: {
 *     _id: ....,
 *     identifier: 'zang-office-monthly-201701',
 *   },
 *   salesModelItem: {
 *     _id: ....,
 *     identifier: 'zang-office',
 *   },
 *   attributes: {
 *     identifier: 'tollfree_did',
 *     value: '1-866-123-4567',
 *   },
 *   isOneTimeCharge: false,
 *   price: 0,
 *   quantity: 1,
 * }, {
 *   level: 2,
 *   salesModel: {
 *     _id: ....,
 *     identifier: 'zang-office-monthly-201701',
 *   },
 *   salesModelItem: {
 *     _id: ....,
 *     identifier: 'zang-office',
 *   },
 *   attributes: {
 *     identifier: 'music_on_hold',
 *   },
 *   isOneTimeCharge: false,
 *   price: 1,
 *   quantity: 10,
 * }, {
 *   level: 1,
 *   salesModel: {
 *     _id: ....,
 *     identifier: 'zang-office-monthly-201701',
 *   },
 *   salesModelItem: {
 *     _id: ....,
 *     identifier: 'phone-model-b1234',
 *   },
 *   isOneTimeCharge: true,
 *   price: 125,
 *   quantity: 5,
 * }]
 */


const CartSchemaDef = new Schema({
  contact: {
    salutation: {
      type: String,
      enum: []
    },
    allowToContact: Boolean,
    firstName: String,
    lastName: String,
    phone: String,
    email: String,
  },
  company: {
    nid: String,
    name: String,
    domain: String,
    industry: String,
    isIncorporated: Boolean,
    vatNumber: String,
    existingCustomerReference: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    stateISO: String,
    countryISO: String,
  },
  billingAddress: {
    addressee: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    stateISO: String,
    countryISO: String,
    email: String,
  },
  shippingAddress: {
    addressee: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    stateISO: String,
    countryISO: String,
  },
  partner: {
    type: Schema.Types.ObjectId,
    ref: 'Partner',
    // index: true
  },
  partnerAgent: {
    type: Schema.Types.ObjectId,
    ref: 'PartnerAgent',
    // index: true
  },

  items: [
    CartItemSchema
  ],

  region: {
    type: String,
    default: 'US',
  },

  currency: {
    type: String,
    default: 'USD',
  },

  onetime: {
    subTotal: Number, // PLEASE NOTE: subTotal already includes discount because we have negative discount cart items
    discount: Number, // positive number
    tax: Number,
    taxDetails: [{
      title: {
        text: String,
        resource: String,
      },
      tid: String,
      amount: Number,
    }],
    shipping: Number,
    total: Number,
  },

  subscriptions: [{
    // this is a combination of contractLength, contractPeriod, billingInterval, billingPeriod, trialLength, trialPeriod
    // example:
    // - 1-month-billing-1-year-contract-1-month-trial
    // - 1-month-billing-1-month-contract-0--trial
    identifier: {
      type: String,
      required: true,
    },

    contractLength: Number,
    contractPeriod: String,
    billingInterval: Number,
    billingPeriod: String,
    trialLength: Number,
    trialPeriod: String,

    subTotal: Number, // PLEASE NOTE: subTotal already includes discount because we have negative discount cart items
    discount: Number, // positive number
    tax: Number,
    taxDetails: [{
      title: {
        text: String,
        resource: String,
      },
      tid: String,
      amount: Number,
    }],
    shipping: Number,
    total: Number,
  }],

  legalDocumentConsents: [{
    identifier: String,
    consent: Boolean,
  }],

  payment: {
    billingEngine: String,
    metadata: {},
  },

  quote: {
    type: Schema.Types.ObjectId,
    ref: 'Quotes'
  },

  notes: String,

  billingAccountId: {
    ref: 'BillingAccount',
    type: Schema.Types.ObjectId,
  },

  created: {
    by: {
      type: Schema.Types.ObjectId
    },
    on: Date
  },
  updated: {
    by: Schema.Types.ObjectId,
    on: Date
  }
});

CartSchemaDef.set('toJSON', {
  getters: true,
  virtuals: true
});
CartSchemaDef.set('toObject', {
  getters: true,
  virtuals: true
});

CartSchemaDef.index({ "created.by": 1, 'region': 1 }, { unique: true });
const CartSchema = mongoose.model(CART_TABLE_NAME, CartSchemaDef);

module.exports = { CartSchema };
