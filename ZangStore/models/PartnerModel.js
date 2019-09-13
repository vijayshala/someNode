import logger from 'applogger'
import async from 'async'
import DBWrapper from 'dbwrapper'

import config from '../config'
import constants from '../config/constants'

import sendgrid from '../server/modules/email/sendgrid';
import templater from '../server/modules/email/templater';

import Utils from '../common/Utils'
import PartnerSchema from '../schemas/PartnerSchema'
import PartnerAgentSchema from '../schemas/PartnerAgentSchema'
import UserSchema from '../schemas/UserSchema'
import PartnerOrderSchema from '../schemas/PartnerOrderSchema'
import PartnerCustomerSchema from '../schemas/PartnerCustomerSchema'
import PartnerInvitationSchema from '../schemas/PartnerInvitationSchema'
import PartnerConnectionSchema from '../schemas/PartnerConnectionSchema'
import PartnerConnectionModel from './PartnerConnectionModel'
import PageModel from './PageModel'



const ns = '[PartnerModel]'

const PartnerModel = {}

export async function asyncGetPartners (req, query, fields, cb) {
  let fn = `[${req.requestId}]${ns}[asyncGetPartners]`
  logger.info(fn, JSON.stringify(query));
  return new Promise((resolve, reject) => {
    PartnerModel.getPartners(req, query, fields, (err, partners) => {
      if (err) {
        partners = []
      }
      resolve(partners);
    })
  })  
}

PartnerModel.getPartners = (req, query, fields, cb) => {
  logger.info(req.requestId, ns, '[getPartners]', JSON.stringify(query))

  let execObj = PartnerSchema
  .find(query, fields, { sort: { "created.on": -1 } })
  DBWrapper.execute(
    execObj,
    execObj.exec,
    req.requestId,
    query,
    (err, partners) => {
      if(err){
        logger.error(req.requestId, ns, '[getPartners]', JSON.stringify(err))
        cb(err)
      } else {

        cb(null, partners)
      }
    }
  )
}

PartnerModel.getPartner = (req, query, cb) => {
  logger.info(req.requestId, ns, '[getPartners]', JSON.stringify(query))
  let execObj = PartnerSchema.findOne(query)
  DBWrapper.execute(
    execObj,
    execObj.exec,
    req.requestId,
    query,
    (err, partner) => {
      if(err){
        logger.error(req.requestId, ns, '[getPartners]', JSON.stringify(err))
        cb(err)
      } else {
        cb(null, partner)
      }
    }
  )
}

PartnerModel.updatePartner = (req, data, cb) => {
  logger.info(req.requestId, ns, '[updatePartner]', JSON.stringify(data))
  logger.info(req.requestId, ns, '[updatePartner]:partnerInfo', JSON.stringify(req.partnerInfo))
  DBWrapper.execute(
    PartnerSchema,
    PartnerSchema.findOneAndUpdate,
    req.requestId,
    { _id: req.partnerInfo._id },
    data,
    (err, updatedPartner) => {
      if(err){
        logger.error(req.requestId, ns, '[updatePartner]', JSON.stringify(err))
        cb(err)
      } else {
        cb(null, updatedPartner)
      }
    }
  )
}

PartnerModel.deletePartner = (req, cb) => {
  logger.info(req.requestId, ns, '[deletePartner]')
  async.waterfall([
    //delete partner orders
    (callback) => {
      console.log("delete partner orders")
      DBWrapper.execute(
        PartnerOrderSchema,
        PartnerOrderSchema.remove,
        req.requestId,
        { partner: req.params.id },
        callback
      )
    },
    //delete partner customers
    (result, callback) => {
      console.log("delete partner customers")
      DBWrapper.execute(
        PartnerCustomerSchema,
        PartnerCustomerSchema.remove,
        req.requestId,
        { partner: req.params.id },
        callback
      )
    },
    //delete partner connections
    (result, callback) => {
      console.log("delete partner connections")
      PartnerConnectionModel.removeConnection(req, {
        partner: req.params.id
      }, callback)
    },
    //delete partner
    (callback) => {
      console.log("delete partner")
      DBWrapper.execute(
        PartnerSchema,
        PartnerSchema.remove,
        req.requestId,
        { _id: req.params.id },
        callback
      )
    }
  ], (err) => {
    if(err){
      logger.error(req.requestId, ns, '[deletePartner]:Error', JSON.stringify(err))
    }
    cb(null)
  })

}

