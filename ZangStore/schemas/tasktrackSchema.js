var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TaskTrackSchema = new Schema({
  liveRec: Date,  
  status: String
});


module.exports = mongoose.model('TaskTrack', TaskTrackSchema);
