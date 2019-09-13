const ns = '[global][tasks][clocktick12hour]';
const logger = require('applogger');
const util = require('util');
const fs = require('fs');

const handler = (src, data, cb) => {
  const fn = `[${src.requestId}]${ns}[processEvent]`;
  const { ASEventEmitter } = require('../event');
  const { ASEVENT_CLOCK_TICK_12_HOUR } = require('../event/constants');
  const { getBaseURL } = require('../../../common/Utils');

  const context = {
    requestId: src.requestId,
    baseUrl: getBaseURL(src),
  };

  ASEventEmitter.emitPromise(ASEVENT_CLOCK_TICK_12_HOUR, context)
  .then((eventResult) => {
    if (eventResult && eventResult instanceof Error) {
        logger.error(fn, 'Error on clock tick', eventResult);
    }
    logger.info(fn, 'completed');
    cb();
  })
  .catch((err) => {
    logger.error(fn, 'Error:', err);
    cb(err);
  })
};

module.exports = handler;
