import userModel from '../models/UserModel';
import esErr from '../modules/errors';
import cst from '../modules/constants';

import constants from '../config/constants'
import logger from 'applogger';
import DBWrapper from 'dbwrapper'
import async from 'async'
import _ from 'lodash'
import UserSchema from '../schemas/UserSchema'
import LookupModel from '../models/LookupModel'

import PartnerModel from '../models/PartnerModel'
import PartnerConnectionModel from '../models/PartnerConnectionModel'
import { asyncDeleteAllPaymentMethods } from '../server/billing/PaymentMethod';
import { CancelSubscription } from '../server/billing/Subscription';
import { DeletePlan } from '../server/billing/Plan';
import { UnCommitTransaction } from '../server/billing/Tax';
import ZCloud from '../models/zcloud/API';
import IpOfficeSubscriptionTrackSchema from '../schemas/IpOfficeSubscriptionTrackSchema';

//new store 2.0
import { nonBlockify } from '../server/modules/utils';
import { CartBackend } from '../server/cart/cart.backend';
const { OrderBackend } = require('../server/order/order.backend');
const { PurchasedPlanBackend } = require('../server/purchased-plan/purchased-plan.backend');
const { UnauthorizedError, BadRequestError } = require('../server/modules/error');
import { IPOfficeSubscriptionTrackBackend } from '../server/ip-office/models/ipoffice-subscription-track.backend';
import TransactionSchema from '../server/transaction/transaction.model';
import escapeStringRegexp from 'escape-string-regexp';

var ns = '[UserController]';
var UserController = {};

UserController.getUsers = function (req, res, next) {
  logger.info(req.requestId, ns, '[listUsers]')
  let query = req.query.search ? { 'account.username': { '$regex': escapeStringRegexp(req.query.search.toLowerCase()) } } : {}

  logger.info(req.requestId, ns, '[listUsers]:query', JSON.stringify(query))
  DBWrapper.execute(
    UserSchema,
    UserSchema.find,
    req.requestId,
    query,
    (err, users) => {
      if(err){
        logger.error(req.requestId, ns, '[listUsers]', err)
        users = []
      }
      res.render('user/UserList', {
        title : 'Users',
        users: users,
        search: req.query.search
      });
    }
  )

};

UserController.editUser = function (req, res, next) {
  logger.info(req.requestId, ns, '[editUser]')
  DBWrapper.execute(
    UserSchema,
    UserSchema.findOne,
    req.requestId,
    { _id: req.params.id },
    (err, user) => {
      if(err){
        res.redirect('/')
      } else {
        user.accountInformation = user.accountInformation || {}
        user.billingInformation = user.billingInformation || {}
        user.shippingInformation = user.shippingInformation || {}
        res.render('user/UserEdit', {
          title: user.account.displayname,
          user: user
        })
      }
    }
  )
}

UserController.changeAccessLevel = (req, res) => {
  logger.info(req.requestId, ns, '[changeAccessLevel]')
  let accessLevels = [];
  for(let l in constants.USER_LEVELS){
    if(constants.USER_LEVELS.hasOwnProperty(l)){
      accessLevels.push(constants.USER_LEVELS[l])
    }
  }

  let level = parseInt(req.query.level)

  if(accessLevels.indexOf(level) < 0){

    logger.error(req.requestId, ns, '[changeAccessLevel]', level)
    return res.redirect('/user')
  }

  DBWrapper.execute(
    UserSchema,
    UserSchema.findOneAndUpdate,
    req.requestId,
    { _id: req.params.id },
    { accessLevel: level },
    (err, user) => {
      if(err){
        logger.error(req.requestId, ns, '[changeAccessLevel]', JSON.stringify(err))
      }
      res.redirect('/user')
    }
  )
}

UserController.getUser = (req, userId, callback) => {
  logger.info(req.requestId, ns, '[getUser]')
  DBWrapper.execute(
    UserSchema,
    UserSchema.findOne,
    req.requestId,
    { _id: userId },
    (err, user) => {
      if(err){
        logger.error(req.requestId, ns, '[gerInfo]:Error redirecting home', JSON.stringify(err))
        callback(err)
      } else {
        user.accountInformation  = user.accountInformation  || {}
        user.billingInformation  = user.billingInformation  || {}
        user.shippingInformation = user.shippingInformation || {}
        callback(null, user)
      }
    }
  )
}

