const ns = '[engine-config.backend]';
const logger = require('applogger');

const { DbBase } = require('../modules/db/index');
const { EngineSchema } = require('./engine.model');

class EngineBackend extends DbBase {


}

let backend = new EngineBackend(EngineSchema, {});

module.exports = {
  EngineBackend: backend,
};
