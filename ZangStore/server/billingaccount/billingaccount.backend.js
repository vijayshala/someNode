const ns = '[billingaccount.backend]';
const logger = require('applogger');

const { DbBase } = require('../modules/db/index');
const BillingAccountSchema = require('./billingaccount.model');
const { 
  BILLING_ACCOUNT_PERM,
  PAYMENT_GATEWAYS
} = require('../billing/Constants');
const {
 PO_STATUS_PENDING,
 PO_STATUS_APPROVED,
 PO_STATUS_REJECTED
} = require('./billingaccount.constants');
const globalcontants = require('../../config/constants');
const { BadRequestError } = require('../modules/error');
const { GetCreditCards } = require('../billing/integrations/stripe');
const { 
  PopulatePaymentMethods, 
  SendPOEmailConfirmation, 
  SendPOPendingEmail, 
  SendPOApprovedEmail,
  SendPORejectedEmail
} = require('./billingaccount.utils');
const { UserBackend } = require('../user/user.backend');
const { ERROR_CODES } = require('../billing/Error');
const { ASEventEmitter } = require('../modules/event');
const {
  ASEVENT_PO_APPROVED,
  ASEVENT_PO_REJECTED
} = require('../modules/event/constants');

class BillingAccountBackend extends DbBase {
  async findByUser(user, options) {
    let fn = `[${options && options.requestId}]${ns}[findByUser]`;
    const userId = user && (user._id || user.userId);

    options = Object.assign({
      permission: BILLING_ACCOUNT_PERM.ADMIN,
      populateGateways: false
    }, options);
    // logger.info(fn, 'options:', options);

    let query = {};
    if (options.permission) {
      query['members'] = {
        $elemMatch: {
          userId: userId,
          permission: options.permission
        }
      };
    } else {
      query['members.userId'] = userId;
    }

    let billingAccounts = await this.find(query, options);

    if (!billingAccounts || billingAccounts.length == 0)  {
      let newBillingAccount = await this.create({
        paymentGateways: {},
        members: [
          {
              permission: BILLING_ACCOUNT_PERM.ADMIN,
              userId: userId
          }
        ],
        created:  {
          by: userId,
          on: new Date()
        }
      }, options);
      billingAccounts = [newBillingAccount];
    }
    
    if (options.populateGateways && billingAccounts)  {
      for (let billingAccount of billingAccounts) {
        //billingAccount = billingAccount.toObject();
        await PopulatePaymentMethods(billingAccount, options);
        delete billingAccount.paymentGateways;
      }
    }

    // logger.info(fn, 'billingAccounts:', billingAccounts);

    return billingAccounts;
  }

  async findOneByIdentifier(user, identifier, options)  {
    const fn = `[${options.requestId}]${ns}[findOneByIdentifier]`;
    const userId = user && (user._id || user.userId);

    options = Object.assign({
      identifierType: '_id',
      permission: BILLING_ACCOUNT_PERM.ADMIN,
      populateGateways: true
    }, options);

    let query = {};
    query[options.identifierType] = identifier;
    if (!(user.accessLevel <= globalcontants.USER_LEVELS.ADMIN))  {
      if (options.permission) {
        query['members'] = {
          $elemMatch: {
            userId: userId,
            permission: options.permission
          }
        };
      } else {
        query['members.userId'] = userId;
      }
    }

    let billingAccount = await this.findOne(query, options);

    if (options.populateGateways && billingAccount)  {
      // billingAccount = billingAccount.toObject();
      await PopulatePaymentMethods(billingAccount, options);
      delete billingAccount.paymentGateways;
    }

    return billingAccount;
  }

