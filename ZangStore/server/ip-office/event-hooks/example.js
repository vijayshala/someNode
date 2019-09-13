const ns = '[ip-office][event-hooks][example]';
const logger = require('applogger');

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  logger.info(fn, 'started');

  next();
};

module.exports = processEvent;
