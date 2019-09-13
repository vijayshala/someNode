const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const {
    SUBSCRIPTION_TRACK_TABLE_NAME
} = require('../constants');

const cst = require('../../../modules/constants');

const IPOfficeSubscriptionTrackSchemaDef = Schema({
    OrderID: String,
    SubscriptionID: String,
    SubscriptionDesc: String,
    SubscriptionType: String,
    SubscriptionLabel: String,
    SubscriptionStartDate: Date,
    SubscriptionEndDate: Date,
    SubscriptionModifiedDate: Date,
    AccountName: String,
    AccountAddress: {
        Addressline1: String,
        Addressline2: String,
        Addressline3: String,
        City: String,
        State: String,
        Country: String,
        PostalCode: String
    },
    TechnicalContact:{
        FirstName: String,
        LastName: String,
        PhoneNumber: String,
        Email: String
    },
    DeploymentNotes: String,
    SubscriptionLocation: String,
    settingxml_creation_meta:{
        order_id: Schema.Types.ObjectId,
        status: {type: Number, default: cst.IPOFFICE_SETTINGXML_NOT_CREATIION},
        extraData: {type: Schema.Types.Mixed} //Save extra data for creating settingXML
    }
});

IPOfficeSubscriptionTrackSchemaDef.methods.toIPOXML_JSON = function (){
    let ret = this.toJSON();
    delete ret._id;
    delete ret.__v;
    delete ret.settingxml_creation_meta; //This property will not export to subscription xml file.
    if (ret.SubscriptionStartDate){
      ret.SubscriptionStartDate = ret.SubscriptionStartDate.toISOString().split('.')[0] + 'Z';
    }
    if (ret.SubscriptionEndDate){
      ret.SubscriptionEndDate = ret.SubscriptionEndDate.toISOString().split('.')[0] + 'Z';
    }
    if (ret.SubscriptionModifiedDate){
      ret.SubscriptionModifiedDate = ret.SubscriptionModifiedDate.toISOString().split('.')[0] + 'Z';
    }
    return ret
};

const IPOfficeSubscriptionTrackSchema = mongoose.model(SUBSCRIPTION_TRACK_TABLE_NAME, IPOfficeSubscriptionTrackSchemaDef);

module.exports = { IPOfficeSubscriptionTrackSchema };