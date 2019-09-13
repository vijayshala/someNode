const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

const {
  ENGINE_TABLE_NAME
} = require('./engine.constants');

let EngineSchemaDef = new Schema({
  name: { type: String, unique: true },
  value: Schema.Types.Mixed
});

const EngineSchema = mongoose.model(ENGINE_TABLE_NAME, EngineSchemaDef);

module.exports = { EngineSchema };
