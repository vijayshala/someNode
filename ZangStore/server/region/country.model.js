import mongoose, { Schema } from 'mongoose';
import {
    COUNTRY_TABLE_NAME
} from './region.constants';

const CountrySchemaDef = new Schema({
    name: {
        type: String,
        index: true,
    },
    canSell: { type: Boolean },
    nativeName: {
        type: String,
        index: true,
    },
    flag: {
        type: String,
    },
    countryShortCode: {
        type: String,
        index: true,
    },
    states: [{
        name: {
            type: String,
        },
        shortCode: {
            type: String,
        },
    }],
    translations: { type: Schema.Types.Mixed },
    currencies: [{ type: String }],
    // callingCodes: [{ type: String }],
    dialCode: {type: String},
    phoneFormat: {type: String},
    languages: [{ type: String }],
    region: { type: String },
    subregion: { type: String },
    timezones: [{ type: Schema.Types.Mixed }],
    tld: [{ type: String }],
    ISO: { type: Schema.Types.Mixed },
    borders: [{type: String}]    
});

CountrySchemaDef.set('toJSON', {
    getters: true,
    virtuals: true
});
CountrySchemaDef.set('toObject', {
    getters: true,
    virtuals: true
});

const CountrySchema = mongoose.model(COUNTRY_TABLE_NAME, CountrySchemaDef);

export default CountrySchema;