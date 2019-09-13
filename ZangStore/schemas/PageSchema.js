var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PageSchema = new Schema({
  title: String,
  subtitle: String,
  slug: String,
  contents: String,
  metadata: {},
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
      ref:'User',
      index: true
    },
    on:Date
  }
});


module.exports = mongoose.model('Page', PageSchema);