  async savePurchaseOrder(user, billingAccountId, update, options)  {
    const fn = `[${options && options.requestId}]${ns}[savePurchaseOrder]`;
    const userId = user && (user._id || user.userId);

    options = Object.assign({
      permission: BILLING_ACCOUNT_PERM.ADMIN,
      new: true
    }, options);

    let query = {
      _id: billingAccountId
    };

    if (!(user.accessLevel <= globalcontants.USER_LEVELS.ADMIN)) {
      if (options.permission) {
        query['members'] = {
          $elemMatch: {
            userId: userId,
            permission: options.permission
          }
        };
      } else {
        query['members.userId'] = userId;
      }
    }

    const existingBillingAccount = await this.findOne(query, options);

    if (!existingBillingAccount)  {
      throw new BadRequestError('Billing account not found.');
    }

    const purchaseOrderExists = existingBillingAccount && existingBillingAccount.paymentGateways 
        && existingBillingAccount.paymentGateways.NATIVE && existingBillingAccount.paymentGateways.NATIVE.purchaseOrder;

    logger.info(fn, 'existing purchase order', purchaseOrderExists);

    ['approved', 'created', 'updated', '__v', '_id', 'id'].forEach((one) => {
      if (update.hasOwnProperty(one)) {
        delete update[one];
      }
    });

    if (purchaseOrderExists)  {
      update = Object.assign({}, purchaseOrderExists, {
        updated: {
          by: userId,
          on: new Date()
        }
      }, update);
    } else {
      update = Object.assign({
        status: PO_STATUS_PENDING,
        updated: {
          by: userId,
          on: new Date()
        }
      }, update);
    }

    if (user.accessLevel <= globalcontants.USER_LEVELS.ADMIN) {
      if (update.status == PO_STATUS_APPROVED && purchaseOrderExists.status != PO_STATUS_APPROVED)  {
        update.approved = {
          by: userId,
          on: new Date()
        }
      }
    } else {
      if (purchaseOrderExists) {
        throw new BadRequestError('Cannot edit PO.');
      }

      ['approvedLimit', 'status'].forEach((one) => {
        if (update.hasOwnProperty(one)) {
          delete update[one];
        }
      });

      update.status = PO_STATUS_PENDING;
    }
    
    if (!purchaseOrderExists) {
      update.created = {
        by: userId,
        on: new Date()
      };
    }

    logger.info(fn, 'po:', update);

    let billingAccount = await this.findOneAndUpdate(query, {
      $set: {
        'paymentGateways.NATIVE.purchaseOrder': update
      }
    }, options);

    logger.info(fn, 'updated billing account:', billingAccount);

    const updatedPO = billingAccount && billingAccount.paymentGateways && billingAccount.paymentGateways.NATIVE && billingAccount.paymentGateways.NATIVE.purchaseOrder;

    logger.info(fn, 'updated po:', updatedPO);

    const billingAccountAdmins = await this.getMembers(billingAccount, options);

    if (updatedPO.status == PO_STATUS_APPROVED)  {
      const context = {
        requestId: options.requestId,
        localizer: options.localizer,
        userId: userId,
        billingAccount: billingAccount,
        baseUrl: options.baseUrl
      };

      if (!purchaseOrderExists || purchaseOrderExists.status !== PO_STATUS_APPROVED) {
        await SendPOApprovedEmail({
          ...context,
          toUsers: billingAccountAdmins,
          approvedLimit: update.approvedLimit,
          companyName: updatedPO.company.name
        });
      }

      logger.info(fn, 'emit po approved event');

      const eventResult = await ASEventEmitter.emitPromise(ASEVENT_PO_APPROVED, context);
      if (eventResult && eventResult instanceof Error) {
        throw eventResult;
      }
    } else if (updatedPO.status == PO_STATUS_REJECTED)  {

      logger.info(fn, options.requestId);

      const context = {
        requestId: options.requestId,
        localizer: options.localizer,
        baseUrl: options.baseUrl,
        toUsers: billingAccountAdmins,
        companyName: updatedPO.company.name,
        billingAccount: billingAccount,
      };

      if (purchaseOrderExists.status != PO_STATUS_REJECTED)  {
        await SendPORejectedEmail(context);
      }

      const eventResult = await ASEventEmitter.emitPromise(ASEVENT_PO_REJECTED, context);
      if (eventResult && eventResult instanceof Error) {
        throw eventResult;
      }
    }

    if (updatedPO.status === PO_STATUS_PENDING && (!purchaseOrderExists || purchaseOrderExists.status !== PO_STATUS_PENDING))  {
      const context = {
        requestId: options.requestId,
        localizer: options.localizer,
        baseUrl: options.baseUrl,
        toUsers: billingAccountAdmins,
        companyName: updatedPO.company.name
      };

      logger.info(fn, '[PO_STATUS_PENDING]');
      await Promise.all([SendPOEmailConfirmation(context), SendPOPendingEmail(context)]); // fix me
    }

    billingAccount = billingAccount.toObject();
    await PopulatePaymentMethods(billingAccount, options);
    delete billingAccount.paymentGateways;

    logger.info(fn, 'billingaccount:', billingAccount);

    return billingAccount;
  }

