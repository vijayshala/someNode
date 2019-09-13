var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SystemConfigSchema = new Schema({
  name: {type: String, unique:true},
  value: Schema.Types.Mixed  
},{ versionKey: false });
module.exports = mongoose.model('SystemConfigSchema', SystemConfigSchema);