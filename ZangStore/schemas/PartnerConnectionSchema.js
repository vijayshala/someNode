var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PartnerConnectionSchema = new Schema({
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index:true
  },
  partner: {
    type: Schema.Types.ObjectId,
    ref: 'Partner',
    index:true
  },
  agent: {
    type: Schema.Types.ObjectId,
    ref: 'PartnerAgent',
    index: true
  },
  created: Date
});


module.exports = mongoose.model('PartnerConnection', PartnerConnectionSchema);
