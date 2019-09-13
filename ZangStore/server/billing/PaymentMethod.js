const ns = '[billing][PaymentMethod]';

import logger from 'applogger';
import config from '../../config';
import * as constants from './Constants';
import { nonBlockify } from '../modules/utils';
import { BillingError, ERROR_CODES } from './Error';

import UserSchema from '../../schemas/UserSchema';
import ContractSchema from '../../schemas/ContractSchema';
import BillingAccountSchema from '../billingaccount/billingaccount.model';

const {
  StripeBackendCA,
  StripeBackendUS,
  isStripeGateway,
  LoadStripe
} = require('./integrations/stripe');
/**
 * Create a new payment source on payment gateway. If no customer exists on gateway, then create one and store the mapping in the user model.
 * @param {*} req 
 * @param {object} payment_obj 
 * @param {string} payment_gateway 
 */
export async function asyncCreateCreditCard(req, payment_obj, billingAccountId, payment_gateway = constants.PAYMENT_GATEWAYS.STRIPE)    {
  const func = `[${req.requestId}]${ns}[asyncCreateCreditCard]`;

  if (!constants.PAYMENT_GATEWAYS.hasOwnProperty(payment_gateway))  {
    logger.error(func, 'gateway does not exist', payment_gateway);
    throw new BillingError("Gateway does not exist", ERROR_CODES.PAYMENT_GATEWAY_NOT_FOUND);
  }

  logger.info(func, 'gateway', payment_gateway, payment_obj);
 
  let cardValidationError = null;
  let paymentMethodData = {};

  let gatewayExternalObj = await asyncGetGatewayRefIdVerify(req, billingAccountId, payment_gateway);
  
  let billingAccount;

  if (isStripeGateway(payment_gateway)) {
    let customerId = gatewayExternalObj ? gatewayExternalObj.id : undefined;
    let token = payment_obj.stripeToken;
    let stripe = LoadStripe(payment_gateway);
    if (!token) {
      try {
        token = await stripe.CreateCardToken(payment_obj);
      }
      catch(e)  {
        logger.warn(func, 'Invalid Card', e);
        throw new BillingError(e.message, ERROR_CODES.INVALID_CREDIT_CARD);
      }

      let tokenCard = token.card;

      if (!tokenCard)  {
        logger.warn(func, 'Invalid Card');
        throw new BillingError('Invalid credit card.', ERROR_CODES.INVALID_CREDIT_CARD);
      }

      logger.info(func, 'created stripe token', token);

      if(tokenCard.address_line1_check == 'fail') {
        logger.warn(func, 'Invalid Card Address, address_line1_check:', tokenCard.address_line1_check);
        cardValidationError = 'Billing address does not match credit card.';
      }

      if(tokenCard.address_zip_check == 'fail') {
        logger.warn(func, 'Invalid Card Address, address_zip_check:', tokenCard.address_zip_check);
        cardValidationError = 'Billing address does not match credit card.';
      }

      if(tokenCard.cvc_check == 'fail'){
        logger.warn(func, 'Invalid Credit Card cvc, cvc_check:', tokenCard.cvc_check);
        cardValidationError = 'INVALID_SECURITY_CODE';
      }

      if(cardValidationError){
        logger.info(func, 'card validation error', cardValidationError);
        throw new BillingError(cardValidationError, ERROR_CODES.INVALID_CREDIT_CARD);
      }
    }

    let card;
    if (customerId)    {
      logger.info(func, 'start create source');

      try{
        card = await stripe.createSource(customerId, token.id ? token.id : token);
      } catch(e)  {
        logger.warn(func, 'Invalid Card', e);
        throw new BillingError(e.message, ERROR_CODES.INVALID_CREDIT_CARD);
      }

      logger.info(func, 'created/attached source to customer');
    } else  {
      logger.info(func, 'start create customer', token);
      let customer;
      
      try{
        customer = await stripe.createCustomer({
            email: req.userInfo.username,
            metadata: {
              AvayaStoreEnvironment: config.environment
            },
            source: token.id ? token.id : token,
            description: 'Customer for ' + req.userInfo.username
          });
      } catch (e) {
        logger.warn(func, 'Invalid Card', e);
        throw new BillingError(e.message, ERROR_CODES.INVALID_CREDIT_CARD);
      }
  
      logger.info(func, 'created stripe customer', customer);
  
      customerId = customer.id;

      card = customer.sources && customer.sources.data && customer.sources.data.length > 0 && customer.sources.data[0];

      //update databse record with customerId
      billingAccount = await asyncSetGatewayRefId(req, billingAccountId, customerId, payment_gateway); 

      customer = await stripe.updateCustomer(customerId, {
        metadata: {
          AvayaStoreBillingAccountId: billingAccount._id.toString(),
          AvayaStoreEnvironment: config.environment
        }
      });
    }

    paymentMethodData = {
      billingAccountId: billingAccount ? billingAccount._id : billingAccountId,
      customerId: customerId,
      gateway: payment_gateway,
      sourceId: card.id,
      paymentType: ResolvePaymentType(card.object),
      brand: card.brand,
      last4: card.last4,
      expMonth: card.exp_month,
      expYear: card.exp_year,
      holderName: card.name
    };
  }

  return paymentMethodData;
}

