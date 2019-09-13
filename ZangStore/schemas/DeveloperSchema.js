var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DeveloperSchema = new Schema({
  email: String
});


module.exports = mongoose.model('Developer', DeveloperSchema);