PartnerModel.processApplication = (req, invitation, partnerType, fields, allowedRegion, cb) => {
  logger.info(req.requestId, ns, '[processApplication]')
  let date = new Date()
  let partnerCode = Utils.generateRandomString(constants.AGENT_CODE_LENGTH).shuffle()

  logger.info(req.requestId, ns, '[processApplication]:partnerCode', partnerCode)

  async.waterfall([
    //get the page
    (callback) => {
      PageModel.getPage(req, "partners", (err, page) => {
        if(err){
          callback(err)
        } else {
          callback(null, page)
        }
      })
    },
    //insert partner record
    (page, callback) => {
      let status = constants.PARTNER_STATUS_TYPES.APPROVED

      if(invitation.autoActivate === true) {
        status = constants.PARTNER_STATUS_TYPES.APPROVED
      } else {
        status = constants.PARTNER_STATUS_TYPES.PENDING
      }

      // if(partnerType === constants.PARTNER_TYPES.referral){
      //   status = constants.PARTNER_STATUS_TYPES.APPROVED
      // } else {
      //   if(fields.isAvayaPartnerIdValid){
      //     status = constants.PARTNER_STATUS_TYPES.APPROVED
      //   }
      // }
      let newPartnerRecord = {
        parent: invitation.partner,
        type: partnerType,
        status: status,
        //user: req.userInfo.userId,
        fields: {},
        metadata: {},
        //code: partnerCode,
        statusChanged: {
          by: req.userInfo.userId,
          on: date
        },
        created: {
          by: req.userInfo.userId,
          on: date
        },
        updated: {
          by: req.userInfo.userId,
          on: date
        }
      }


      fields.forEach(field => {
        newPartnerRecord.fields[field.name] = field.value
      })

      newPartnerRecord.fields.utilityEmail = req.userInfo.username

      logger.info(req.requestId, ns, '[processApplication]:newPartnerRecord', JSON.stringify(newPartnerRecord))

      if (allowedRegion == 'DE') {
        newPartnerRecord.metadata.regionMaster = allowedRegion;
      }

      let partner = new PartnerSchema(newPartnerRecord)

      DBWrapper.execute(partner, partner.save,
        req.requestId,
        (err, newPartner) => {
          if(err){
            callback(err)
          } else {
            callback(null, newPartner, page)
          }
        }
      )

    },
    //insert agent record
    (newPartner, page, callback) => {
      let newAgentRecord = {
        user: req.userInfo.userId,
        partner: newPartner._id,
        active: true,
        code: partnerCode,
        accessLevel: constants.AGENT_LEVELS.OWNER,
        created: new Date()
      }

      let agent = new PartnerAgentSchema(newAgentRecord)
      DBWrapper.execute(agent, agent.save,
        req.requestId,
        (err, newAgent) => {
          if(err){
            callback(err)
          } else {
            callback(null, newPartner, newAgent, page)
          }
        }
      )
    },
    //send application email
    (newPartner, newAgent, page, callback) => {
      if(newPartner.status === constants.PARTNER_STATUS_TYPES.APPROVED){
        sendgrid.sendPartnerApplicationStatusUpdatedEmail({
          requestId: req.requestId,
          templateId: templater.partnerApplicationStatusUpdatedEmail.templateIds[newPartner.status][req.userInfo.language] || templater.partnerApplicationStatusUpdatedEmail.templateIds[newPartner.status][sendgrid.defaultEmailLang],
          config: templater.partnerApplicationStatusUpdatedEmail,
          firstName: req.userInfo.firstName,
          lastName: req.userInfo.lastName,
          toEmail: req.userInfo.username,
          partnerType: partnerType,
          referralLink: Utils.getBaseURL(req) + '/referrallink/' + newAgent.code,
          portalLink: Utils.getBaseURL(req) + "/partners/me/resolve",
          approvedDeclined: constants.PARTNER_STATUS_TYPES.APPROVED,
          company: newPartner.fields.companyName
        }).then(() => {
          logger.info(req.requestId, ns, '[processApplication]:sendPartnerAdminApprovalEmail successfully')
        }).catch((err) => {
          logger.error(req.requestId, ns, '[processApplication]:sendPartnerAdminApprovalEmail Error', err)
        })
      } else {
        sendgrid.sendParnterApplicationEmail({
          requestId: req.requestId,
          templateId: templater.partnerApplicationEmail.templateIds[partnerType][req.userInfo.language] || templater.partnerApplicationEmail.templateIds[partnerType][sendgrid.defaultEmailLang],
          config: templater.partnerApplicationEmail,
          firstName: req.userInfo.firstName,
          lastName: req.userInfo.lastName,
          toEmail: req.userInfo.username,
          partnerType: partnerType,
          portalLink: Utils.getBaseURL(req) + "/partners/me/resolve",
          company: newPartner.fields.companyName,
          dnbLink: page.metadata.dnbLink
        }).then(() => {
          logger.info(req.requestId, ns, '[processApplication]:sendParnterApplicationEmail successfully')
        }).catch((err) => {
          logger.error(req.requestId, ns, '[processApplication]:sendParnterApplicationEmail Error', err)
        })
      }

      callback(null, newPartner)
    },
    //send email to administrator
    (newPartner, callback) => {
        sendgrid.sendPartnerAdminApprovalEmail({
          requestId: req.requestId,
          templateId: templater.partnerAdminApprovalEmail.templateId[req.userInfo.language] || templater.partnerAdminApprovalEmail.templateId[sendgrid.defaultEmailLang],
          config: templater.partnerAdminApprovalEmail,
          firstName: req.userInfo.firstName,
          lastName: req.userInfo.lastName + " (" + req.userInfo.username + ")",
          toEmail: constants.PARTNER_APPROVERS[0],
          partnerType: partnerType,
          portalLink: Utils.getBaseURL(req) + "/partners/" + newPartner._id + "/info",
          company: newPartner.fields.companyName
        }).then(() => {
          logger.info(req.requestId, ns, '[processApplication]:sendPartnerAdminApprovalEmail successfully')
        }).catch((err) => {
          logger.error(req.requestId, ns, '[processApplication]:sendPartnerAdminApprovalEmail Error', err)
        })
      callback(null)
    },
    //delete invitation
    //delete invitation link
    (callback) => {
      DBWrapper.execute(
        PartnerInvitationSchema,
        PartnerInvitationSchema.remove,
        req.requestId,
        { _id: invitation._id },
        (err) => {
          if(err) {
            logger.error(req.requestId, ns, '[PartnerJoin]: error deleting invitation record')
          }
        }
      )
      callback(null)
    }
  ], (err) => {
    if(err){
      cb(err)
    } else {
      cb(null)
    }
  })
}