/**
 * Retrieve all credit cards for a user from all available payment gateways.
 * @param {*} req 
 */
export async function asyncGetCreditCards(req, billingAccountId, payment_gateway = constants.PAYMENT_GATEWAYS.STRIPE) {  
  const func = ns + '[asyncGetCreditCards]';
  logger.info(req.requestId, func, 'begin', payment_gateway);

  if (config.ENABLE_PLAN_B_SOFT_LAUNCH_MODE) {
    let billingAccount = await BillingAccountSchema.findOne({
      _id: billingAccountId
    });

    if (!billingAccount)  {
      logger.error(func, 'billing account not found', billingAccountId);
      throw new BillingError('Billing account not found.', ERROR_CODES.BILLING_ACCOUNT_NOT_FOUND);
    }

    logger.info(req.requestId, func, 'get payment method to user Success', billingAccount.paymentGateways);

    let pMethods = [];
    if (billingAccount.paymentGateways) {
      if (billingAccount.paymentGateways[payment_gateway]) {
        let stripe = LoadStripe(payment_gateway);
        let gatewayObj = billingAccount.paymentGateways[payment_gateway];
        let customer = await stripe.getCustomer(gatewayObj.customerId);

        logger.debug(func, 'customer obj', customer);

        if (customer && customer.sources && customer.sources.data)  {
          const parseCards = nonBlockify((card) =>  {
            if (card.object == "card")  {
              if (card.id == customer.default_source) {
                card.default = true;
              }
              card.paymentMethodObject = {
                billingEngine: payment_gateway,
                metadata: {
                  paymentType: constants.STRIPE_OBJECTS.card,
                  customerId: customer.id,
                  sourceId: card.id,
                  creditCard: { // do not store real credit card here
                    brand: card.brand,
                    last4: card.last4,
                    expMonth: card.exp_month,
                    expYear: card.exp_year,
                    holderName: card.name,
                  },
                },
              };
              pMethods.push(card);
            }
          });

          for (let card of customer.sources.data) {
            await parseCards(card);
          }
        }
        
        logger.debug(func, 'paymentmethods', pMethods);
      }
    }
    return pMethods;
  }
}


/**
 * Get a particular credit card.
 * @param {*} req 
 * @param {string} gateway 
 * @param {string} sourceId 
 */
export async function asyncGetCreditCard(req, billingAccountId, sourceId, gateway = constants.PAYMENT_GATEWAYS.STRIPE) {
  const func = `[${req.requestId}]${ns}[asyncGetCreditCard]`;

  if (!constants.PAYMENT_GATEWAYS.hasOwnProperty(gateway)) {
    logger.error(func, 'gateway does not exist', gateway);
    throw new BillingError("Gateway does not exist", ERROR_CODES.PAYMENT_GATEWAY_NOT_FOUND);
  }

  if (config.ENABLE_PLAN_B_SOFT_LAUNCH_MODE) {
    let billingAccount = await BillingAccountSchema.findOne({
      _id: billingAccountId
    });  

    if (billingAccount.paymentGateways && billingAccount.paymentGateways.hasOwnProperty(gateway)) {
      logger.info(func, 'get payment method to user Success', billingAccount.paymentGateways[gateway]);

      let payment_obj = {};
      let creditCard; 
      let gatewayObj = billingAccount.paymentGateways[gateway];

      if (isStripeGateway(gateway)) {
        let customerId = gatewayObj.customerId;
        let stripe = LoadStripe(gateway);
        if (customerId) {
          creditCard = await stripe.getCustomer(customerId, sourceId);
        } else {
          throw new BillingError('Unable to find customer id.', ERROR_CODES.GATEWAY_REF_NOT_FOUND);
        }

        payment_obj.customerId = customerId;
      }
      
      payment_obj = {
        ...payment_obj,
        billingAccountId: billingAccount._id,
        gateway: gateway,
        sourceId: creditCard.id,
        paymentType: ResolvePaymentType(creditCard.object),
        brand: creditCard.brand,
        last4: creditCard.last4,
        expMonth: creditCard.exp_month,
        expYear: creditCard.exp_year,
        holderName: creditCard.name
      };
      return payment_obj;
    }
  }
}