  async deletePurchaseOrder(user, billingAccountId, update, options)  {
    const { PurchasedPlanBackend } = require('../purchased-plan/purchased-plan.backend');
    const fn = `[${options && options.requestId}]${ns}[createPurchaseOrder]`;
    const userId = user && (user._id || user.userId);

    options = Object.assign({
      permission: BILLING_ACCOUNT_PERM.ADMIN,
      new: true
    }, options);
   
    let query = {
      _id: billingAccountId
    };

    if (user.accessLevel > globalcontants.USER_LEVELS.ADMIN)  {
      if (options.permission) {
        query['members'] = {
          $elemMatch: {
            userId: userId,
            permission: options.permission
          }
        };
      } else {
        query['members.userId'] = userId;
      }
    }

    const purchasedPlans = await PurchasedPlanBackend.find({
      billingAccount: billingAccountId,
      'payment.billingEngine': 'NATIVE',
      'payment.metadata.purchaseOrder': {
        $exists: false
      }
    });

    if (purchasedPlans && purchasedPlans.length > 0)  {
      throw new BadRequestError('Plan(s) exist using this PO.');
    }

    let billingAccount = await this.findOneAndUpdate(query, {
      $unset: {
        'paymentGateways.NATIVE.purchaseOrder': ''
      }
    }, options);

    if (billingAccount)  {
      //billingAccount = billingAccount.toObject();
      await PopulatePaymentMethods(billingAccount, options);
      delete billingAccount.paymentGateways;
    }
    
    return billingAccount;
  }

  async listPurchaseOrders(options) {
    const fn = `[${options && options.requestId}]${ns}[findPurchaseOrders]`;

    options = Object.assign({
      populateGateways: false
    }, options);

    const billingAccounts = await this.find({
      'paymentGateways.NATIVE.purchaseOrder': {
        $exists: true
      }
    }, { ...options, sort: { "paymentGateways.NATIVE.purchaseOrder.status": -1 } });

    if (billingAccounts && options.populateGateways)  {
      for (let billingAccount of billingAccounts) {
        await PopulatePaymentMethods(billingAccount, options);
      }
    }

    return billingAccounts;
  }

  async getMembers(billingaccount, options) {
    const fn = `[${options && options.requestId}]${ns}[getMembers]`;

    options = Object.assign({
      permission: BILLING_ACCOUNT_PERM.ADMIN
    }, options);

    billingaccount = billingaccount._id ? billingaccount : await this.findOneById(billingaccount, options);

    const members = billingaccount.members.filter(one => one.permission == options.permission);

    let users = [];
    for (let member of members)  {
      let user = await UserBackend.findOneById(member.userId, options);
      users.push(user);
    }

    return users;
  }

  async createIBAN(user, billingAccount, iban, options) {
    const fn = `[${options && options.requestId}]${ns}[createIBAN]`;
    const userId = user && (user._id || user.userId);
    const { HasIBAN } = require('./billingaccount.utils');
    const IBAN = require('iban');

    options = Object.assign({
      permission: BILLING_ACCOUNT_PERM.ADMIN
    }, options);

    if (!IBAN.isValid(iban)) {
      logger.warn(fn, 'invalid IBAN', iban);
      throw new Error('Invalid IBAN');
    }

    billingAccount = billingAccount._id ? billingAccount : await this.findOneById(billingAccount, options);

    if (HasIBAN(billingAccount, iban))  {
      logger.warn(fn, 'IBAN exists', iban);
      throw new Error('IBAN already exists.');
    }

    const ibanObj = {
      value: iban,
      created: {
        by: userId,
        on: new Date()
      }
    };

    const updatedBillingAccount = await this.findOneAndUpdate({
      _id: billingAccount._id
    }, {
      $push: {
        'paymentGateways.GSMB.IBAN': ibanObj
      }
    });

    return ibanObj;
  }
}

let backend = new BillingAccountBackend(BillingAccountSchema, {});

module.exports = {
  BillingAccountBackend: backend,
};
