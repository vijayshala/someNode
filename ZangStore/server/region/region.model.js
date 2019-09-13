import mongoose, { Schema } from 'mongoose';
import {
    REGION_TABLE_NAME
} from './region.constants';

const RegionSchemaDef = new Schema({
    name: {
        text: String,
        resource: String,
    },
    active: { type: Boolean },
    canCommitTax: { type: Boolean },
    shortCode: {
        type: String,
        index: true,
    },
    countryISO: { type: String },
    currency: { type: String },
    addressFormClass: { type: Number }, // A all fields are required, B state is optional....
    countries: [{
        name: {
            text: String,
            resource: String,
        },
        shortCode: {
            type: String,
            index: true,
        },
    }], 
    taxCodes: [{
        tax: Number, // tax amount
        name: String, // Tax name
        code: Number // Tax code
    }],
    defaultLanguage: {type: String, default:'en-US'}
});

RegionSchemaDef.set('toJSON', {
    getters: true,
    virtuals: true
});
RegionSchemaDef.set('toObject', {
    getters: true,
    virtuals: true
});

const RegionSchema = mongoose.model(REGION_TABLE_NAME, RegionSchemaDef);

export default RegionSchema;