PartnerModel.setPartnerStatus = (req, cb) => {
  logger.info(req.requestId, ns, '[setPartnerStatus]')

  async.waterfall([
    //get the partner
    (callback) => {
      PartnerModel.getPartner(req, { _id: req.params.id }, callback)
    },
    (partner, callback) => {
      let update = {
        status: req.params.status,
        statusChanged: {
          by: req.userInfo.userId,
          on: new Date()
        }
      }

      DBWrapper.execute(
        PartnerSchema,
        PartnerSchema.findOneAndUpdate,
        req.requestId,
        { _id: req.params.id },
        update,
        (err, updatedPartner) => {
          if(err){
            callback(err)
          } else {
            callback(null, partner)
          }
        }
      )

    },
    //send email to partner admins
    (partner, callback) => {
        if(req.params.status !== constants.PARTNER_STATUS_TYPES.PENDING){

          //select all partner admins
          PartnerModel.getAgents(req, {
            partner: partner._id,
            accessLevel: { "$in": [constants.AGENT_LEVELS.OWNER, constants.AGENT_LEVELS.ADMIN ] },
            active: true
          }, null, (err, agents) => {
            if(err) {
              callback(err)
            } else {
              async.each(agents, (agent, acb) => {

                let agentLang = agent.user.account.languages.filter(lang => {
                  return lang.primary === true
                })[0]
                // partner approved/rejected email
                sendgrid.sendPartnerApplicationStatusUpdatedEmail({
                  requestId: req.requestId,
                  templateId: templater.partnerApplicationStatusUpdatedEmail.templateIds[req.params.status][agentLang.code] || templater.partnerApplicationStatusUpdatedEmail.templateIds[req.params.status][sendgrid.defaultEmailLang],
                  config: templater.partnerApplicationStatusUpdatedEmail,
                  firstName: agent.user.account.name.givenname,
                  lastName: agent.user.account.name.familyname,
                  toEmail: agent.user.account.username,
                  partnerType: partner.type,
                  referralLink: Utils.getBaseURL(req) + '/referrallink/' + agent.code, // fix me
                  portalLink: Utils.getBaseURL(req) + "/partners/me/info",
                  approvedDeclined: req.params.status,
                  company: partner.fields.companyName
                }).then(() => {
                  logger.info(req.requestId, ns, '[processApplication]:sendPartnerAdminApprovalEmail successfully');
                }).catch((err) => {
                  logger.error(req.requestId, ns, '[processApplication]:sendPartnerAdminApprovalEmail Error', err)
                })

                acb();

              }, (agerr) => {

              })

            }
          })
        }
        callback(null)
    }
  ], (err) => {
    if(err){
      cb(err)
    } else {
      cb(null)
    }
  })
}

