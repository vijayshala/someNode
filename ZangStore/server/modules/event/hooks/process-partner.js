const ns = '[event.hooks.process-partner]';
const logger = require('applogger');

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const { BadRequestError } = require('../../error');
  const U = require('../../utils');
  const currencyFormatter = require('currency-formatter');
  const _ = require('lodash');
  const { OrderBackend } = require('../../../order/order.backend');
  const { PartnerBackend } = require('../../../partner/partner.backend');
  const { PartnerConnectionBackend } = require('../../../partner/partner-connection.backend');
  const { PartnerCustomerBackend } = require('../../../partner/partner-customer.backend');
  const { PartnerAgentBackend } = require('../../../partner/partner-agent.backend');
  const { PartnerOrderBackend } = require('../../../partner/partner-order.backend');
  const { UserBackend } = require('../../../user/user.backend');
  const sendgrid = require('../../../modules/email/sendgrid');
  let order = context.order;
  const user = context.user;
  const userId = user && (user._id || user.userId);
  let currentRegion = context.currentRegion;

  logger.info(fn, 'started', 'order id=', order && order._id);
  if (!order) {
    return next(new BadRequestError('Cannot find order payload'));
  }

  const options = {
    requestId: context.requestId,
    ignoreNotFoundError: true,
  };

  const result = {};

  U.P()
    .then(async() => {
      const connection = await PartnerConnectionBackend.getByCustomer(userId, options);

      if (connection) {
        result.partnerId = connection.partner;
        result.agentId = connection.agent;
      } else {
        result.partnerId = order.partner;
      }
    })
    .then(async() => {
      if (result.partnerId) {
        result.partner = await PartnerBackend.getOneApprovedById(result.partnerId, options);

        if (result.agentId) {
          result.agent = await PartnerAgentBackend.findOneById(result.agentId, options);
        } else {
          result.agent = await PartnerAgentBackend.findOneByPartner(result.partnerId, options);
        }
      }
    })
    .then(async() => { // load agent user information
      if (result.agent && result.agent.user) {
        result.agentUser = await UserBackend.findOneById(result.agent.user, options);
      }
    })
    .then(async() => { // load agent user information
      if (result.partner && result.partner.parent) {
        result.partnerParent = await PartnerBackend.findOneById(result.partner.parent, options);
      }
    })
    .then(async() => {
      if (!result.partner || !result.agent || !result.agentUser) {
        logger.info(fn, 'partner or agent is empty, skipped creating partner order');
        return;
      }

      logger.debug(fn, 'partner/agent prepared:', result);

      // update order partner/agent info
      await OrderBackend.findOneAndUpdate({
        _id: order._id,
      }, {
        $set: {
          partner: result.partner && result.partner._id,
          partnerAgent: result.agent && result.agent._id,
        }
      }, options);
    })
    .then(async() => {
      if (!result.partner) {
        logger.info(fn, 'partner is empty, skipped partner email');
        return;
      }

      const { template } = require('../../email/templates/order-confirmation-for-partner');
      const compiled = _.template(template, {
        imports: {
          currency: (val) => currencyFormatter.format(val, { code: order.currency }),
          L: context.localizer,
          LV: (val) =>
            (val && val.resource) ?
            context.localizer.get(val.resource) :
            ((val && val.text) ? val.text : ''),
        },
      });

      const summary = compiled({
        user,
        order,
      });
      // logger.info(fn, 'summary:', summary);

      let emailConfig = {
        requestId: context.requestId,
        language: user.language,
        firstName: user.firstName,
        lastName: user.lastName,
        toEmail: result.agentUser && result.agentUser.account && result.agentUser.account.username,
        partnerType: result.partner.type,
        summary,
        portalLink: context.baseUrl + '/partners/me/resolve',
        region: currentRegion.countryISO || 'US'
      }

      await sendgrid.sendPartnerOrderEmail(emailConfig);
      logger.info(fn, 'partner email sent');

      if (result.partnerParent) {
        emailConfig.toEmail = result.partnerParent.fields.utilityEmail;
        await sendgrid.sendPartnerOrderEmail(emailConfig);
        logger.info(fn, 'partner parent email sent');
      }
    })
    .then(async() => { // update partner-customer relationship
      if (!result.partner) {
        logger.info(fn, 'partner is empty, skipped creating partner customer');
        return;
      }
      const existing = await PartnerCustomerBackend.findOne({
        customer: userId,
        partner: result.partner._id,
        'company.id': order.company.nid,
      }, { ...options, ignoreNotFoundError: true });

      if (existing) {
        logger.info(fn, 'partner customer record already exists:', existing);
      } else {
        const partnerCustomer = {
          partner: result.partner._id,
          agent: result.agent._id,
          parentPartner: result.partnerParent ? result.partnerParent._id : result.partner._id,
          customer: userId,
          company: {
            id: order.company.nid,
            name: order.company.name,
            domain: order.company.domain,
            address: `${order.billingAddress.address1}, ${order.billingAddress.country}, ${order.billingAddress.city}, ${order.billingAddress.state ? order.billingAddress.state + ',' : ''} ${order.billingAddress.zip}`,
          },
          created: new Date(),
        };

        let created = await PartnerCustomerBackend.create(partnerCustomer, {
          ...options,
          returnNewDocument: true,
        });
        if (created && created.toObject) {
          created = created.toObject();
        }
        logger.info(fn, 'partner customer created', created);
      }
    })
    .then(() => {
      next();
    })
    .catch((err) => {
      logger.error(fn, 'Error:', err);
      next(err);
    });
};

module.exports = processEvent;
