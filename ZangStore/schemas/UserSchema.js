var mongoose = require('mongoose'),
		Schema = mongoose.Schema;
		
var PaymentMethodSchema = new Schema({

});

var UserSchema = new Schema({
  accountId: {type: String, unique: true},
  accountInformation: {},
  billingInformation: {},
	shippingInformation: {},
	billingAccounts:	[
		{
			billingAccountId: { type: Schema.Types.ObjectId, ref: 'BillingAccount' },
			permission: String
		}
	],
  account: {
	    name: {
	      familyname: String,
	      formatted: String,
	      givenname: String,
	      honorific_prefix: String,
	      honorific_suffix: String,
	      middlename: String,
	      pronunciation: String,
	      pronunciation_url: String
	  },
		phone_numbers: [{
  	  _id: false,
      value: { type: String},
      type: {type: String},
      primary: Boolean,
      canonicalForm: {type: String},
      verified: Boolean
    }],
		addresses: [String],
		gender: String,
		displayname: String,
		lastupdatetime: Date,
		username: { type: String, lowercase: true, unique: true},
		user_action_required: Boolean,
		emails: [
		    {
		        _id: false,
		        value: { type: String, lowercase: true },
		        type: {type: String},
		        primary: Boolean,
		        label: String,
		        relationdef_id: String,
		        cid: { type: Schema.Types.ObjectId, ref: 'Company' },
		    }
		],
		languages: [
		    {
		        _id: false,
		        code: String,
		        primary: Boolean
		    }
		],
		timezone: String,

		// picture_url: String,
		picturefile: String,
		security_token: String,
		relation_graphs: [{
	    _id: false,
	    relationdef_id: String,
	    initiator_id: {type:String, index:true},
	    initiator_type: String,
	    relation_type: String
	  }],
    permissions: []
  },
  accessLevel: {
    type: Number,
    enum: [1,2,3], //1:admin, 2:editor, 3:customer,
    default: 3
  },
  credit_cards: [String],
  created: {
    by: Schema.Types.ObjectId,
    on: Date
  },
  updated: {
    by: Schema.Types.ObjectId,
    on:Date
  }
});

module.exports = mongoose.model('User', UserSchema);