PartnerModel.placeCustomer = (req, customerId, data, order, cb) => {
  logger.info(req.requestId, ns, '[placeCustomer]')
  async.waterfall([
    //check if there is a customer
    (callback) => {
      PartnerModel.getCustomer(req, {
        customer: customerId,
        partner: data.partner._id,
        'company.id' : order.accountInformation.companyId
      }, null, (err, customer) => {
        if(err){
          callback(err)
        } else {
          if(customer){
            callback(constants.ERROR_CODES.CUSTOMER_ALREADY_EXISTS_FOR_THIS_PARTNER)
          } else {
            callback(null)
          }
        }
      })
    },
    //place the customer
    (callback) => {
      let billingInfo = order.billingInformation

      let address = `${billingInfo.billingAddress}, ${billingInfo.billingCountry}, ${billingInfo.billingCity}, ${billingInfo.billingStateProvince}, ${billingInfo.billingPostalCode}`
      
      let newCustomerData = {
        partner: data.partner._id,
        agent: data.agent._id,
        parentPartner: data.parent ? data.parent._id : data.partner._id,
        customer:customerId,
        company: {
          id: order.accountInformation.companyId,
          name: order.accountInformation.companyName,
          domain: order.accountInformation.companyDomain,
          address: address
        },
        created: new Date()
      }
      logger.info(req.requestId, ns, '[placeCustomer]:newCustomerData', JSON.stringify(newCustomerData))

      let newCustomer = new PartnerCustomerSchema(newCustomerData)

      DBWrapper.execute( newCustomer, newCustomer.save,
        req.requestId,
        callback
      )
    }
  ], (err, newCustomer) => {
    if(err){
      logger.error(req.requestId, ns, '[placeCustomer]', JSON.stringify(err))
      cb(null)
    } else {
      logger.info(req.requestId, ns, '[placeCustomer]:Success', JSON.stringify(newCustomer))
      cb(null)
    }
  })
}

export function getPartnerOrders(req, query, fields) {
  return new Promise((resolve, reject)=>{
    PartnerModel.getOrders(req, query, fields, (err, orders)=>{
      if(err) {
        orders = []
      }
      resolve(orders);
    })
  })
}

PartnerModel.getOrders = (req, query, fields, cb) => {
  logger.info(req.requestId, ns, '[getOrders]', JSON.stringify(query))
  let execObj = PartnerOrderSchema
    .find(query, fields, {sort: { created: -1 }})
    .populate('partner')
    .populate({
      path: 'agent',
      populate: {
        path: 'user',
        model: 'User'
      }
    })
    .populate('order', { _id: 1, items: 1, confirmationNumber:1, accountInformation: 1, billingInformation: 1, price: 1 })
    .populate('customer', {_id: 1, account: 1})
  DBWrapper.execute(
    execObj,
    execObj.exec,
    req.requestId,
    query,
    (err, orders) => {
      if(err){
        logger.error(req.requestId, ns, '[getOrders]', JSON.stringify(err))
        cb(err)
      } else {
        cb(null, orders)
      }
    }
  )
}


PartnerModel.getPaginatedOrders = (req, query, fields, cb) => {
  logger.info(req.requestId, ns, '[getPaginatedOrders]', JSON.stringify(query))

  let perPage = 10
  let page = Math.max(0, req.query.page || 1);

  let execObj = PartnerOrderSchema
    .find(query, fields, {sort: { created: -1 }})
    .populate('partner')
    .populate({
      path: 'agent',
      populate: {
        path: 'user',
        model: 'User'
      }
    })
    .populate('order', { _id: 1, items: 1, confirmationNumber:1, accountInformation: 1, billingInformation: 1, price: 1 })
    .populate('customer', {_id: 1, account: 1})
    .limit(perPage)
    .skip(perPage * page)
  DBWrapper.execute(
    execObj,
    execObj.exec,
    req.requestId,
    query,
    (err, orders) => {
      if(err){
        logger.error(req.requestId, ns, '[getPaginatedOrders]', JSON.stringify(err))
        cb(err)
      } else {
        console.log(orders)
        PartnerOrderSchema.count().exec((countErr, count) => {
          cb(null, {
            orders: orders,
            page: page,
            pages: Math.round(count / perPage)
          })
        })
      }
    }
  )
}

PartnerModel.getCustomers = (req, query, fields, cb) => {
  logger.info(req.requestId, ns, '[getCustomers]', JSON.stringify(query))
  let execObj = PartnerCustomerSchema
    .find(query, fields, {sort: { created: -1 }})
    .populate('customer', {_id: 1, account: 1})
    .populate('partner')
    .populate({
      path: 'agent',
      populate: {
        path: 'user',
        model: 'User'
      }
    })
  DBWrapper.execute(
    execObj,
    execObj.exec,
    req.requestId,
    query,
    (err, customers) => {
      if(err){
        logger.error(req.requestId, ns, '[getOrders]', JSON.stringify(err))
        cb(err)
      } else {
        cb(null, customers)
      }
    }
  )
}

PartnerModel.getCustomer = (req, query, fields, cb) => {
  logger.info(req.requestId, ns, '[getCustomer]', JSON.stringify(query))
  let execObj = PartnerCustomerSchema
    .findOne(query, fields, {sort: { created: -1 }})
    .populate('customer', {_id: 1, account: 1})
  DBWrapper.execute(
    execObj,
    execObj.exec,
    req.requestId,
    query,
    (err, customer) => {
      if(err){
        logger.error(req.requestId, ns, '[getCustomer]', JSON.stringify(err))
        cb(err)
      } else {
        cb(null, customer)
      }
    }
  )
}

