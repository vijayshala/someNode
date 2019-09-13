const ns = '[partner.backend]';
const logger = require('applogger');

const { DbBase } = require('../modules/db/index');
const PartnerAgentSchema = require('../../schemas/PartnerAgentSchema');
const { UserBackend } = require('../user/user.backend');
const { PartnerBackend } = require('./partner.backend');
const config = require('../../config');

class PartnerAgentBackend extends DbBase {
  async findOneByPartner(partnerId, options) {
    const { AGENT_LEVELS } = require('../../config/constants');

    const query = {
      partner: partnerId,
      accessLevel: AGENT_LEVELS.OWNER,
    };

    return await this.findOne(query, { ...options, sort: { created: -1 } });
  }

  async findAgentWithUserInfo(agentId, options = {}) {
    const query = {
      _id: agentId
    };

    let agent = await this.findOne(query, { ...options });
    if (agent) {
      let user = await UserBackend.findOne({ _id: agent.user });
      if (user) {
        return user;
      }
    }
    return null
  }

  async setPartnerCookie(req, res, options) {
    const fn = `[${req.requestId}]${ns}[setPartnerCookie]`;
    const { PARTNER_STATUS_TYPES, PARTNER_CODE_COOKIE_NAME } = require('../../config/constants'); 
    if (!req.userInfo || !options.partnerAgent) {
      logger.info(fn, 'invalid parameters!');
      return;
    }
    let agent = await this.findOne({
      _id: options.partnerAgent,
      active: true,
      user: { '$ne': req.userInfo.userId }
    });

    let partner = await PartnerBackend.findOne({
      _id: options.partner,
      status: PARTNER_STATUS_TYPES.APPROVED
    });
    
    if (agent && partner) {      
      res.cookie(PARTNER_CODE_COOKIE_NAME, agent.code, {expires: new Date(Date.now() + (1000*60*60*24)), httpOnly: true, secure: config.environment !== 'development' })
    }
  }
}


let backend = new PartnerAgentBackend(PartnerAgentSchema, {});

module.exports = {
  PartnerAgentBackend: backend,
};
