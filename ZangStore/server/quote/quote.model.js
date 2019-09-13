import mongoose, { Schema } from 'mongoose';
import CartItemSchema from '../cart/cartitem.model';
import { ORDER_TABLE_NAME } from '../order/order.constants';
import {
    QUOTE_TABLE_NAME,
    QUOTE_STATUSES
} from './quote.constants';

const QuoteSchemaDef = new Schema({
    status: {
        type: String,
        enum: QUOTE_STATUSES
    },

    quoteNumber: {
        type: String,
        index: true,
      },

    order: {
        type: Schema.Types.ObjectId,
        ref: ORDER_TABLE_NAME
    },

    partner: {
        type: Schema.Types.ObjectId,
        ref: 'Partner',
        index: true
    },
    
    partnerAgent: {
        type: Schema.Types.ObjectId,
        ref: 'PartnerAgent',
        index: true
    },

    expireOn: Date,

    created: {
        by: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        on: Date
    },

    notes: String,

    contact: {
        salutation: {
            type: String,
            enum: []
        },
        firstName: String,
        lastName: String,
        phone: String,
        email: String,
    },
    company: {
        nid: String,
        name: String,
        domain: String,
        industry: String,
        isIncorporated: Boolean,
        vatNumber: String,
        existingCustomerReference: String,
        address1: String,
        address2: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        stateISO: String,
        countryISO: String,
    },
    billingAddress: {
        addressee: String,
        address1: String,
        address2: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        stateISO: String,
        countryISO: String,
        email: String,
      },
      shippingAddress: {
        addressee: String,
        address1: String,
        address2: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        stateISO: String,
        countryISO: String,
      },

    items: [
        CartItemSchema
    ],
    region: {
        type: String,
        default: 'US',
    },
    currency: {
        type: String,
        default: 'USD',
    },
    metadata: {}, //needed for tax
    onetime: {
        subTotal: Number, // PLEASE NOTE: subTotal already includes discount because we have negative discount cart items
        discount: Number, // positive number
        tax: Number,
        taxDetails: [{
            title: {
                text: String,
                resource: String,
            },
            tid: String,
            amount: Number,
        }],
        taxItems: Schema.Types.Mixed,
        shipping: Number,
        total: Number,
        payment: {
            status: String,
            on: Date,
            billingEngine: String,
            metadata: {},
        },
    },
    
    subscriptions: [{
        // this is a combination of contractLength, contractPeriod, billingInterval, billingPeriod, trialLength, trialPeriod
        // example:
        // - 1-month-billing-1-year-contract-1-month-trial
        // - 1-month-billing-1-month-contract-0--trial
        identifier: {
            type: String,
            required: true,
        },
    
        contractLength: Number,
        contractPeriod: String,
        billingInterval: Number,
        billingPeriod: String,
        trialLength: Number,
        trialPeriod: String,
    
        subTotal: Number, // PLEASE NOTE: subTotal already includes discount because we have negative discount cart items
        discount: Number, // positive number
        tax: Number,
        taxDetails: [{
            title: {
                text: String,
                resource: String,
            },
            tid: String,
            amount: Number,
        }],
        taxItems: Schema.Types.Mixed,
        shipping: Number,
        total: Number,
    
        payment: {
            status: String,
            on: Date,
            billingEngine: String,
            metadata: {},
        },
    }],
    
});

QuoteSchemaDef.set('toJSON', {
    getters: true,
    virtuals: true
});
QuoteSchemaDef.set('toObject', {
    getters: true,
    virtuals: true
});

const QuoteSchema = mongoose.model(QUOTE_TABLE_NAME, QuoteSchemaDef);

export default QuoteSchema;