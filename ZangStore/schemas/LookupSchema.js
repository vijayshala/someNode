var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LookupSchema = new Schema({
  type: String,
  keyValue: String,
  description: String,
  metadata: {}
});


module.exports = mongoose.model('Lookup', LookupSchema);