UserController.asyncGetUser = async (req, userId) => {
  logger.info(req.requestId, ns, '[getUser]');
  let user = await UserSchema.findOne({ _id: userId })
  user.accountInformation  = user.accountInformation  || {}
  user.billingInformation  = user.billingInformation  || {}
  user.shippingInformation = user.shippingInformation || {}
  return user;  
}

UserController.getUserInformation = (req, res) => {
  logger.info(req.requestId, ns, '[getInfo]')
  let userId = req.params.id === 'me' ? req.userInfo.userId : req.params.id
  UserController.getUser(req, userId, (err, user) => {
    if(err){
      return res.redirect('/')
    }
    res.render('user/UserInformation', {
      userId: req.params.id,
      user,
      active: 'info'
    })
  })
}

//this is for store 1.5
UserController.getUserOrdersBySlug = async (req, res, next) => {
  const fn = `[${req.requestId}]${ns}[getUserOrdersBySlug]`;  
  let mine = req.params.id === 'me'
  let userId = mine ? req.userInfo.userId : req.params.id
  let slug = req.params && req.params.slug || 'ip-office'
  
  const user = await UserController.asyncGetUser(req, userId);
  // logger.info(fn, 'user:', user)
  let query = {};
  if(req.query.search){
    query['confirmationNumber'] = { '$regex': escapeStringRegexp(req.query.search) }
  }
  try {
    if (!user) {
      // FIXME: this should be handled by middleware
      throw new UnauthorizedError();
    }
    let orders = await OrderBackend.findByUser(user, {
      requestId: req.requestId,
      localizer: req.localizer,
      populate: [],
      query: query
    });
    logger.info(fn, 'orders:', orders);
    res.render('user-view/UserOrders', {
      slug: slug,
      userId: req.params.id,
      user,
      orders,
      search: req.query.search,
      active: 'orders',
    })
  } catch (error) {
    next(error);
  }

}


//this is for store 1.5
UserController.getUserSubscriptionsBySlug = async (req, res, next) => {
  const fn = `[${req.requestId}]${ns}[getUserSubscriptionsBySlug]`;  
  let mine = req.params.id === 'me'
  let userId = mine ? req.userInfo.userId : req.params.id
  let slug = req.params && req.params.slug || 'ip-office'
  
  const user = await UserController.asyncGetUser(req, userId);
  // logger.info(fn, 'user:', user)
  
  let query = {};
  if(req.query.search){
    query['confirmationNumber'] = { '$regex': escapeStringRegexp(req.query.search) }
  }
  try {
    if (!user) {
      // FIXME: this should be handled by middleware
      throw new UnauthorizedError();
    }
    let purchasedPlans = await PurchasedPlanBackend.findByUser(user, {
      requestId: req.requestId,
      localizer: req.localizer,
      populate: [],
      query: query
    });
    logger.info(fn, 'purchasedPlans:', purchasedPlans);


    res.render('user-view/UserSubscriptions', {
      slug: slug,
      userId: req.params.id,
      user,
      purchasedPlans: purchasedPlans || [],
      search: req.query.search,
      active: 'contracts',
    })
  } catch (error) {
    next(error);
  }

}

UserController.resetAllMyPartners = (req, res)  =>  {
  let functionName = '[resetAllMyPartners]'
  logger.info(req.requestId, ns, functionName)
  let userId = req.userInfo.userId

  let data = {
    userId: userId
  }

  PartnerModel.removePartner(req, data, (err) =>  {
    if (err)  {
      logger.info(req.requestId, ns, functionName, 'remove partner failed');
    }
    res.redirect('/');
  })

};

