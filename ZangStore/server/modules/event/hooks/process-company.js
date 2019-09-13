const ns = '[event.hooks.process-company]';
const logger = require('applogger');

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const emitter = this;
  const { ErrorMessage, VIOLATIONS, BadRequestError } = require('../../error');
  const U = require('../../utils');
  let payload = context.order || context.cart;
  const user = context.user;
  const zangAccountsId = user && user.accountId;
  const userEmail = user && user.username;
  const { createCompany, getCompaniesByRelation, createCompanyDomain } = require('../../zang-accounts');

  logger.info(fn, 'started', 'payload id=', payload && payload._id);
  if (!payload) {
    return next(new BadRequestError('Cannot find cart or order payload'));
  }
  if (!zangAccountsId) {
    return next(new BadRequestError('Cannot find current user Zang Accounts ID'));
  }
  if (!userEmail) {
    return next(new BadRequestError('Cannot find current user email'));
  }

  U.P()
    .then(async() => { // create new company
      if (payload.company.nid || !payload.company.name) {
        return;
      }

      let newCompany = null;

      try {
        newCompany = await createCompany(context.requestId, zangAccountsId, payload.company.name);
      } catch (err) {
        logger.error(fn, 'failed to create company', err);
        emitter.warn(context.event, new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
          text: 'We were not able to create a company for you. Please make sure that you have provided valid company and domain names',
          resource: ['WE_WERE_NOT_ABLE_TO_CREATE_A_COMPANY_FOR_YOU_PLEASE_MAKE_SURE_THAT_YOU_HAVE_PROVITED_A_VALID_DOMAIN_NAME'],
        }, 'company.name'));
        return;
      }

      // set company ID back
      payload.company.nid = newCompany.id;
    })
    .then(async() => { // create company domain if not exists
      if (!payload.company.nid) {
        logger.warn(fn, 'no company nid found in payload');
        return;
      }
      if (!payload.company.domain) {
        logger.info(fn, 'no company domain to create');
        return;
      }

      const companies = await getCompaniesByRelation(context.requestId, zangAccountsId, 'admin');
      const company = companies.find((one) => one.id === payload.company.nid);
      if (!company) {
        logger.error(fn, `cannot find company ${payload.company.nid}`);
        emitter.warn(context.event, new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
          text: 'Cannot find the company',
          resource: ['VIOLATION.FIELD_VALUE_INVALID', 'COMPANY'],
        }, 'company.name'));
        return;
      }

      const companyDomains = company.domains.map((one) => one.domain);
      if (companyDomains.indexOf(payload.company.domain) === -1) {
        await createCompanyDomain(context.requestId, payload.company.nid, payload.company.domain, userEmail);
      } else {
        logger.info(fn, 'company domain already exists');
        return;
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
