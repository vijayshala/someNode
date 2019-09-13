const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

const {
  SALESMODEL_TABLE_NAME
} = require('../salesmodel/salesmodel.constants');

const {
  OFFER_TABLE_NAME
} = require('../offer/offer.constants');

const {
  ORDER_TABLE_NAME,
  ORDER_STATUSES,
} = require('./order.constants');

const { LegalDocumentSchema } = require('../modules/utils/universal-schemas');

const OrderItemSchemaDef = new Schema({
  level: {
    type: Number,
    default: 0,
  },
  // >> this is a calculated field <<
  // a combined identifier from salesModel, salesModelItem and attributes, separated by '..'
  // for example: ucoffer-small-yearly..zang-office..silver-package
  identifier: String,

  offer: {
    _id: {
      type: Schema.Types.ObjectId,
      ref: OFFER_TABLE_NAME
    },
    identifier: String,
  },
  salesModel: {
    _id: {
      type: Schema.Types.ObjectId,
      ref: SALESMODEL_TABLE_NAME,
      required: true,
    },
    identifier: String,
    subscription: Schema.Types.Mixed,
    value: String,
    helper: Schema.Types.Mixed,
    tags: [{
      type: String
    }],
  },
  salesModelItem: {
    _id: Schema.ObjectId,
    identifier: String,
    value: String,
    helper: Schema.Types.Mixed,
    tags: [{
      type: String
    }],
  },
  attribute: {
    _id: {
      type: Schema.Types.ObjectId,
    },
    identifier: String,
    value: String,
    helper: Schema.Types.Mixed,
    tags: [{
      type: String
    }],
  },

  // the title is striped from salesModel, or salesModelItem, or attribute
  title: {
    text: String,
    resource: String
  },
  // this should be display along with the title if exists
  // currently this information comes from context value or helper
  additionalInformation: {
    text: String,
    resource: String
  },
  engines: [{
    type: String
  }],
  legalDocuments: [LegalDocumentSchema],
  references: {},

  // pricing
  isOneTimeCharge: Boolean,
  regularPrice: Number, // this is for display purpose, the regularPrice may be displayed as crossing-out
  price: Number,
  quantityUnit: String, // quantity unit can be "GB" if we selling storage. it's for display purpose
  // quantity
  quantity: Number,

  hidden: Boolean,
});

OrderItemSchemaDef.set('toJSON', {
  getters: true,
  virtuals: true
});
OrderItemSchemaDef.set('toObject', {
  getters: true,
  virtuals: true
});

const OrderSchemaDef = new Schema({
  status: {
    type: String,
    enum: ORDER_STATUSES,
    index: true
  },
  confirmationNumber: {
    type: String,
    index: true,
  },

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
    index: true
  },

  partnerAgent: {
    type: Schema.Types.ObjectId,
    ref: 'PartnerAgent',
    index: true
  },

  quote: {
    type: Schema.Types.ObjectId,
    ref: 'Quotes'
  },

  items: [
    OrderItemSchemaDef
  ],

  currency: {
    type: String,
    default: 'USD',
  },
  region: {
    type: String,
    default: 'US',
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
    taxItems: Schema.Types.Mixed,
    shipping: Number,
    total: Number,
    payment: {
      status: String,
      on: Date,
      billingEngine: String,
      metadata: {},
    },
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
    taxItems: Schema.Types.Mixed,
    shipping: Number,
    total: Number,

    payment: {
      status: String,
      on: Date,
      billingEngine: String,
      metadata: {},
    },
  }],

  legalDocumentConsents: [{
    identifier: String,
    consent: Boolean,
  }],

  payment: {
    billingEngine: {
      type: String,
      index: true
    },
    metadata: {},
  },

  notes: String,
  metadata: {},

  billingAccountId: {
    ref: 'BillingAccount',
    type: Schema.Types.ObjectId,
    required: true,
    index: true,
  },

  created: {
    by: Schema.Types.ObjectId,
    on: {
      type: Date,
      index: true
    }
  },
  updated: {
    by: Schema.Types.ObjectId,
    on: Date
  }
});

OrderSchemaDef.set('toJSON', {
  getters: true,
  virtuals: true
});
OrderSchemaDef.set('toObject', {
  getters: true,
  virtuals: true
});

OrderSchemaDef.index({ status: 1, partner: 1 });

const OrderSchema = mongoose.model(ORDER_TABLE_NAME, OrderSchemaDef);

module.exports = { OrderSchema };
