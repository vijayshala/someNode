var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LegalDocSchema = new Schema({
  title: String,
  slug: String,
  versions: [{
    versionLabel: String,
    external: Boolean,
    externalUrl: String,
    htmlUrl: String,
    pdfUrl: String
  }]
});


module.exports = mongoose.model('LegalDoc', LegalDocSchema);
