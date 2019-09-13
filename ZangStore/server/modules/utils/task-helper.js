class TaskHelper {
  constructor() {
    this.ns = '[TaskHelper]';
  }

  async shouldTrigger(identifier, idle, inProgress, lockedTime, options) {
    const defaultOptions = { requestId: '', new: true, upsert: true, };
    const mergedOptions = { ...defaultOptions, ...options };

    const fn = `[${options.requestId}]${this.ns}[shouldTrigger]`;
    const logger = require('applogger');

    const { SysConfigBackend } = require('../../utils/sysconfig.backend');

    try {
      const result = await SysConfigBackend.findOneAndUpdate({
        name: identifier,
        '$or': [{
          'value.status': idle
        }, {
          'value.lockedtm': {
            '$lt': new Date((new Date()).getTime() - lockedTime)
          }
        }]
      }, {
        value: {
          'status': inProgress,
          'lockedtm': (new Date())
        }
      }, mergedOptions);

      return !!result;
    } catch (e) {
      const msg = String(e.message);
      if (msg.indexOf('E11000 duplicate key error index') > -1) {
        // the dup key error is expected here
      } else {
        logger.error(fn, 'Error:', e);
        // throw e;
      }
    }

    return false;
  }

  async markTaskAsIdle(identifier, idle, inProgress, options) {
    const defaultOptions = { requestId: '' };
    const mergedOptions = { ...defaultOptions, ...options };

    const fn = `[${options.requestId}]${this.ns}[shouldTrigger]`;
    const logger = require('applogger');

    const { SysConfigBackend } = require('../../utils/sysconfig.backend');

    try {
      const result = await SysConfigBackend.findOneAndUpdate({
        name: identifier,
        'value.status': inProgress
      }, {
        'value.status': idle,
      }, mergedOptions);

      return !!result;
    } catch (e) {
      logger.error(fn, 'Error:', e);
    }

    return false;
  }

  async resetTriggeredTimes(identifier, options) {
    const defaultOptions = { requestId: '', new: true, upsert: true, };
    const mergedOptions = { ...defaultOptions, ...options };

    const fn = `[${options.requestId}]${this.ns}[resetTriggeredTimes]`;
    const logger = require('applogger');

    const { SysConfigBackend } = require('../../utils/sysconfig.backend');

    try {
      const result = await SysConfigBackend.findOneAndUpdate({
        name: identifier,
      }, {
        value: 1
      }, mergedOptions);

      return (result && result.value) || 0;
    } catch (e) {
      logger.error(fn, 'Error:', e);
    }

    return false;
  }

  async increaseTriggeredTimes(identifier, options) {
    const defaultOptions = { requestId: '', new: true, };
    const mergedOptions = { ...defaultOptions, ...options };

    const fn = `[${options.requestId}]${this.ns}[increaseTriggeredTimes]`;
    const logger = require('applogger');

    const { SysConfigBackend } = require('../../utils/sysconfig.backend');

    try {
      const result = await SysConfigBackend.findOneAndUpdate({
        name: identifier,
      }, {
        '$inc': {
          "value": 1
        }
      }, mergedOptions);

      return (result && result.value) || 0;
    } catch (e) {
      logger.error(fn, 'Error:', e);
    }

    return false;
  }
}

module.exports = {
  TaskHelper: new TaskHelper(),
};
