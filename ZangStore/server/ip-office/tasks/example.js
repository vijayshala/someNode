const ns = '[ip-office][tasks][example]';
const logger = require('applogger');

const handler = (src, data, cb) => {
  const fn = `[${src.requestId}]${ns}[processEvent]`;

  logger.info(fn, 'started, data:', data);

  cb();
};

module.exports = handler;
