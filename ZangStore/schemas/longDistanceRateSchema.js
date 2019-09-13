var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var rateLongDistanceSchema = new Schema({
  provider: {type: String, index: true},
  countryName:  {type: String, index: true},
  from: {type: String, index: true},
  status: {type: String, index: true},
  created: {type: Date, index: true},
  prefix: {type: String, index: true},
  inter: {type: Number},
  intra: {type: Number},
  default: {type: Number},
  firstInc: {type: Number},
  secondInc: {type: Number},
  cdefault: {type: Number},
  cfirstInc: {type: Number},
  csecondInc:  {type: Number},
  cinter: {type: Number},
  cintra: {type: Number}
});


module.exports = mongoose.model('rateLongDistance', rateLongDistanceSchema);