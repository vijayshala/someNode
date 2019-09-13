const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

const {
  PROCESS_LOG_TABLE_NAME,
  PROCESS_LOG_REFERENCES,
} = require('./process-log.constants');

const ProcessLogSchemaDef = new Schema({
  refType: {
    type: String,
    enum: PROCESS_LOG_REFERENCES,
  },
  refId: {
    type: Schema.Types.ObjectId,
  },
  status: String,
  error: Boolean,
  text: String,
  debug: Schema.Types.Mixed,
  created: {
    by: Schema.Types.ObjectId,
    on: Date
  }
});

ProcessLogSchemaDef.index({ refType: 1, refId: 1 });

const ProcessLogSchema = mongoose.model(PROCESS_LOG_TABLE_NAME, ProcessLogSchemaDef);

module.exports = { ProcessLogSchema };
