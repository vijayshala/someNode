const ns = '[partner.backend]';
const logger = require('applogger');

const { DbBase } = require('../modules/db/index');
const PartnerCustomerSchema = require('../../schemas/PartnerCustomerSchema');

class PartnerCustomerBackend extends DbBase {}

let backend = new PartnerCustomerBackend(PartnerCustomerSchema, {});

module.exports = {
  PartnerCustomerBackend: backend,
};
