const ns = '[partner.backend]';
const logger = require('applogger');

const { DbBase } = require('../modules/db/index');
const PartnerSchema = require('../../schemas/PartnerSchema');
const constants = require('../../config/constants')
const escapeStringRegexp = require('escape-string-regexp');

class PartnerBackend extends DbBase {
  async isValid(partnerId, region, options = {}) {
    const fn = `[${options.requestId}]${ns}[isValid]`;

    let query = {
      _id: partnerId,
      status: constants.PARTNER_STATUS_TYPES.APPROVED
    };

    const gsmbPartner = await this.findOne({
      'metadata.regionMaster': 'DE'
    }, {...options, ignoreNotFoundError: true});

    const gsmbPartnerId = gsmbPartner && gsmbPartner._id;

    if (region && region.toUpperCase() == 'DE')  {
      logger.info(fn, 'compare:', partnerId != gsmbPartnerId);

      if (!gsmbPartnerId.equals(partnerId))  {
        query['parent'] = gsmbPartnerId;
      }
    } else {
      query['$and'] = [
        {
          _id: {
            $ne: gsmbPartnerId
          }
        },
        {
          parent: {
            $ne: gsmbPartnerId
          }
        },
      ];
    }

    logger.info(fn, 'query:', query);

    const partner = await this.findOne(query, {
      ...options,
      select: { _id: 1, 'fields.companyName': 1 },
      ignoreNotFoundError: true
    });
    logger.info(fn, `find ${partnerId}:`, partner && partner.fields && partner.fields.companyName);

    return !!partner;
  }

  async searchPartners(search, options) {
    const fn = `[${options.requestId}]${ns}[searchPartners]`;
    const { PARTNER_STATUS_TYPES } = require('../../config/constants');

    options = Object.assign({
      region: 'US'
    }, options);

    logger.info(fn, 'options', options);

    let query = {
      status: PARTNER_STATUS_TYPES.APPROVED,
      'fields.companyName': { $regex: `^${escapeStringRegexp(search)}`, $options: 'i'  }
    };

    const gsmbPartner = await this.findOne({
      'metadata.regionMaster': 'DE'
    }, {...options, ignoreNotFoundError: true});

    const gsmbPartnerId = gsmbPartner && gsmbPartner._id;

    if (options.region.toUpperCase() === 'DE')  {
      query['$or'] = [
        {
          _id: gsmbPartnerId
        },
        {
          parent: gsmbPartnerId
        }
      ];
    } else {
      query['$and'] = [
        {
          _id: {
            $ne: gsmbPartnerId
          }
        },
        {
          parent: {
            $ne: gsmbPartnerId
          }
        },
      ];
    }

    logger.info(fn, 'query:', query);

    const partners = await this.find(query, options);

    logger.info(fn, 'result:', partners);

    return partners;
  }

  async getOneApprovedById(partnerId, options) {
    const fn = `[${options.requestId}]${ns}[getOneApprovedById]`;
    const { PARTNER_STATUS_TYPES } = require('../../config/constants');

    const query = {
      _id: partnerId,
      status: PARTNER_STATUS_TYPES.APPROVED,
    };

    const partner = await this.findOne(query, {
      ...options,
      ignoreNotFoundError: true
    });
    logger.info(fn, `find ${partnerId}:`, partner && partner.fields && partner.fields.companyName);

    return partner;
  }
}

let backend = new PartnerBackend(PartnerSchema, {});

module.exports = {
  PartnerBackend: backend,
};
