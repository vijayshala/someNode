const ns = '[kazoo][event-hooks][validate-kazoo-order]';
const logger = require('applogger');

const { VIOLATIONS, ErrorMessage, BadRequestError, ValidationError } = require('../../modules/error');
const { PRODUCT_ENGINE_NAME } = require('../constants');

const isAcceptableIndustry = (payload) => {
  //validate industry type
  const excludedIndustryTypes = ['Healthcare'];

  if (payload.company && payload.company.industry &&
    excludedIndustryTypes.indexOf(payload.company.industry) > -1) {
    return false;
  }

  return true;
};

const findCompanyPreviousSubscriptions = async(payload, options) => {
  const { PurchasedPlanBackend } = require('../../purchased-plan/purchased-plan.backend');

  let exists = false;

  if (payload.company && payload.company.nid) {
    exists = await PurchasedPlanBackend.findByCompanyAndProduct(payload.company.nid, [PRODUCT_ENGINE_NAME], options);
  }

  return exists;
};

const checkDomainOnZangAccounts = async(req, domain) => {
  const fn = `[${req.requestId}]${ns}[checkDomainOnZangAccounts]`;

  const { checkDomain } = require('../../modules/zang-accounts');
  const result = await checkDomain(req.requestId, domain);

  if (!result) {
    throw new Error('Domain in use....');
  }
};