PartnerModel.getAgent = (req, query, fields, cb) => {
  logger.info(req.requestId, ns, '[getAgent]', JSON.stringify(query))
  let execObj = PartnerAgentSchema
    .findOne(query, fields, {sort: { created: -1 }})
    .populate('user', {_id: 1, account: 1})
  DBWrapper.execute(
    execObj,
    execObj.exec,
    req.requestId,
    query,
    (err, agent) => {
      if(err){
        logger.error(req.requestId, ns, '[getAgent]', JSON.stringify(err))
        cb(err)
      } else {
        cb(null, agent)
      }
    }
  )
}

PartnerModel.addAgent = (req, newAgentRecord, cb) => {
  logger.info(req.requestId, ns, '[addAgent]', JSON.stringify(newAgentRecord))

  let agent = new PartnerAgentSchema(newAgentRecord)
  DBWrapper.execute(agent, agent.save,
    req.requestId,
    (err, newAgent) => {
      if(err){
        cb(err)
      } else {
        cb(null, newAgent)
      }
    }
  )
}

PartnerModel.updateAgent = (req, partnerId, agentId, data, cb) => {
  logger.info(req.requestId, ns, '[updateAgent]', agentId)

  PartnerModel.getAgent(req, {_id: agentId}, {accessLevel: 1}, (err, agent) =>  {
    if (err)  {
      return cb(err);
    }

    logger.info(req.requestId, ns, '[updateAgent]:agent', agent);

    if(agent && agent.accessLevel == constants.AGENT_LEVELS.OWNER && data.accessLevel != constants.AGENT_LEVELS.OWNER) {
      PartnerModel.getAgents(req, {
        partner: partnerId, 
        accessLevel: constants.AGENT_LEVELS.OWNER
        }, {_id: 1}, (err, agents) =>  {
          if(err){
            return cb(err);
          }
          logger.info(req.requestId, ns, '[updateAgent]:agents', agents);
          if (agents && agents.length > 1)  {
            DBWrapper.execute(
              PartnerAgentSchema,
              PartnerAgentSchema.findOneAndUpdate,
              req.requestId,
              { _id: agentId },
              data,
              (err, updatedAgent) => {
                if(err){
                  cb(err)
                } else {
                  cb(null, updatedAgent)
                }
              }
            )
          } else {
            return cb('Must have at least 1 owner.');
          }
      })
    } else {
      DBWrapper.execute(
        PartnerAgentSchema,
        PartnerAgentSchema.findOneAndUpdate,
        req.requestId,
        { _id: agentId },
        data,
        (err, updatedAgent) => {
          if(err){
            cb(err)
          } else {
            cb(null, updatedAgent)
          }
        }
      )
    }
  })
}

PartnerModel.getAgents = (req, query, fields, cb) => {
  logger.info(req.requestId, ns, '[getAgents]', JSON.stringify(query))
  let execObj = PartnerAgentSchema
  .find(query, fields, { sort: { created: -1 } })
  .populate('user', { _id: 1, 'account.displayname': 1, 'account.name': 1, 'account.picturefile': 1, 'account.username': 1, 'account.languages': 1 })

  DBWrapper.execute(
    execObj,
    execObj.exec,
    req.requestId,
    query,
    (err, agents) => {
      if(err) {
        logger.error(req.requestId, ns, '[getAgents]', JSON.stringify(err))
        cb(err)
      } else {
        cb(null, agents)
      }
    }
  )
}

PartnerModel.setPartnerConnection = (req, code, cb) => {
  PartnerConnectionModel.getConnection(req, {
    customer: req.userInfo.userId
  }, (err, connection) => {
    if(err){
      logger.error(req.requestId, ns, '[SetPartnerConnection]:err', JSON.stringify(err))
      cb()
    } else {
      if(connection){
        logger.info(req.requestId, ns, '[SetPartnerConnection]:connection', JSON.stringify(connection))
        cb()
      } else {
        PartnerModel.getAgent(req, {
          code: code,
          active: true,
          user: { '$ne': req.userInfo.userId }
        }, null, (perr, agent) => {
          if(perr){
            logger.error(req.requestId, ns, '[SetPartnerConnection]:perr', JSON.stringify(perr))
            cb()
          } else {
            if(agent){
                logger.info(req.requestId, ns, '[SetPartnerConnection]:agent', JSON.stringify(agent))
                PartnerModel.getPartner(req, {
                  _id: agent.partner,
                  status: constants.PARTNER_STATUS_TYPES.APPROVED
                }, (partnerErr, partner) => {
                  if(partnerErr || !partner) {
                    logger.error(req.requestId, ns, '[SetPartnerConnection]:Partner is not approved or error getting partner')
                    cb()
                  } else {
                    PartnerConnectionModel.setConnection(req, {
                      customer: req.userInfo.userId,
                      agent: agent._id,
                      partner: agent.partner,
                      created: new Date()
                    }, (cerr, newConnection) => {
                      if(cerr){
                        logger.error(req.requestId, ns, '[SetPartnerConnection]:cerr', JSON.stringify(cerr))
                      }
                      logger.info(req.requestId, ns, '[SetPartnerConnection]:newConnection', JSON.stringify(newConnection))
                      cb()
                    })
                  }
                })
            } else {
              logger.info(req.requestId, ns, '[SetPartnerConnection]:No partner found')
              cb()
            }
          }
        })
      }
    }
  })
}

