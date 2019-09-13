var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var constants = require('../config/constants')

var PartnerInvitationSchema = new Schema({
  created: {
    by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index:true
    },
    on: Date
  },
  partner: {
    type: Schema.Types.ObjectId,
    ref: 'Partner',
    index:true
  },
  inviteeType: {
    type: String,
    enum: Object.keys(constants.PARTNER_INVITEE_TYPES)
  },
  inviteeEmail: String,
  inviteeName: String,
  inviteeRelation: {
    type: Number,
    emun: Object.values(constants.AGENT_LEVELS),
    default: null
  },
  autoActivate: {
    type: Boolean,
    default: false
  }
});


module.exports = mongoose.model('PartnerInvitation', PartnerInvitationSchema);
