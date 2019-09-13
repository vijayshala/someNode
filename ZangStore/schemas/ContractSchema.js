var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var ContractSchema = new Schema({
  planOption: String,
  products: [],
  meta: {},
  trdParty: {
    lastSyncId: String,
    status: String,
    accountId: String,
    companyId: String,
    type: { type: String },
    meta: {}
  },
  legacy: {
    type: Boolean,
    default: false
  },
  billing: {
    salesForceQuoteId: String,
    salesForceOrderId: String,
    salesForceOpportunityId: String,
    salesForceContractId: String,
    salesForceContactId: String,
    salesForceAccountId: String,
    planId: String,
    subscriptionId: String,
    contractType: String,
    contractCount: Number,
    lastRenewalDate: Date,
    amount: Number
  },
  price: {
    total: Number,
    subtotal: Number,
    tax: Number,
    taxTypes: {},
    taxDetail: [],
    taxId: String
  },
  billingAccountId: {
    type: Schema.Types.ObjectId,
    ref: 'BillingAccount'
  },
  paymentMethod: {
    gateway: String,
    customerId: String,
    subscriptionId: String,
    chargeStatus: String,
    lastSuccessfulCharge: Date
  },
  paymentHistory: [
    {
      gateway: String,
      paymentId: String,
      subscriptionId: String,
      customerId: String,
      paymentDate: Date
    }
  ],
  billingEngine: String,
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  contractNumber: String,
  summary: {},
  created: {
    by: Schema.Types.ObjectId,
    on: Date
  },
  updated: {
    on: Date
  }
});

module.exports = mongoose.model('Contract', ContractSchema);