export function getPartnerWithPageInfo(req, quer) {
  return new Promise((resolve, reject) => {
    PartnerModel.getPartnerWithPageInfo(req, query, (err, partner) => {
      if (err) {
        return resolve(null)
      }
      resolve(parner);
    })
  })
}

PartnerModel.getPartnerWithPageInfo = (req, query, cb) => {
  logger.info(req.requestId, ns, '[getPartnerWithPageInfo]')
  PageModel.getPage(req, "partners", (pageErr, page) => {
    if(pageErr){
      logger.error(req.requestId, ns, '[getPartnerWithPageInfo]:getPage', JSON.stringify(pageErr))
    }
    PartnerModel.getPartner(req, query, (partnerErr, partner) => {
      if(partnerErr){
        logger.error(req.requestId, ns, '[getPartnerWithPageInfo]:getPartner', JSON.stringify(partnerErr))
      }
      if(partner && page) {

        let discountFeature = page.metadata.features.filter(feature => {
          return feature.subType === "internal_discount"
        })[0]

        let purchaseCommissionFeature = page.metadata.features.filter(feature => {
          return feature.subType === "purchase_commission"
        })[0]

        let renewalCommissionFeature = page.metadata.features.filter(feature => {
          return feature.subType === "renewal_commission"
        })[0]

        partner = partner.toObject()

        partner["discount"] = discountFeature[partner.type]
        partner["purchaseCommission"] = purchaseCommissionFeature[partner.type]
        partner["renewalCommission"] = renewalCommissionFeature[partner.type]
        logger.info(req.requestId, ns, '[getPartnerWithPageInfo]:partner', JSON.stringify(partner))
        cb(null, partner)
      } else {
        cb("NO_PARTNER_OF_PAGE_FOUND")
      }
    })
  })
}

PartnerModel.getPartnersWithPageInfo = (req, query, cb) => {
  logger.info(req.requestId, ns, '[getPartnersWithPageInfo]', JSON.stringify(query));
  PageModel.getPage(req, "partners", (pageErr, page) => {
    if(pageErr){
      logger.error(req.requestId, ns, '[getPartnersWithPageInfo]:getPage', JSON.stringify(pageErr))
      cb("NO_PAGE_FOUND")
    }

    PartnerModel.getAgents(req, query, null, (agentsErr, agents) => {
      if(agentsErr) {
        cb(agentsErr)
      } else {
        let partnerInfo = []
        async.each(agents, (agent, agentCB) => {

          PartnerModel.getPartners(req, {
            _id: agent.partner
          }, {
            "fields.companyName": 1,
            "status": 1,
            "type": 1,
          }, (partnersErr, partners) => {
            if(partnersErr) {
                agentCB(partnersErr)
            } else {
              async.each(partners, (partner, partnerCB) => {
                let discountFeature = page.metadata.features.filter(feature => {
                  return feature.subType === "internal_discount"
                })[0]

                let purchaseCommissionFeature = page.metadata.features.filter(feature => {
                  return feature.subType === "purchase_commission"
                })[0]

                let renewalCommissionFeature = page.metadata.features.filter(feature => {
                  return feature.subType === "renewal_commission"
                })[0]
                partner = partner.toObject();
                partner["agent"] = {
                  _id: agent._id,
                  accessLevel: agent.accessLevel,
                  relation: Object.keys(constants.AGENT_LEVELS).find(key => constants.AGENT_LEVELS[key] === agent.accessLevel),
                  active: agent.active
                }
                partner["children"] = []
                partner["discount"] = discountFeature[partner.type]
                partner["purchaseCommission"] = purchaseCommissionFeature[partner.type]
                partner["renewalCommission"] = renewalCommissionFeature[partner.type]

                PartnerModel.getPartners(req, {
                  parent: partner._id
                }, null, (childrenErr, children) => {
                  if(childrenErr) {
                    logger.info(req.requestId, ns, '[getPartnersWithPageInfo]')
                    
                  } else {
                    children.forEach(child => {
                      partner.children.push(child._id.toString())
                    })
                    partnerInfo.push(partner)
                    partnerCB()
                  }
                })
              }, (partnerErr, partnerResult) => {
                if(partnerErr) {
                  agentCB(partnerErr)
                } else {
                  agentCB()
                }
              })
            }
          })

        }, (agentErr, agentResult) => {
          if(agentErr) {
            cb(agentErr)
          } else {
            logger.info(req.requestId, ns, '[getPartnersWithPageInfo]')
            if(partnerInfo.length) {
              partnerInfo.sort((a, b) => {
                return a.discount < b.discount
              })
              cb(null, partnerInfo)
            } else {
              cb(null, null)
            }
          }
        })

      }
    })

  })
}