/**
 * Delete a payment method from payment gateway.
 * @param {*} req 
 * @param {string} payment_gateway 
 * @param {string} sourceId 
 */
export async function asyncDeletePaymentMethod(req, billingAccountId, sourceId, payment_gateway = constants.PAYMENT_GATEWAYS.STRIPE) {
  const func = ns + '[asyncDeletePaymentMethod]';

  if (!constants.PAYMENT_GATEWAYS.hasOwnProperty(payment_gateway))  {
    logger.error(func, 'gateway does not exist', payment_gateway);
    throw new BillingError("Gateway does not exist", ERROR_CODES.PAYMENT_GATEWAY_NOT_FOUND);
  }

  logger.info(func, 'payment_gateway', payment_gateway, 'billingAccountId', billingAccountId, 'customerId', sourceId);

  if (config.ENABLE_PLAN_B_SOFT_LAUNCH_MODE)  {
    let gatewayExternalObj = await asyncGetGatewayRefIdVerify(req, billingAccountId, payment_gateway);

    let deleteConfirmation, customerDeleteConfirmation;

    if (isStripeGateway(payment_gateway)) {
      let stripe = LoadStripe(payment_gateway);
      let contracts = await ContractSchema.find({ 
        'trdParty.status': constants.CONTRACT_STATUS.ENABLED, 
        'billingAccountId': billingAccountId,
        'paymentMethod.gateway': payment_gateway,
        'paymentMethod.customerId': gatewayExternalObj.id
      });
  
      if (contracts.length > 0 && gatewayExternalObj.default_source == sourceId)  {
        throw ("A contract exists for this payment method, cannot delete");
      }

      logger.info(func, 'delete customer', gatewayExternalObj.id, 'source', sourceId);

      deleteConfirmation = await stripe.deleteSource(gatewayExternalObj.id, sourceId);

      if (gatewayExternalObj.sources.total_count == 0) {
        customerDeleteConfirmation = await stripe.customers.del(gatewayExternalObj.id);
        await asyncUnsetGatewayRefId(req, billingAccountId, payment_gateway);
      }
    }

    return customerDeleteConfirmation || deleteConfirmation;
  }
}

/**
 * Remove all payment methods for a user from all payment gateways.
 * @param {*} req 
 */
export async function asyncDeleteAllPaymentMethods(req)  {
  const func = req.requestId + ns + '[asyncDeleteAllPaymentMethods]';

  logger.info(func, 'begin');

  let user = await UserSchema.findOne({ _id: req.userInfo.userId });
  const billingAccounts = await BillingAccountSchema.find({
    members: {
      $elemMatch: {
        userId: req.userInfo.userId,
        permission: constants.BILLING_ACCOUNT_PERM.ADMIN
      }
    }
  });

  let customerDeleteConfirmation;

  if (billingAccounts) {
    for (let billingAccount of billingAccounts) {
      for (let payment_gateway_key of Object.keys(billingAccount.paymentGateways))  {
        let gatewayObj = billingAccount.paymentGateways[payment_gateway_key];
        if (!gatewayObj)  {
          continue;
        }
        if (isStripeGateway(payment_gateway_key)) {
          let stripe = LoadStripe(payment_gateway_key)
          customerDeleteConfirmation = await stripe.deleteCustomer(gatewayObj.customerId);
          await asyncUnsetGatewayRefId(req, billingAccount._id, payment_gateway_key);
        } else if (payment_gateway_key == constants.PAYMENT_GATEWAYS.NATIVE) {
          await asyncUnsetGatewayRefId(req, billingAccount._id, constants.PAYMENT_GATEWAYS.NATIVE);
        }
      }
    }
  }

  logger.info(func, 'all payment methods deleted succesfully');

  return customerDeleteConfirmation;
}

