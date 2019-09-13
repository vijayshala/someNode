var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var ProductSchema = new Schema({
  slug: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true,
    unique: true
  },
  alias: String,
  image: '',
  contents: String,
  description: String,
  metadata: {},
  planOptions: [{
    value: String,
    label: String,
    active: Boolean,
    perDeviceDiscount: Number,
    preselectedDevice: String,
  }],
  enablePayment: Boolean,
  planOption: String,
  minQtyOption: String,
  pricingType: String,
  price: {
    oneTime: { type: Number, default: 0 },
    oneTimeDiscount: { type: Number, default: 0 },    
    oneTimeBeforeTax: { type: Number, default: 0 },
    oneTimeAfteTax: { type: Number, default: 0 },
    oneTimeTax: { type: Number, default: 0 },
    interval: { type: Number, default: 0 },
    intervalDiscount: { type: Number, default: 0 },
    intervalBeforeTax: { type: Number, default: 0 },
    intervalAfterTax: { type: Number, default: 0 },
    intervalTax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    frequency: String,
    frequencyCount: { type: Number, default: 0 },
    trial: { type: Number, default: 0 },
    trialType: { type: Number, default: 0 },
    contract: String
  },
  availability: Number,
  advanced: Boolean,  
  salesmodel: {},
  created: {
    by: Schema.Types.ObjectId,
    on: Date
  },
  updated: {
    by: Schema.Types.ObjectId,
    on: Date
  },  
});

module.exports = mongoose.model('Product', ProductSchema);
