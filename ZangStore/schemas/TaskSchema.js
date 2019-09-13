var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TaskSchema = new Schema({
  identifier: {
    type: String,
    unique: true,
    index:true
  },
  active: {
    type: Boolean,
    default: false
  },
  lastAccessed: Date,
  created: {
    by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index:true
    },
    on: Date
  }
});


module.exports = mongoose.model('Task', TaskSchema);
