var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PartnerCustomerSchema = new Schema({
  company: {
    id: String,
    name: String,
    domain: String,
    address: String
  },
  parentPartner: {
    type: Schema.Types.ObjectId,
    ref: 'Partner',
    index: true
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index:true
  },
  partner: {
    type: Schema.Types.ObjectId,
    ref: 'Partner',
    index: true
  },
  agent: {
    type: Schema.Types.ObjectId,
    ref: 'PartnerAgent',
    index: true
  },
  created: Date,
  updated: {
    on: Date
  }
});


module.exports = mongoose.model('PartnerCustomer', PartnerCustomerSchema);
