var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var OrderSchema = new Schema({
  status: String,
  type: String,
  partner: {
    type: Schema.Types.ObjectId,
    ref: 'Partner',
    index:true,
    default: null
  },
  accountInformation: {},
  billingInformation: {},
  shippingInformation: {},
  billingAccountId: { ref: 'BillingAccount', type: Schema.Types.ObjectId},
  paymentMethod: {
    gateway: String,
    customerId: String,
    paymentSourceId: String,
    paymentSourceType: String,
    paymentId: String,
    chargeStatus: String,
    creditCardMetadata:  {
      brand: String,
      last4: String,
      expMonth: Number,
      expYear: Number,
      holderName: String
    }
  },
  billingEngine: String,
  notes: String,
  items: [],
  metadata: {},
  confirmationNumber:String,
  relationgraphs: [],
  created: {
    by: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    on: Date
  },
  updated: {
    by: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    by: Schema.Types.ObjectId,
    on: Date
  }
});


module.exports = mongoose.model('Order', OrderSchema);
