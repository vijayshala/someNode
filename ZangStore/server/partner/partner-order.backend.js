const ns = '[partner.backend]';
const logger = require('applogger');

const { DbBase } = require('../modules/db/index');
const PartnerOrderSchema = require('../../schemas/PartnerOrderSchema');

class PartnerOrderBackend extends DbBase {
  async getByCustomer(userId, options) {
    return await this.findOneBy('customer', userId, options);
  }

  async getByOrderId(orderId, options) {
    return await this.findOneBy('order', orderId, options);
  }
}

let backend = new PartnerOrderBackend(PartnerOrderSchema, {});

module.exports = {
  PartnerOrderBackend: backend,
};