PartnerModel.getInvitation = (req, query, cb) => {
  logger.info(req.requestId, ns, '[getInvitation]')
  let execObj = PartnerInvitationSchema.findOne(query)
  DBWrapper.execute(
    execObj,
    execObj.exec,
    req.requestId,
    query,
    (err, invitation) => {
      if(err){
        logger.error(req.requestId, ns, '[getInvitation]', JSON.stringify(err))
        cb(err)
      } else {
        cb(null, invitation)
      }
    }
  )
}


PartnerModel.sendInvitation = (req, partner, invitationFields, cb) => {
  logger.info(req.requestId, ns, '[sendInvitation]', partner)
  async.waterfall([
    //insert invitation record
    (callback) => {
      let data = {}
      let newInvitationRecord = {
        created: {
          by: req.userInfo.userId,
          on: new Date()
        },
        partner: req.params.id,
        inviteeType: invitationFields.inviteeType,
        inviteeName: invitationFields.inviteeName,
        inviteeEmail: invitationFields.inviteeEmail,
        inviteeRelation: invitationFields.inviteeRelation,
        autoActivate: invitationFields.autoActivate ? true : false
      }

      logger.info(req.requestId, ns, '[sendInvitation]:invitationFields', JSON.stringify(newInvitationRecord))

      data['invitationFields'] = invitationFields
      let invitation = new PartnerInvitationSchema(newInvitationRecord)
      DBWrapper.execute(invitation, invitation.save,
        req.requestId,
        (err, newInvitation) => {
          if(err){
            callback(err)
          } else {
            data['newInvitation'] = newInvitation
            callback(null, data)
          }
        }
      )
    },
    //send invitation email
    (data, callback) => {
      let invitationLink = Utils.getBaseURL(req)
      let templateId = ""
      if(data.invitationFields.inviteeType === 'COMPANY') {
        invitationLink += '/partners/sales/application?invitation_id=' + data.newInvitation._id
        templateId = templater.partnerInvitationEmail.templateIds.company[sendgrid.defaultEmailLang]
      } else {
        invitationLink += '/partners/' + partner._id + '/join?invitation_id=' + data.newInvitation._id
        templateId = templater.partnerInvitationEmail.templateIds.agent[sendgrid.defaultEmailLang]
      }

      let emailConfig = {
        requestId: req.requestId,
        templateId: templateId,
        toEmail: data.invitationFields.inviteeEmail,
        firstName: data.invitationFields.inviteeName,
        msa: partner.fields.companyName,
        MSAInviteLink: invitationLink,
        partnerSupportEmail: constants.SUPPORT_EMAILS.PARTNER_PROGRAM,
        region: req.region.toUpperCase()
      }

      logger.info(req.requestId, ns, '[sendPartnerInvitationEmail]:emailConfig', JSON.stringify(emailConfig))

      sendgrid.sendPartnerInvitationEmail(emailConfig).then(() => {
        logger.info(req.requestId, ns, '[sendInvitation]:sendPartnerInvitationEmail successfully')
      }).catch((err) => {
        logger.error(req.requestId, ns, '[sendInvitation]:sendPartnerInvitationEmail Error', err)
      })
      callback(null)
    }
  ], (err) => {
    if(err) {
      cb(err)
    } else {
      cb(null)
    }
  })
}


PartnerModel.removePartnerCustomer = (req, query, cb) => {
  logger.info(req.requestId, ns, '[removePartnerCustomer]', JSON.stringify(query))
  DBWrapper.execute(
    PartnerCustomerSchema,
    PartnerCustomerSchema.remove,
    req.requestId,
    query,
    (err) => {
      if(err){
        logger.error(req.requestId, ns, '[removePartnerCustomer]', JSON.stringify(err))
        cb(err)
      } else {
        cb(null)
      }
    }
  )
}


PartnerModel.removePartnerOrder = (req, query, cb) => {
  logger.info(req.requestId, ns, '[removePartnerOrder]', JSON.stringify(query))
  DBWrapper.execute(
    PartnerOrderSchema,
    PartnerOrderSchema.remove,
    req.requestId,
    query,
    (err) => {
      if(err){
        logger.error(req.requestId, ns, '[removePartnerOrder]', JSON.stringify(err))
        cb(err)
      } else {
        cb(null)
      }
    }
  )
}

