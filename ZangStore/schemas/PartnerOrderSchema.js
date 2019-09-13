var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PartnerOrderSchema = new Schema({
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
  order: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    index: true
  },
  agent: {
    type: Schema.Types.ObjectId,
    ref: 'PartnerAgent',
    index: true
  },
  slug: String,
  oneTimeFee: Number,
  intervalFee: Number,
  commission: Number,
  created: Date,
  updated: {
    on: Date
  }
});


module.exports = mongoose.model('PartnerOrder', PartnerOrderSchema);
