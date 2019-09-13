import mongoose, { Schema } from 'mongoose';
import { PO_STATUSES } from './billingaccount.constants';

const PurchaseOrderSchema = new Schema({
    status: {
        type: String,
        enum: PO_STATUSES
    },
    contact: {
        firstName: String,
        lastName: String,
        phone: String,
        email: String,
    },
    company: {
        name: String,
        isIncorporated: Boolean,
    },
    billingAddress: {
        address1: String,
        address2: String,
        city: String,
        state: String,
        zip: String,
        country: String,
    },
    refNumber: String,
    approvedLimit: Number,
    created: {
        by: Schema.Types.ObjectId,
        on: Date
    },
    updated: {
        by: Schema.Types.ObjectId,
        on: Date
    },
    approved:  {
        by: Schema.Types.ObjectId,
        on: Date
    }
});

const IBANSchema = new Schema({
    value: String,
    created: {
        by: Schema.Types.ObjectId,
        on: Date
    }
});

const BillingAccountSchema = new Schema({
    name: String,
    paymentGateways: {
        STRIPE_CA: {},
        STRIPE: {},//{ STRIPE: { customerId: 'cus_xxxx', default: true }}
        GSMB: {
            IBAN: [IBANSchema]
        },
        NATIVE: {
            purchaseOrder: PurchaseOrderSchema,
        }
    },
    created:    {
        by: { type: Schema.Types.ObjectId, ref: 'User' },
        on: { type: Date, default: Date.now }
    },
    members: [
        {
            permission: String,     //e.g.: admin
            userId: { type: Schema.Types.ObjectId, ref: 'User' }
        }
    ]
});

export default mongoose.model('BillingAccount', BillingAccountSchema);