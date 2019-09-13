var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    constants = require('../config/constants')

var PartnerSchema = new Schema({
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Partner',
    index:true
  },
  type: {
      type: String,
      enum: Object.keys(constants.PARTNER_TYPES),
      default: null
  },
  status: {
    type: String,
    enum: Object.keys(constants.PARTNER_STATUS_TYPES),
    default: constants.PARTNER_STATUS_TYPES.PENDING
  },
  // user: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'User',
  //   index:true
  // },
  metadata: {},
  fields: {
    utilityEmail: String,
    companyName: String,
    companyAddress: String,
    companyCountry: String,
    companyCity: String,
    companyStateProvince: String,
    companyZipPostalCode: String,
    companyPhoneNumber: String,
    companyWebsite: String,
    operationalAddress: String,
    operationalCountry: String,
    operationalCity: String,
    operationalStateProvince: String,
    operationalZipPostalCode: String,
    isAvayaPartner: String,
    avayaPartnerId: String,
    bankName: String,
    bankAccountNumber: String,
    bankNumber: String,
    bankTransitNumber: String,
    bankSwiftCode: String,
    bankTaxRegistrationNumber: String,
    bankAddress: String,
    bankCountry: String,
    bankCity: String,
    bankStateProvince: String,
    bankZipPostalCode: String,
    question1: String,
    question2: String,
    question3: String,
    question4: String,
    question4Extra: String,
    question5: String,
    question5Extra: String,
    question6: String,
    question6Extra: String,
    question7: String,
    question7Extra:String,
    question8: String,
    question8Extra: String,
    question9: String,
    question9Extra:String,
    question10: String,
    question10Extra:String,
    question11: String,
    agentProgramAgree: Boolean,
    tosAgree: Boolean,
    copyCompanyAddress: Boolean
  },
  deviceProvisioningSchema: String,
  deviceProvisioningFileName: String,
  statusChanged: {
    by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index:true
    },
    on: Date
  },
  created: {
    by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index:true
    },
    on: Date
  },
  updated: {
    by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index:true
    },
    on: Date
  }
});


module.exports = mongoose.model('Partner', PartnerSchema);
