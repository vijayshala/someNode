const ns = '[CsmrEventEmitter]';

const EventEmitter = require('events');
const InMemoryLogging = require('../utils/inmemory-logging');
const ErrorMessage = require('../error/message');

class CsmrEventEmitter extends EventEmitter {

  constructor() {
    super();

    // hold logging informations
    this._loggings = {};
  }

  /**
   * Write info level log
   *
   * @param  {ErrorMessage} msg  an instance of '../error/message'
   */
  info(event, msg) {
    if (!this._loggings[event]) {
      this._loggings[event] = new InMemoryLogging();
    }
    this._loggings[event].info(msg);
  }

  /**
   * Write warning level log
   *
   * @param  {ErrorMessage} msg  an instance of '../error/message'
   */
  warn(event, msg) {
    if (!this._loggings[event]) {
      this._loggings[event] = new InMemoryLogging();
    }
    this._loggings[event].warn(msg);
  }

  /**
   * Write error level log
   *
   * @param  {ErrorMessage} msg  an instance of '../error/message'
   */
  error(event, msg) {
    if (!this._loggings[event]) {
      this._loggings[event] = new InMemoryLogging();
    }
    this._loggings[event].error(msg);
  }

  getInfos(event) {
    if (!this._loggings[event]) {
      this._loggings[event] = new InMemoryLogging();
    }
    return this._loggings[event].getInfos();
  }

  getWarnings(event) {
    if (!this._loggings[event]) {
      this._loggings[event] = new InMemoryLogging();
    }
    return this._loggings[event].getWarnings();
  }

  getErrors(event) {
    if (!this._loggings[event]) {
      this._loggings[event] = new InMemoryLogging();
    }
    return this._loggings[event].getErrors();
  }

  getAll(event) {
    return {
      infos: this.getInfos(event),
      warnings: this.getWarnings(event),
      errors: this.getErrors(event),
    };
  }

  resetLogs(event) {
    if (!this._loggings[event]) {
      this._loggings[event] = new InMemoryLogging();
    }
    this._loggings[event].resetLogs();
  }
}

module.exports = CsmrEventEmitter;
