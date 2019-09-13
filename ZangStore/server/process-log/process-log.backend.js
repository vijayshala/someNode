const ns = '[process-log.backend]';
const logger = require('applogger');

const { DbBase } = require('../modules/db/index');
const { ProcessLogSchema } = require('./process-log.model');

class ProcessLogBackend extends DbBase {}

let backend = new ProcessLogBackend(ProcessLogSchema, {});

module.exports = {
  ProcessLogBackend: backend,
};
