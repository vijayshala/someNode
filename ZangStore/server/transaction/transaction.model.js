import mongoose, { Schema } from 'mongoose';
import {
    TRANSACTION_TABLE_NAME,
    STATUS
} from './transaction.constants';

const TransactionSchemaDef = new Schema({
    transactionInitOn: Date,
    transactionCompleteOn: Date,
    status: {
        type: String,     //e.g.: Started, Completed, Failed, Tax calculated
        enum: Object.values(STATUS)
    },
    refObject: {
        type: Schema.Types.ObjectId
    },
    refObjectType: String,  //Contract, order, contract.subscriptions etc.

    payment: {
        attempts: Number,
        lastAttempt: Date,
        nextAttempt: Date,
        billingEngine: String,    //e.g.: STRIPE
        metadata: {}        //e.g.: customerId, sourceId, paymentId, invoiceId, etc.
    },

    amount: Number,
    currency: String,

    tax: {
        taxDetails: [{
            title: {
                text: String,
                resource: String,
            },
            amount: Number
        }],
        tid: String,
        amount: Number,
        taxEngine: String,    //e.g.: AVALARA
        metadata: {}        //e.g.: document code, commit: true or false
    },
    created: {
        by: Schema.Types.ObjectId,
        on: Date
    },    
});

const TransactionSchema = mongoose.model(TRANSACTION_TABLE_NAME, TransactionSchemaDef);

export default TransactionSchema;