export async function asyncSetDefaultPaymentMethod(req, billingAccountId, sourceId, payment_gateway = constants.PAYMENT_GATEWAYS.STRIPE)  {
  let func = `[${req.requestId}]${ns}[asyncSetDefaultPaymentMethod]`;

  logger.info(func, 'begin');

  if (!constants.PAYMENT_GATEWAYS.hasOwnProperty(payment_gateway))  {
    logger.error(func, 'gateway does not exist', payment_gateway);
    throw new BillingError("Gateway does not exist", ERROR_CODES.PAYMENT_GATEWAY_NOT_FOUND);
  }

  let gatewayStr = `paymentGateways.${payment_gateway}.default`;
  let billingAccount = await BillingAccountSchema.findOneAndUpdate({
    _id: billingAccountId
  },  {
    [gatewayStr]: true
  });

  let gatewayRefId = await asyncGetGatewayRefId(req, billingAccountId, payment_gateway);
 
  if (billingAccount) {
    if (isStripeGateway(payment_gateway)) {
      let stripe = LoadStripe(payment_gateway);
      let customer = await stripe.updateCustomer(gatewayRefId, {
        default_source: sourceId
      });  
      logger.info(func, 'stripe customer updated');
    }
  }
}

/**
 * Get customerID for a particular payment gateway.
 * @param {*} req 
 * @param {string} payment_gateway 
 */
export async function asyncGetGatewayRefId(req, billingAccountId, payment_gateway = constants.PAYMENT_GATEWAYS.STRIPE) {
  const func = req.requestId + ns + '[asyncGetGatewayRefId]';

  let billingAccount = await BillingAccountSchema.findOne({
    _id: billingAccountId
  });
  
  let gatewayObj;
  if (billingAccount.paymentGateways && billingAccount.paymentGateways.hasOwnProperty(payment_gateway) && billingAccount.paymentGateways[payment_gateway] && billingAccount.paymentGateways[payment_gateway].customerId) {
    gatewayObj = billingAccount.paymentGateways[payment_gateway];
  }

  if (gatewayObj) {
    if (isStripeGateway(payment_gateway)) {
      return gatewayObj.customerId
    }
  }

  return null;
}

/**
 * Get customerID for a particular gateway and verify it exists on external gateway.
 * @param {*} req 
 * @param {string} payment_gateway 
 */
async function asyncGetGatewayRefIdVerify(req, billingAccountId, payment_gateway = constants.PAYMENT_GATEWAYS.STRIPE) {
  const func = req.requestId + ns + '[asyncGetGatewayRefIdVerify]';
  
  logger.info(func, 'begin');

  if (!billingAccountId) {
    return null;
  }

  let billingAccount = await BillingAccountSchema.findOne({
    _id: billingAccountId
  });

  logger.info(func, 'search billing acccount', billingAccount);

  let gatewayObj;
  if (billingAccount && billingAccount.paymentGateways && billingAccount.paymentGateways.hasOwnProperty(payment_gateway) && billingAccount.paymentGateways[payment_gateway]) {
    gatewayObj = billingAccount.paymentGateways[payment_gateway];
  }

  let gatewayExternalObj;
  if (gatewayObj) {
    if (isStripeGateway(payment_gateway)) {
      let stripe = LoadStripe(payment_gateway)
      let customerId = gatewayObj.customerId;
      gatewayExternalObj = await stripe.getCustomer(customerId);
    }
  }

  logger.info(func, 'external obj', gatewayExternalObj);

  if (gatewayExternalObj && !gatewayExternalObj.deleted)  {
    return gatewayExternalObj;
  } else  {
    if (billingAccountId && billingAccount) {
      await asyncUnsetGatewayRefId(req, billingAccountId, payment_gateway);
    }
  }
}

/**
 * Save external payment gateway customerID
 * @param {*} req 
 * @param {string} payment_gateway 
 * @param {string} customerId 
 */
