var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
var TABLE_NAME = 'shoppingwizarddefaults'
var ShoppingWizardDefaultSchemaDef = new Schema({
  slug: {
    type: String,
    unique: true,
    required: true
  },
  categories: [String],
  title: String,
  description: String,
  data: Schema.Types.Mixed
})

export const ShoppingWizardDefaultSchema = mongoose.model(TABLE_NAME, ShoppingWizardDefaultSchemaDef);
