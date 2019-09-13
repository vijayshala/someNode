import mongoose, { Schema } from 'mongoose';

var BillingAccountSchema = new Schema({
    name: String,
    paymentGateways: {}, //{ STRIPE: { customerId: 'cus_xxxx', default: true }}
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