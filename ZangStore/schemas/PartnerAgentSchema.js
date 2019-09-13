var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PartnerAgentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index:true
  },
  partner: {
    type: Schema.Types.ObjectId,
    ref: 'Partner',
    index:true
  },
  active: {
    type: Boolean,
    default: false
  },
  code: {
    type: String,
    index: true,
    unique: true,
    default: null
  },
  accessLevel: {
    type: Number,
    enum: [1,2,3], //1:onwer, 2:admin, 3:agent,
    default: 3
  },
  created: Date,
  updated: {
    on: Date
  }
});


module.exports = mongoose.model('PartnerAgent', PartnerAgentSchema);