async function asyncSetGatewayRefId(req, billingAccountId, customerId, payment_gateway = constants.PAYMENT_GATEWAYS.STRIPE) {
  const func = req.requestId + ns + '[asyncSetGatewayRefId]';

  logger.info(func, 'begin', { billingAccountId, customerId, payment_gateway });

  if (!constants.PAYMENT_GATEWAYS.hasOwnProperty(payment_gateway))  {
    logger.error(func, 'gateway does not exist', payment_gateway);
    throw new BillingError("Gateway does not exist", ERROR_CODES.PAYMENT_GATEWAY_NOT_FOUND);
  }

  let gatewayObj;
  if (isStripeGateway(payment_gateway)) {
    gatewayObj = {
      customerId: customerId
    };
  }

  if (!gatewayObj)  {
    throw new BillingError('Gateway ref not found.', ERROR_CODES.GATEWAY_REF_NOT_FOUND);
  }

  let billingAccount
  if (billingAccountId) {
    billingAccount = await BillingAccountSchema.findOneAndUpdate({
      _id: billingAccountId
    }, {
      $set: {
        [`paymentGateways.${payment_gateway}`]: gatewayObj         
      }
    });
  
    logger.info(func, 'billing account updated', billingAccount);
  } else  {
    gatewayObj.default = true;

    billingAccount = await BillingAccountSchema.create({
      paymentGateways: {
        [payment_gateway]: gatewayObj 
      },
      members: [
        {
            permission: constants.BILLING_ACCOUNT_PERM.ADMIN,
            userId: req.userInfo.userId
        }
      ],
      created:  {
        by: req.userInfo.userId
      }
    });
  }

  if (!billingAccount)  {
    logger.error(func, 'Cannot find/create billing account');
    throw ('Cannot find/create billing account');
  }
  logger.info(func, 'billing account created', billingAccount);

  return billingAccount;
}

/**
 * Remove a customerID mapping to external payment gateway.
 * @param {*} req 
 * @param {string} payment_gateway 
 */
async function asyncUnsetGatewayRefId(req, billingAccountId, payment_gateway = constants.PAYMENT_GATEWAYS.STRIPE) {
  const func = req.requestId + ns + '[asyncUnsetGatewayRefId]';

  logger.info(func, 'begin');

  let obj_name = `paymentGateways.${payment_gateway}`;
  await BillingAccountSchema.findOneAndUpdate({ _id: billingAccountId }, { $unset: { [obj_name] :1 }});
}

/**
 * Find Store users from payment gateway customerId.
 * @param {string} customerId 
 * @param {string} gateway 
 */
export async function resolveUsersByGatewayId(customerId, permission = constants.BILLING_ACCOUNT_PERM.ADMIN, payment_gateway = constants.PAYMENT_GATEWAYS.STRIPE)   {
  let func = `${ns}[resolveUsersByGatewayId]`;

  logger.info(func, 'begin');

  if (!customerId) {
      return null;
  }

  if (!constants.PAYMENT_GATEWAYS.hasOwnProperty(payment_gateway))  {
    logger.error(func, 'gateway does not exist', payment_gateway);
    throw new BillingError("Gateway does not exist", ERROR_CODES.PAYMENT_GATEWAY_NOT_FOUND);
  }

  let gatewayProp;
  if (isStripeGateway(payment_gateway)) {
    gatewayProp = 'customerId';
  }

  let gatewaystr = `paymentGateways.${payment_gateway}.${gatewayProp}`;

  let billingAccount = await BillingAccountSchema.findOne({
      [gatewaystr]: customerId
  });

  if (billingAccount && billingAccount.members) {
    const userIds = billingAccount.members.filter((one) => one.permission == constants.BILLING_ACCOUNT_PERM.ADMIN).map((one) => one.userId);

    let users = await UserSchema.find({
      _id: {
        $in: userIds
      }
    });
  
    return users;
  }
}

/**
 * Convert store payment type to type used by payment gateway.
 * @param {string} paymentType 
 * @param {string} payment_gateway 
 */
function ResolvePaymentType(paymentType, payment_gateway = constants.PAYMENT_GATEWAYS.STRIPE) {
  let func = `${ns}[ResolvePaymentType]`;

  if (!constants.PAYMENT_GATEWAYS.hasOwnProperty(payment_gateway))  {
    logger.error(func, 'gateway does not exist', payment_gateway);
    throw new BillingError("Gateway does not exist", ERROR_CODES.PAYMENT_GATEWAY_NOT_FOUND);
  }

  if (isStripeGateway(payment_gateway)) {
    if (constants.STRIPE_OBJECTS.hasOwnProperty(paymentType)) {
      return constants.STRIPE_OBJECTS[paymentType];
    }
  }

  return paymentType;
}