PartnerModel.removePartner = (req, query, cb) =>  {
  let func = '[removePartner]';
  logger.info(req.requestId, ns, func, query);

  var partners = [], partnerIds = [], partnerOwnerIds = [];

  async.waterfall([
    (callback)  =>  {
      DBWrapper.execute(
        PartnerAgentSchema,
        PartnerAgentSchema.find,
        req.requestId,
        { user: query.userId },
        (err, results) =>  {
          if (err)  {
            logger.error(req.requestId, ns, func, err)
          }
          logger.info(req.requestId, ns, func, 'partner agents retrieved');

          partners = results;

          async.each(partners, (partner, intercb) =>  {
            if (partner.accessLevel == constants.AGENT_LEVELS.OWNER)  {
              partnerOwnerIds.push(partner.partner);
            }
            partnerIds.push(partner.partner);
            intercb();
          },
          (err) =>  {
            logger.info(req.requestId, ns, func, 'partner owner ids', partnerOwnerIds, 'partnerids', partnerIds);
            callback(err);
          });
        }
      )
    },
    (callback)  =>  {
      DBWrapper.execute(
        PartnerInvitationSchema,
        PartnerInvitationSchema.remove,
        req.requestId,
        { $or: [{partner: {$in: partnerOwnerIds}}, {'created.by': query.userId }]},
        (err, results) =>  {
          if (err)  {
            logger.error(req.requestId, ns, func, err)
          }
          logger.info(req.requestId, ns, func, 'partner invitations removed');
          callback(err);
        }
      )
    },
    (callback)  =>  {
      DBWrapper.execute(
        PartnerOrderSchema,
        PartnerOrderSchema.remove,
        req.requestId,
        { $or: [{partner: {$in: partnerOwnerIds}}, {agent: query.userId }]},
        (err, results) =>  {
          if (err)  {
            logger.error(req.requestId, ns, func, err)
          }
          logger.info(req.requestId, ns, func, 'partner orders removed');
          callback(err);
        }
      )
    },
    (callback)  =>  {
      DBWrapper.execute(
        PartnerConnectionSchema,
        PartnerConnectionSchema.remove,
        req.requestId,
        { $or: [{partner: {$in: partnerOwnerIds}}, {agent: query.userId }]},
        (err, results) =>  {
          if (err)  {
            logger.error(req.requestId, ns, func, err)
          }
          logger.info(req.requestId, ns, func, 'partner connections retrieved');
          callback(err);
        }
      )
    },
    (callback)  =>  {
      DBWrapper.execute(
        PartnerCustomerSchema,
        PartnerCustomerSchema.remove,
        req.requestId,
        { $or: [{partner: {$in: partnerOwnerIds}}, {agent: query.userId }]},
        (err, results) =>  {
          if (err)  {
            logger.error(req.requestId, ns, func, err)
          }
          logger.info(req.requestId, ns, func, 'partner customers removed');
          callback(err);
        }
      )
    },
    (callback)  =>  {
      DBWrapper.execute(
        PartnerSchema,
        PartnerSchema.remove,
        req.requestId,
        { _id: { $in: partnerOwnerIds }},
        (err, results) =>  {
          if (err)  {
            logger.error(req.requestId, ns, func, err)
          }
          logger.info(req.requestId, ns, func, 'partners removed');
          callback(err);
        }
      )
    },
    (callback)  =>  {
      DBWrapper.execute(
        PartnerAgentSchema,
        PartnerAgentSchema.remove,
        req.requestId,
        { $or: [{ partner: { $in: partnerOwnerIds }}, { user: query.userId }]},
        (err, results) =>  {
          if (err)  {
            logger.error(req.requestId, ns, func, err)
          }
          logger.info(req.requestId, ns, func, 'partner agents removed');
          callback(err);
        }
      )
    }
  ],
  (err) =>  {
    if (err)  {
      logger.info(req.requestId, ns, func, 'partner data removed failed', err);
      return cb(err);
    }
    logger.info(req.requestId, ns, func, 'partner data removed');
    cb(err);
  });
}


PartnerModel.getPartnerChildrenAndAgents = (req, partnerId, cb) => {
  logger.info(req.requestId, ns, '[getPartnerChildrenAndAgents]')
  
  async.waterfall([
    //get partner
    (callback) => {
      let children = []
      PartnerModel.getPartner(req, {
        _id: partnerId
      }, (err, partner) => {
        if(err) {
          callback(err)
        } else {
          children.push(partner.toObject())
          callback(null, children)
        }
      })
    },
    //get children
    (children, callback) => {
      PartnerModel.getPartners(req, {
        parent: partnerId
      }, {
        fields: 1
      }, (err, childrenPartners) => {
        if(err) {
          callback(null, children)
        } else {
          async.each(childrenPartners, (childPartner, childPartnerCB) => {
            children.push(childPartner.toObject())
            childPartnerCB()
          }, () => {
            callback(null, children)
          })
        }
      })
    },
    //get each partner's agents
    (children, callback) => {
      async.each(children, (child, childCB) => {
        PartnerModel.getAgents(req, {
          partner: child._id
        }, null, (err, agents) => {
          child['agents'] = agents
          childCB()
        })
      }, () => {
        callback(null, children)
      })
    }
  ], (err, children) => {
    if(err) {
      logger.error(req.requestId, ns, '[getPartnerChildrenAndAgents]', err)
      cb(err)
    } else {
      cb(null, children)
    }
  })
}


export default PartnerModel