UserController.resetAllPurchases = (req, res) => {
  let functionName = '[resetAllPurchases]'
  logger.info(req.requestId, ns, functionName)
  let userId = req.userInfo.userId

  async.waterfall([
    //delete cart items
    // (callback) => {
    //   CartModel.removeItems(req, { 'created.by': userId }, (err) => {
    //     if(err){
    //       logger.error(req.requestId, ns, functionName, ':CartModel.removeItems', JSON.stringify(err))
    //     }
    //     callback(null)
    //   })
    // },
    //delete order statuses
    // (callback) => {
    //   OrderStatusModel.remove(req, { 'created.by': userId }, (err) => {
    //     if(err) {
    //       logger.error(req.requestId, ns, functionName, ':OrderStatusModel.remove', JSON.stringify(err))
    //     }

    //     callback(null)
    //   })
    // },
    //prepare delete orders
    // (callback) => {
    //   OrderModel.getOrders(req, { 'created.by': userId }, (err, orders) => {
    //     if(err) {
    //       logger.error(req.requestId, ns, functionName, ':OrderModel.remove', JSON.stringify(err))
    //     }
    //     async.each(orders, async (order, intercallback) =>  {
    //       async.each(order.items, async (item, intercallback2)  =>  {
    //         if (item.product && item.product.price && item.product.price.OneTimeTaxId) {
    //           let uncommitResult = await UnCommitTransaction(req, item.product.price.OneTimeTaxId);
    //         }
    //         if (item.product && item.product.price && item.product.price.intervalTaxId) {
    //           let uncommitResult = await UnCommitTransaction(req, item.product.price.intervalTaxId);
    //         }
    //         intercallback2();
    //       }, (err) =>  {
    //         intercallback(err);
    //       });
    //     }, (err)  =>  {
    //       callback(null)
    //     });
    //   })
    // },
    //delete orders
    // (callback) => {
    //   OrderModel.remove(req, { 'created.by': userId }, (err) => {
    //     if(err) {
    //       logger.error(req.requestId, ns, functionName, ':OrderModel.remove', JSON.stringify(err))
    //     }
    //     callback(null)
    //   })
    // },
    // (callback)  =>  {
    //   ContractModel.getContracts(req, {'created.by': userId }, (err, contracts) =>  {
    //     async.each(contracts, async (contract, intercallback) =>  {
    //       try{
    //         if (contract.paymentMethod && contract.paymentMethod.subscriptionId)  {
    //           try{
    //             let subscriptionConfirm = await CancelSubscription(req, contract.paymentMethod.subscriptionId, contract.paymentMethod.gateway);
    //           }
    //           catch(e)  {
    //             logger.error('Error cancelling subscription', e, 'subscription', contract.paymentMethod.subscriptionId, 'gateway', contract.paymentMethod.gateway);
    //           }
    //         }
            
          
    //         let ipOfficeSubscriptionRemove = await IpOfficeSubscriptionTrackSchema.findOneAndRemove({
    //           OrderID: contract._id
    //         });

    //         if (contract.trdParty && contract.trdParty.meta && contract.trdParty.meta && contract.trdParty.meta.ipaclSID) {
    //           await new Promise((resolve, reject) => {
    //             ZCloud.deleteACLIP(req, contract.trdParty.meta.ipaclSID, (err, result)  =>  {
    //               resolve(err, result);
    //             });
    //           });
    //         }

    //         if (contract.trdParty && contract.trdParty.meta && contract.trdParty.meta && contract.trdParty.meta.sipDomain && contract.trdParty.meta.sipDomain.sid)  {
    //           await new Promise((resolve, reject) => {
    //             ZCloud.deleteSIPDomain(req, contract.trdParty.meta.sipDomain.sid, (err, result)  =>  {
    //               resolve(err, result);
    //             });
    //           });
    //         }

    //         if (contract.trdParty && contract.trdParty.meta && contract.trdParty.meta.phone_number && contract.trdParty.meta.phone_number.sid) {
    //           await new Promise((resolve, reject) => {
    //             ZCloud.deletePhoneNumber(req, contract.trdParty.meta.phone_number.sid, (err, result)  =>  {
    //               resolve(err, result);
    //             });
    //           });
    //         }

    //         if (contract.trdParty && contract.trdParty.meta && contract.trdParty.meta && contract.trdParty.meta.applicationSID) {
    //           await new Promise((resolve, reject) => {
    //             ZCloud.deleteApplication(req, contract.trdParty.meta.applicationSID, (err, result)  =>  {
    //               resolve(err, result);
    //             });
    //           });
    //         }

    //         let uncommitResult = await UnCommitTransaction(req, contract.price.taxId);
    //       }
    //       catch(e)  {
    //         logger.error(req.requestId, ns, functionName,'remove contracts extra error', e);
    //         return intercallback();
    //       }
          
    //       intercallback();
    //     }, (err)  =>  {
    //       if (err)  {
    //         logger.error(req.requestId, ns, functionName, 'remove contracts extra error', err);
    //       }
    //       callback(err);
    //     })
    //   });
    // },
    // //delete contracts
    // (callback) => {
    //   ContractModel.remove(req, { 'created.by': userId }, (err) => {
    //     if(err) {
    //       logger.error(req.requestId, ns, functionName, ':ContractModel.remove', JSON.stringify(err))
    //     }

    //     callback(null)
    //   })
    // },
    (callback) => {
      asyncDeleteAllPaymentMethods(req).then(() =>  {
        callback(null);
      }).catch((err)  =>  {
        logger.error('delete failed', err);
        callback(null);
      });
    },
    (callback) => {
      PartnerModel.removePartnerCustomer(req, {
        customer: req.userInfo.userId
      }, (err) => {
        if(err) {
          logger.error(req.requestId, ns, functionName, ':ContractModel.remove', JSON.stringify(err))
        }
      })
      callback(null)
    },
    (callback) => {
      PartnerModel.removePartnerOrder(req, {
        customer: req.userInfo.userId
      }, (err) => {
        if(err) {
          logger.error(req.requestId, ns, functionName, ':ContractModel.remove', JSON.stringify(err))
        }
      })
      callback(null)
    },
    (callback) => {
      PartnerConnectionModel.removeConnection(req, {
        customer: req.userInfo.userId
      }, (err) => {
        if(err) {
          logger.error(req.requestId, ns, functionName, ':ContractModel.remove', JSON.stringify(err))
        }
      })
      callback(null)
    },
    async.asyncify(async ()  =>  {
    try{
      const func = '[Remove new schema orders]';
      
      logger.info(func, 'begin');

      const [ cartResult, purchasedPlans ] = await Promise.all([
        CartBackend.removeByUser(req.userInfo, {
          requestId: req.requestId
        }),
        PurchasedPlanBackend.findByUser(req.userInfo, {
          requestId: req.requestId
        })
      ]);

      const { ASEventEmitter } = require('../server/modules/event');
      const { ASEVENT_ORDER_BEFORE_DELETE } = require('../server/modules/event/constants');

      for (let pp of purchasedPlans)  {
        logger.debug(func, 'pp:', pp);

        try{
          for (let orderId of pp.orderIds) {
            await UnCommitTransaction(req, `${orderId}_order`);

            await TransactionSchema.remove({
              refObject: orderId,
              refObjectType: 'order'
            });
          }
  
          for (let si of pp.subscriptions) {
            await UnCommitTransaction(req, `${si._id}_purchasedplan.subscriptions`);

            await TransactionSchema.remove({
              refObject: si._id,
              refObjectType: 'purchasedplan.subscriptions'
            });
          }
        } catch(e)  {
          logger.error(func, 'error', e);
        }

        logger.debug(func, 'tax uncommited');

        const context = {
          requestId: req.requestId,
          user: req.userInfo,
          purchasedPlan: pp,
        };
        const eventResult1 = await ASEventEmitter.emitPromise(ASEVENT_ORDER_BEFORE_DELETE, context);
        if (eventResult1 && eventResult1 instanceof Error) {
          //throw eventResult1;
        }
      }

      const [ purchasedPlanResult, orderResult ] = await Promise.all([
        PurchasedPlanBackend.removeByUser(req.userInfo, {
          requestId: req.requestId
        }),
        OrderBackend.removeByUser(req.userInfo, {
          requestId: req.requestId
        })
      ]);
      logger.info(func, 'new schema orders cleaned up');
      return;
    }catch(e) {
      logger.error(func, 'Error*:', e);
    }
    })
  ], (err) => {
    logger.info(req.requestId, ns, functionName, ':All Rurchases reset')
    res.redirect('/')
  })
}


module.exports = UserController;
