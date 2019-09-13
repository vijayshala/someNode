const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const {
    SALESMODEL_TABLE_NAME
} = require('../salesmodel/salesmodel.constants');

      
const {
    OFFER_TABLE_NAME
} = require('../offer/offer.constants');

const {
    CART_TABLE_NAME
  } = require('./cart.constants');

  
const { LegalDocumentSchema } = require('../modules/utils/universal-schemas');

const CartItemSchemaDef = new Schema({
    // >> this is a calculated field <<
    // cart display indent level
    // - 0: SalesModel level, salesModel._id exists
    // - 1: SalesModelItem level, which is one product, salesModel._id and salesModelItem._id exists
    // - 2: SalesModelItem.attribute level, which is one product attribute, salesModel._id, salesModelItem._id and attributes.identifier exists
    level: {
        type: Number,
        default: 0,
    },
    // >> this is a calculated field <<
    // a combined identifier from salesModel, salesModelItem and attributes, separated by '..'
    // for example: ucoffer-small-yearly..zang-office..silver-package
    identifier: String,

    offer: {
        _id: {
            type: Schema.Types.ObjectId,
            ref: OFFER_TABLE_NAME
        },
        identifier: String,
    },
    salesModel: {
        _id: {
            type: Schema.Types.ObjectId,
            ref: SALESMODEL_TABLE_NAME,
            required: true,
        },
        identifier: String,
        subscription: Schema.Types.Mixed,
        value: String,
        helper: Schema.Types.Mixed,
        tags: [{
            type: String
        }],
    },
    salesModelItem: { // product level
        _id: Schema.ObjectId,
        identifier: String,
        value: String,
        helper: Schema.Types.Mixed,
        tags: [{
            type: String
        }],
    },
    attribute: {
        _id: {
            type: Schema.Types.ObjectId,
        },
        identifier: String,
        value: String,
        helper: Schema.Types.Mixed,
        tags: [{
            type: String
        }],
    },

    // the title is striped from salesModel, or salesModelItem, or attribute
    title: {
        text: String,
        resource: String
    },
    // this should be display along with the title if exists
    // currently this information comes from context value or helper
    additionalInformation: {
        text: String,
        resource: String
    },
    engines: [{
        type: String
    }],
    legalDocuments: [LegalDocumentSchema],
    references: {},

    // pricing
    isOneTimeCharge: Boolean,
    regularPrice: Number, // this is for display purpose, the regularPrice may be displayed as crossing-out
    price: Number,
    quantityUnit: String, // quantity unit can be "GB" if we selling storage. it's for display purpose
    // quantity
    quantity: Number,

    hidden: Boolean,
});

CartItemSchemaDef.set('toJSON', {
    getters: true,
    virtuals: true
});
CartItemSchemaDef.set('toObject', {
    getters: true,
    virtuals: true
});

export default CartItemSchemaDef;