const getZangAccountsCompany = async(req, companyNid) => {
  const fn = `[${req.requestId}]${ns}[getZangAccountsCompany]`;
  let exists = undefined;

  const { getCompaniesByRelation } = require('../../modules/zang-accounts');
  const companies = await getCompaniesByRelation(req.requestId, req.userInfo.accountId, 'admin');

  if (Array.isArray(companies) && companies.length > 0) {
    exists = companies.find((one) => {
      return one.id === companyNid;
    });
  }

  return exists;
};

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const emitter = this;
  const U = require('../../modules/utils');
  const { cartHasProductsOf, findCartItemContext } = require('../../modules/cart-salesmodel-rules/utils');
  let payload = context.order || context.cart || context.quote;
  let currentRegion = context.currentRegion;

  logger.info(fn, 'started', 'payload id=', payload && payload._id);
  if (!payload) {
    return next(new BadRequestError('Cannot find cart or order payload'));
  }

  if (!cartHasProductsOf(payload, PRODUCT_ENGINE_NAME)) {
    logger.info(fn, `No "${PRODUCT_ENGINE_NAME}" product found in payload, skipped`);
    return next();
  }

  const req = {
    requestId: context.requestId,
    userInfo: context.user,
  };
  const options = {
    requestId: context.requestId,
  };

  let errors = [];

  U.P()
    .then(async() => {
      const exists = await findCompanyPreviousSubscriptions(payload, options);
      if (Array.isArray(exists) && exists.length > 0) {
        logger.info(fn, 'found existing subscription', exists);
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
          text: 'It seems that you have already purchased Solutions for this company. Please select a different company.',
          resource: ['IT_SEEMS_THAT_YOU_HAVE_ALREADY_PURCHASED_IP_OFFICE_FOR_THIS_COMPANY_THE_ORDER_CANNOT_BE_PLACED'],
        }, 'company.nid'));
      }
    })
    .then(async() => {
      // only check if it's new company (without nid)
      if (payload && payload.company && payload.company.domain && !payload.company.nid) {
        try {
          await checkDomainOnZangAccounts(req, payload.company.domain);
        } catch (err) {
          logger.info(fn, 'failed to check company domain on Zang Accounts:', err);
          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
            text: `The domain name ${payload.company.domain} is either an invalid domain name or is being used by another company.`,
            resource: ['THE_DOMAIN_NAME_PLACEHOLDER_IS_EITHER_AN_INVALID_DOMAIN_NAME_OR_IS_BEING_USED_BY_ANOTHER_COMPANY2', payload.company.domain],
          }, 'company.domain'));
        }
      }
    })
    .then(async() => {
      // only check if it's existing company (with nid)
      if (payload && payload.company && payload.company.nid) {
        try {
          const company = await getZangAccountsCompany(req, payload.company.nid);
          if (!company) {
            errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
              text: 'The system could not validate your company. Please try again',
              resource: ['THE_SYSTEM_COULD_NOT_VALIDATE_YOUR_COMPANY_PLEASE_TRY_AGAIN'],
            }, 'company.nid'));
          }
        } catch (err) {
          logger.info(fn, 'failed to check company on Zang Accounts:', err);
          errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
            text: 'The system could not validate your company. Please try again',
            resource: ['THE_SYSTEM_COULD_NOT_VALIDATE_YOUR_COMPANY_PLEASE_TRY_AGAIN'],
          }, 'company.nid'));
        }
      }
    })
    .then(() => {
      // find total quantity of "user-types"
      const tagToFind = 'user-types';
      let totalQuantity = 0;
      for (let item of payload.items) {
        const itemContext = findCartItemContext(item);
        const tags = itemContext && itemContext.tags;
        if (tags && tags.indexOf(tagToFind) > -1) {
          totalQuantity += item.quantity || 0;
        }
      }

      if (totalQuantity == 0) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
          text: 'Each Avaya Cloud Solutions plan requires at least one user type. Please go back to the devices selection step and change your configuration.',
          resource: ['EACH_ZANG_OFFICE_PLAN_REQUIRES_AT_LEAST_ONE_STANDARD_OR_POWER_USER_PLEASE_GO_BACK_TO_THE_DEVICES_SELECTION_STEP_AND_CHANGE_YOUR_CONFIGURATION'],
        }, 'items.quantity'));
      }
      // if (totalQuantity > 50) {
      //   errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
      //     text: 'You have selected more than 50 users, please contact our enterprise sales team to assist you with this order.',
      //     resource: ['KAZOO_GERMANY_USER_LIMIT_ENTERPRISE_SALES'],
      //   }, 'items.quantity'));
      // }
    })
    .then(() => {
      // find phone number of "did-main"
      const tagToFind = 'did-main';
      const tagToIgnore = 'no-config';
      let number = null;
      for (let item of payload.items) {
        const itemContext = findCartItemContext(item);
        const tags = itemContext && itemContext.tags;
        if (tags && tags.indexOf(tagToIgnore) > -1) {
          number = true;  //Don't require phone number
          break;
        } else if (tags && tags.indexOf(tagToFind) > -1) {
          number = itemContext.helper && itemContext.helper.number;
          break;
        }
      }
      if (!number) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, {
          text: 'It seems that you haven\'t selected any number for your Avaya Cloud Solutions account. Please go back to the number selection step to select a number.',
          resource: ['IT_SEEMS_THAT_YOU_HAVENT_SELECTED_ANY_NUMBER_FOR_YOUR_ZANG_OFFICE_ACCOUNT_PLEASE_GO_BACK_TO_THE_NUMBER_SELECTION_STEP_TO_SELECT_A_NUMBER'],
        }, 'items.attribute[did-main].helper.number'));
      }
    })
    .then(async() => {
      const { PartnerBackend } = require('../../partner/partner.backend');

      if (currentRegion.shortCode === 'DE') {
        if (!payload.partner) {
          const gsmbPartnerId = await PartnerBackend.findOne({
            'metadata.regionMaster': 'DE'
          }, {...req, ignoreNotFoundError: true});

          payload.partner = gsmbPartnerId && gsmbPartnerId._id;
        }
      }

      const valid = await PartnerBackend.isValid(payload.partner, currentRegion.shortCode, req);
      if (!valid) {
        errors.push(new ErrorMessage(fn, VIOLATIONS.FIELD_VALUE_INVALID, {
          text: 'Agent is invalid',
          resource: ['VIOLATION.FIELD_VALUE_INVALID', 'AGENT'],
        }, 'partner'));
      }
    })
    .then(() => {
      let err = null;
      if (errors.length > 0) {
        logger.info(fn, 'found validation violations:', JSON.stringify(errors));

        if (context.order) {
          // this is not accepted, throw error and stop events
          err = new ValidationError(null, errors);
        } else if (context.cart) {
          // treat all as warnings
          emitter.importWarnings(context.event, errors);
        }
      } else {
        logger.info(fn, 'no violations');
      }

      next(err);
    })
    .catch((err) => {
      logger.error(fn, 'Error:', err);
      next(err);
    });
};

module.exports = processEvent;
