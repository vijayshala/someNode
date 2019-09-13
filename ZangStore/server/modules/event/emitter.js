const ns = '[ASEventEmitter]';
const logger = require('applogger');

const AsyncEventEmitter = require('async-eventemitter');

class ASEventEmitter extends AsyncEventEmitter {

  constructor() {
    super();

    // hold logging informations
    this._infos = {};
    this._warnings = {};
    this._errors = {};
  }

  /**
   * Write info level log
   *
   * @param  {ErrorMessage} msg  an instance of '../error/message'
   */
  info(event, msg) {
    if (!this._infos[event]) {
      this._infos[event] = [];
    }
    this._infos[event].push(msg);
  }

  /**
   * Write warning level log
   *
   * @param  {ErrorMessage} msg  an instance of '../error/message'
   */
  warn(event, msg) {
    if (!this._warnings[event]) {
      this._warnings[event] = [];
    }
    this._warnings[event].push(msg);
  }

  /**
   * Write error level log
   *
   * @param  {ErrorMessage} msg  an instance of '../error/message'
   */
  error(event, msg) {
    if (!this._errors[event]) {
      this._errors[event] = [];
    }
    this._errors[event].push(msg);
  }

  /**
   * Import multiple info level logs
   *
   * @param  {ErrorMessage} msgs  instances of '../error/message'
   */
  importInfos(event, msgs) {
    if (!this._infos[event]) {
      this._infos[event] = [];
    }
    this._infos[event].push(...msgs);
  }

  /**
   * Import multiple warning level logs
   *
   * @param  {ErrorMessage} msgs  instances of '../error/message'
   */
  importWarnings(event, msgs) {
    if (!this._warnings[event]) {
      this._warnings[event] = [];
    }
    this._warnings[event].push(...msgs);
  }

  /**
   * Import multiple error level logs
   *
   * @param  {ErrorMessage} msgs  instances of '../error/message'
   */
  importErrors(event, msgs) {
    if (!this._errors[event]) {
      this._errors[event] = [];
    }
    this._errors[event].push(...msgs);
  }

  getInfos(event) {
    return this._infos[event] || [];
  }

  getWarnings(event) {
    return this._warnings[event] || [];
  }

  getErrors(event) {
    return this._errors[event] || [];
  }

  resetLogs(event) {
    this._infos[event] = [];
    this._warnings[event] = [];
    this._errors[event] = [];
  }

  /**
   * emit event and return a promise
   *
   * Example:
   *  try {
   *   const result = await ASEventEmitter.emitPromise('something-happened', {context: ''});
   *   if (result) {
   *     // error handling
   *   }
   *  } catch (e) {}
   *
   * @param  {String} event
   * @param  {Any} data
   * @return {Promise}]
   */
  emitPromise(event, data) {
    const requestId = (data && data.requestId) || '';
    const fn = `[${requestId}]${ns}[emitPromise]`;
    const _this = this;

    logger.info(fn, 'emit', event);
    if (!data) {
      data = {};
    }
    if (!data.event) {
      data.event = event;
    }

    // reset logging
    _this.resetLogs(event);

    const p = new Promise((resolve, reject) => {
      _this.emit(event, data, (err) => {
        if (err) {
          logger.info(fn, event, 'rejected', err);
          reject(err);
        } else {
          logger.info(fn, event, 'resolved');
          resolve();
        }
      });
    });

    return p;
  }
}

module.exports = ASEventEmitter;
