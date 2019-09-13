const ns = '[partner.backend]';
const logger = require('applogger');

const { DbBase } = require('../modules/db/index');
const PartnerConnectionSchema = require('../../schemas/PartnerConnectionSchema');

class PartnerConnectionBackend extends DbBase {
  async getByCustomer(userId, options) {
    return await this.findOneBy('customer', userId, options);
  }
}

let backend = new PartnerConnectionBackend(PartnerConnectionSchema, {});

module.exports = {
  PartnerConnectionBackend: backend,
};
