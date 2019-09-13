class InMemoryLogging {

  constructor() {
    // hold logging informations
    this.resetLogs();
  }

  /**
   * Write info level log
   *
   * @param  {ErrorMessage} msg  an instance of '../error/message'
   */
  info(msg) {
    this._infos.push(msg);
  }

  /**
   * Write warning level log
   *
   * @param  {ErrorMessage} msg  an instance of '../error/message'
   */
  warn(msg) {
    this._warnings.push(msg);
  }

  /**
   * Write error level log
   *
   * @param  {ErrorMessage} msg  an instance of '../error/message'
   */
  error(msg) {
    this._errors.push(msg);
  }

  /**
   * Import multiple info level logs
   *
   * @param  {ErrorMessage} msgs  instances of '../error/message'
   */
  importInfos(msgs) {
    this._infos.push(...msgs);
  }

  /**
   * Import multiple warning level logs
   *
   * @param  {ErrorMessage} msgs  instances of '../error/message'
   */
  importWarnings(msgs) {
    this._warnings.push(...msgs);
  }

  /**
   * Import multiple error level logs
   *
   * @param  {ErrorMessage} msgs  instances of '../error/message'
   */
  importErrors(msgs) {
    this._errors.push(...msgs);
  }

  getInfos() {
    return this._infos || [];
  }

  getWarnings() {
    return this._warnings || [];
  }

  getErrors() {
    return this._errors || [];
  }

  getAll() {
    return {
      infos: this.getInfos(),
      warnings: this.getWarnings(),
      errors: this.getErrors(),
    };
  }

  resetLogs() {
    this._infos = [];
    this._warnings = [];
    this._errors = [];
  }
}

module.exports = InMemoryLogging;
