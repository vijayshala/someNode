class ErrorMessage {

  constructor(module, code, message, reference) {
    this.module = module;
    this.code = code;
    this.message = message;
    this.reference = reference;
  }

  toJSON() {
    return {
      module: this.module,
      code: this.code,
      message: this.message,
      reference: this.reference,
    };
  }

  toString() {
    return `${this.module}: code=${this.code}, message=${JSON.stringify(this.message)}, reference=${this.reference}`;
  }
}

module.exports = ErrorMessage;
