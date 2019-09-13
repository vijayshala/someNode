const ns = '[sysconfig.backend]';
const logger = require('applogger');

const { DbBase } = require('../modules/db/index');
const sysconfSchema = require('../../schemas/sysconfigSchema');

class SysConfigBackend extends DbBase {}

let backend = new SysConfigBackend(sysconfSchema, {});

module.exports = {
  SysConfigBackend: backend,
};
