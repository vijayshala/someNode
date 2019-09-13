import logger from 'applogger'
import async from 'async'
import json2csv from 'json2csv'
import constants from '../config/constants'
import config from '../config';
import PartnerModel from '../models/PartnerModel'
import PartnerConnectionModel from '../models/PartnerConnectionModel'
import PageModel from '../models/PageModel'
import LookupModel from '../models/LookupModel'
import DBWrapper from 'dbwrapper'
import PartnerInvitationSchema from '../schemas/PartnerInvitationSchema'
import PartnerSchema from '../schemas/PartnerSchema'
import PartnerAgentSchema from '../schemas/PartnerAgentSchema'
import Utils from '../common/Utils'
import _ from 'lodash'
import moment from 'moment'
import { OfferBackend } from '../server/offer/offer.backend';
import { OrderBackend } from '../server/order/order.backend';
import { RegionBackend } from '../server/region/region.backend';
import { CountryBackend } from '../server/region/country.backend';
import { ORDER_STATUS_SUCCESS } from '../server/order/order.constants';
import { formatCurrency } from '../web-app/common/currencyFormatter';
import { nonBlockify } from '../server/modules/utils';
import * as IPConstants from '../server/ip-office/constants';
import * as SpacesConstants from '../server/zang-spaces/constants';
import escapeStringRegexp from 'escape-string-regexp';
//import findCartItemContext from '../server/modules/cart-salesmodel-rules/utils';


const ns = '[PartnerController]'

const newPartnerFields = [
  "utilityEmail",
  "companyName", "companyAddress", "companyCountry",
  "companyCity", "companyStateProvince", "companyZipPostalCode",
  "companyPhoneNumber", "companyWebsite", "copyCompanyAddress", "operationalAddress",
  "operationalCountry", "operationalCity", "operationalStateProvince",
  "operationalZipPostalCode"
]

function getPartnerType(req) {
  let allowedPartnerTypes = Object.keys(constants.PARTNER_TYPES)
  return allowedPartnerTypes.indexOf(req.params.type) > -1 ? req.params.type : constants.PARTNER_TYPES.referral
}


const ParsePartnerOrders = (req, orders, callback, toObject) => {
  logger.info(req.requestId, ns, '[ParsePartnerOrders]')

  let theOrders = []
  async.each(orders, (order, orderCB) => {
    if (!order.order) {
      return orderCB()
    }
    let item = order && order.order && order.order.items[0]
    if (item && item.product.slug === constants.ADVANCED_PRODUCTS['ip-office'].slug) {
      let details = {}
      details['users'] = {
        'Basic': item.product.salesmodel.basicUser.users.length,
        'Standard': item.product.salesmodel.standardUser.users.length,
        'Power': item.product.salesmodel.powerUser.users.length
      }
      let users = []
      users = users.concat(
        item.product.salesmodel.basicUser.users,
        item.product.salesmodel.standardUser.users,
        item.product.salesmodel.powerUser.users
      )
      details['devices'] = {}
      async.each(users, (user, userCB) => {
        if (details.devices[user.device]) {
          details.devices[user.device] += 1;
        } else {
          details.devices[user.device] = 1;
        }
        userCB()
      }, () => {
        if (toObject) {
          order = order.toObject()
        }
        order['details'] = details;
        theOrders.push(order);
        orderCB()
      })

    } else if (item && item.product.slug === constants.ADVANCED_PRODUCTS['zang-spaces'].slug) {
      let details = {}

      details['users'] = {
        'Plus': item.product.salesmodel.users.team.qty,
        'Business': item.product.salesmodel.users.business.qty
      }
      if (toObject) {
        order = order.toObject();
      }
      order['details'] = details
      theOrders.push(order)
      orderCB()
    } else {
      orderCB()
    }

  }, (err) => {
    callback(null, theOrders)
  })
}


const PartnerController = {}

PartnerController.IfPartnerExists = (req, res, next) => {
  next()
  return;
  logger.info(req.requestId, ns, '[CheckIfPartnerExists]')
  PartnerModel.getPartner(req, { user: req.userInfo.userId }, (err, partner) => {
    if (partner) {
      res.redirect('/partners/me/info')
    } else {
      next()
    }
  })
}

PartnerController.PartnerPrograms = (req, res) => {
  logger.info(req.requestId, ns, '[PartnerPrograms]')
  PageModel.getPage(req, "partners", (err, page) => {
    if (err) {
      logger.error(req.requestId, ns, '[PartnerPrograms]', err)
      res.redirect('/');
    } else {
      res.render('partner/PartnerPrograms', {
        title: 'Partners',
        page: page
      })
    }
  })
}

PartnerController.PartnerPage = (req, res) => {
  logger.info(req.requestId, ns, '[PartnerPage]')

  let partnerType = getPartnerType(req)

  PageModel.getPage(req, "partners", (err, page) => {
    if (err) {
      logger.error(req.requestId, ns, '[PartnerPage]', err)
      res.redirect('/');
    } else {
      res.render('partner/PartnerPage', {
        title: partnerType + ' agent Program',
        page: page,
        partnerType: partnerType
      })
    }
  })
}

PartnerController.PartnerApplication = (req, res) => {
  logger.info(req.requestId, ns, '[PartnerApplication]')
  //let partnerType = getPartnerType(req)
  let partnerType = constants.PARTNER_TYPES.sales
  let data = {}

  async.waterfall([
    //get invitation
    (callback) => {
      DBWrapper.execute(
        PartnerInvitationSchema,
        PartnerInvitationSchema.findOne,
        req.requestId,
        { _id: req.query.invitation_id },
        (err, invitation) => {
          if (err) {
            callback(err)
          } else {
            data['invitation'] = invitation
            callback(null, data)
          }
        }
      )
    },
    //get partner
    (data, callback) => {
      PartnerModel.getPartner(req, {
        _id: data.invitation.partner
      }, (err, partner) => {
        if (err) {
          callback(err)
        } else {
          if (partner) {
            data['partner'] = partner
            callback(null, data)
          } else {
            callback('No Parter found')
          }
        }
      })
    },
    //get page,
    (data, callback) => {
      PageModel.getPage(req, "partners", (err, page) => {
        if (err) {
          callback(err)
        } else {
          data["page"] = page
          callback(null, data)
        }
      })
    },
    // get the countries
    (data, callback) => {
      RegionBackend.find({ active: true }).then((regions) => {
        data["countries"] = regions;
        callback(null, data);
      }).catch((err) => {
        logger.error(req.requestId, ns, 'error', err);
        callback("Region list not found");
      });
    },
    //get states
    (data, callback) => {
      RegionBackend.findByCode(req.region).then(region => {
        if (region.addressFormClass != 2) {
          CountryBackend.findByCode(req.region).then(country => {
            data["states"] = country.states;
            callback(null, data);
          });
        } else {
          data["states"] = [];
          callback(null, data);
        }
      });
    },
    //get partner
    (data, callback) => {
      PartnerModel.getPartner(req, { user: req.userInfo.userId }, (err, partner) => {
        if (err) {
          logger.error(req.requestId, ns, '[PartnerApplication]', JSON.stringify(err))
        }
        if (partner) {
          data["partner"] = partner
        }

        callback(null, data)
      })
    }
  ], (err, data) => {
    if (err) {
      logger.info(req.requestId, ns, '[PartnerApplication]', JSON.stringify(err))
      res.redirect('/');
    } else {
      res.render('partner/PartnerApplication', {
        title: "Partner Application",
        _csrf: req.csrfToken(),
        partnerType,
        data,
        region: req.region
      })
    }
  })
}

PartnerController.PartnerApplicationPost = (req, res) => {
  logger.info(req.requestId, ns, '[PartnerApplicationPost]')

  const THIS_FIELD_IS_REQUIRED = req.localizer.get('THIS_FIELD_IS_REQUIRED')
  const PLEASE_ANSWER_THIS_QUESTION = req.localizer.get('PLEASE_ANSWER_THIS_QUESTION')
  const PLEASE_ENTER_YOUR_AVAYA_PARTNER_ID = req.localizer.get('PLEASE_ENTER_YOUR_AVAYA_PARTNER_ID')
  const PLEASE_READ_AND_AGREE_WITH_THE_PRIVACY_STATEMENT_TO_CONTINUE = req.localizer.get('PLEASE_READ_AND_AGREE_WITH_THE_PRIVACY_STATEMENT_TO_CONTINUE')
  const PLEASE_READ_AND_AGREE_WITH_THE_AGENT_PROGRAM_TERMS_OF_SERVICE_TO_CONTINUE = req.localizer.get('PLEASE_READ_AND_AGREE_WITH_THE_AGENT_PROGRAM_TERMS_OF_SERVICE_TO_CONTINUE')
  const THIS_AVAYA_PARTNER_ID_IS_ALREADY_IN_USE = req.localizer.get('THIS_AVAYA_PARTNER_ID_IS_ALREADY_IN_USE')
  const THIS_TAX_REGISTRATION_NUMBER_IS_ALREADY_IN_USE = req.localizer.get('THIS_TAX_REGISTRATION_NUMBER_IS_ALREADY_IN_USE')
  const THIS_IS_NOT_A_VALID_AVAYA_PARTNER_ID = req.localizer.get('THIS_IS_NOT_A_VALID_AVAYA_PARTNER_ID')

  let partnerType = constants.PARTNER_TYPES.sales
  let fields = JSON.parse(req.body.fields);
  let countryProp = fields.filter(field => {
    return field.name === 'companyCountry'
  })[0].value.split('-');
  let allowedRegion = countryProp[0] || 'US';

  let companyFields = [
    "invitation_id", "companyName", "companyAddress", "companyCountry",
    "companyCity", "companyZipPostalCode", "companyPhoneNumber",
    "companyWebsite", "emailAddress"
  ]

  let operationalFields = [
    "copyCompanyAddress", "operationalAddress", "operationalCountry", "operationalCity", "operationalZipPostalCode"
  ]

  let bankFields = [
    "bankName", "bankAccountNumber", "bankNumber", "bankTransitNumber",
    "bankSwiftCode", "bankTaxRegistrationNumber", "bankAddress", "bankCountry",
    "bankCity", "bankStateProvince", "bankZipPostalCode"
  ]

  let commonQuestionFields = [
    "question1", "question2", "question3", "question4", "question5",
    "question6", "question7"
  ]

  let salesQuestionFields = [
    "question8", "question9", "question10", "question11"
  ]

  logger.info(req.requestId, ns, '[PartnerApplicationPost]:fields', req.body.fields)
  let data = {
    errors: []
  }
  async.waterfall([
    //get invitation
    (callback) => {

      let invitationIdField = fields.filter(field => {
        return field.name === 'invitation_id'
      })[0]

      if (!invitationIdField) {
        data.errors.push({
          field: null,
          message: THIS_FIELD_IS_REQUIRED
        })
        callback(null, data)
        return
      }

      DBWrapper.execute(
        PartnerInvitationSchema,
        PartnerInvitationSchema.findOne,
        req.requestId,
        { _id: invitationIdField.value },
        (err, invitation) => {
          if (err) {
            callback(err)
          } else {
            data['invitation'] = invitation
            callback(null, data)
          }
        }
      )
    },
    //get partner
    (data, callback) => {
      PartnerModel.getPartner(req, {
        _id: data.invitation.partner
      }, (err, partner) => {
        if (err) {
          callback(err)
        } else {
          if (partner) {
            data['partner'] = partner
            callback(null, data)
          } else {
            callback('No Parter found')
          }
        }
      })
    },
    //Add states
    /*     (data, callback) => {
          RegionBackend.findByCode(req.region).then(region => {
            if (region.addressFormClass != 2) {
              companyFields.push('companyStateProvince');
              operationalFields.push('operationalStateProvince');
              logger.info(req.requestId, ns, '[PartnerApplicationPost]:States Pushed')
              callback(null, data)
            }
          });
        }, */
    //validate company fields
    (data, callback) => {
      logger.info(req.requestId, ns, '[PartnerApplicationPost]:validate company fields');
      fields.forEach(field => {
        if (companyFields.indexOf(field.name) > -1) {
          if (field.value === "") {
            data.errors.push({
              field: field.name,
              message: THIS_FIELD_IS_REQUIRED
            })
          }
          if (field.name === "companyCountry") {
            field.value = countryProp[1];
          }
        }
      })
      callback(null, data)
    },
    //validate operational fields
    (data, callback) => {
      logger.info(req.requestId, ns, '[PartnerApplicationPost]:validate operational fields')
      let copyCompanyAddress = fields.filter(field => {
        return field.name === "copyCompanyAddress"
      })[0]
      if (!copyCompanyAddress) {
        fields.forEach(field => {
          if (operationalFields.indexOf(field.name) > -1) {
            if (field.value === "") {
              data.errors.push({
                field: field.name,
                message: THIS_FIELD_IS_REQUIRED
              })
            }
          }
        })
      }

      callback(null, data)
    },
    //validate avaya fields
    (data, callback) => {
      callback(null, data)
      return
      logger.info(req.requestId, ns, '[PartnerApplicationPost]:validate avaya fields')
      let isAvayaPartner = fields.filter(field => {
        return field.name === "isAvayaPartner"
      })[0]

      let avayaPartnerId = fields.filter(field => {
        return field.name === "avayaPartnerId"
      })[0]

      if (isAvayaPartner === undefined) {
        data.errors.push({
          field: "avayaPartnerId",
          message: PLEASE_ANSWER_THIS_QUESTION
        })
        callback(null, data)
      } else {
        if (isAvayaPartner.value === "yes" && avayaPartnerId.value === "") {
          data.errors.push({
            field: "avayaPartnerId",
            message: PLEASE_ENTER_YOUR_AVAYA_PARTNER_ID
          })
          callback(null, data)
        } else {
          //validate avayaPartnerId
          async.waterfall([
            //check existance
            (avayaCallback) => {
              let query = {
                "fields.isAvayaPartner": true,
                "fields.avayaPartnerId": avayaPartnerId.value
              }
              PartnerModel.getPartner(req, query, (err, partner) => {
                if (err) {
                  avayaCallback(err)
                } else {
                  if (partner) {
                    avayaCallback(THIS_AVAYA_PARTNER_ID_IS_ALREADY_IN_USE)
                  } else {
                    avayaCallback(null)
                  }
                }
              })
            }
            //validate id
            // (avayaCallback) => {
            //   fields.isAvayaPartnerIdValid =
            //     isAvayaPartner.value === "yes" &&
            //     /^\d+$/.test(avayaPartnerId.value) &&
            //     avayaPartnerId.value.length === 6 &&
            //     avayaPartnerId.value[0] === "5"
            //   logger.info(req.requestId, ns, '[PartnerApplicationPost]:fields.isAvayaPartnerIdValid', fields.isAvayaPartnerIdValid)
            //   if(isAvayaPartner.value === "yes"){
            //     if(fields.isAvayaPartnerIdValid){
            //       avayaCallback(null)
            //     } else {
            //       avayaCallback(THIS_IS_NOT_A_VALID_AVAYA_PARTNER_ID)
            //     }
            //   } else{
            //     avayaCallback(null)
            //   }
            //
            //
            // }
          ], (avayaErr) => {
            if (avayaErr) {
              data.errors.push({
                field: "avayaPartnerId",
                message: avayaErr
              })
            }
            callback(null, data)
          })

        }
      }
    },
    //validate bank fields
    (data, callback) => {
      //do not validate bank fields
      callback(null, data)
      return;
      logger.info(req.requestId, ns, '[PartnerApplicationPost]:validate bank fields')
      fields.forEach(field => {
        if (bankFields.indexOf(field.name) > -1) {
          if (field.value === "") {
            data.errors.push({
              field: field.name,
              message: THIS_FIELD_IS_REQUIRED
            })
          }
        }
      })

      let bankTaxRegistrationNumber = fields.filter(field => {
        return field.name === "bankTaxRegistrationNumber"
      })[0]
      let query = {
        "fields.bankTaxRegistrationNumber": bankTaxRegistrationNumber.value
      }
      PartnerModel.getPartner(req, query, (err, partner) => {
        if (err) {
          callback(err)
        } else {
          if (partner) {
            data.errors.push({
              field: "bankTaxRegistrationNumber",
              message: THIS_TAX_REGISTRATION_NUMBER_IS_ALREADY_IN_USE
            })
          }
          callback(null, data)
        }
      })
    },
    //validate common questions fields
    (data, callback) => {
      //do not validate common questions fields
      callback(null, data)
      return;
      commonQuestionFields.forEach(commonField => {
        let idx = fields.findIndex(field => {
          return commonField === field.name
        })

        //console.log("commonField.name", commonField)
        if (idx < 0) {
          data.errors.push({
            field: commonField,
            message: PLEASE_ANSWER_THIS_QUESTION
          })
        } else {
          let commonQuestionExtraField = fields.filter(cField => {
            return cField.name === commonField + "Extra"
          })[0]

          if (commonQuestionExtraField) {
            if (fields[idx].value === "yes" && commonQuestionExtraField.value === "") {
              data.errors.push({
                field: commonField + "Extra",
                message: THIS_FIELD_IS_REQUIRED
              })
            }
          }
        }
      })
      callback(null, data)
    },
    //validate sales questions fields
    (data, callback) => {
      //do not validate sales questions fields
      callback(null, data)
      return;
      if (partnerType === constants.PARTNER_TYPES.referral) {
        callback(null, data)
      } else {
        fields.forEach(field => {
          if (salesQuestionFields.indexOf(field.name) > -1) {
            if (field.value === "") {
              data.errors.push({
                field: field.name,
                message: THIS_FIELD_IS_REQUIRED
              })
            } else {
              let salesQuestionExtraField = fields.filter(sField => {
                return sField.name === field.name + "Extra"
              })[0]

              if (salesQuestionExtraField) {
                if (field.value.indexOf("Other") > -1 && salesQuestionExtraField.value === "") {
                  data.errors.push({
                    field: field.name + "Extra",
                    message: THIS_FIELD_IS_REQUIRED
                  })
                }
              }
            }
          }
        })
        callback(null, data)
      }
    },
    //validate tos
    (data, callback) => {

      callback(null, data)
      return

      let fieldTosAgreeIndex = fields.findIndex(field => {
        return field.name === "tosAgree"
      })

      if (fieldTosAgreeIndex < 0) {
        data.errors.push({
          field: "tosAgree",
          message: PLEASE_READ_AND_AGREE_WITH_THE_PRIVACY_STATEMENT_TO_CONTINUE
        })
      }

      let fieldAgentProgramAgreeIndex = fields.findIndex(field => {
        return field.name === "agentProgramAgree"
      })

      if (fieldAgentProgramAgreeIndex < 0) {
        data.errors.push({
          field: "agentProgramAgree",
          message: PLEASE_READ_AND_AGREE_WITH_THE_AGENT_PROGRAM_TERMS_OF_SERVICE_TO_CONTINUE
        })
      }

      callback(null, data)
    },
    //validate if partner exists with the same user id
    (data, callback) => {
      callback(null, data) //do not check user
      return
      PartnerModel.getPartner(req, { user: req.userInfo.userId }, (err, partner) => {
        if (err) {
          callback(err)
        } else {
          if (partner) {
            callback("YOU_ARE_ALREADY_A_PARTNER_WITH_ZANG")
          } else {
            callback(null, data)
          }
        }
      })
    }
  ], (err, data) => {
    if (err) {
      res.status(400).json({
        message: err
      })
    } else {
      logger.info(req.requestId, ns, '[PartnerApplicationPost]:data', JSON.stringify(data))
      if (data.errors.length) {
        res.json({
          errors: data.errors
        })
      } else {

        PartnerModel.processApplication(req, data.invitation, partnerType, fields, allowedRegion, (err) => {
          if (err) {
            res.json({
              errors: [err]
            })
          } else {
            res.json({
              redirect: '/partners/me/resolve'
            })
          }
        })
      }
    }
  })
}

PartnerController.PartnerApplicationSuccess = (req, res) => {
  logger.info(req.requestId, ns, '[PartnerApplicationSuccess]')
  let partnerType = getPartnerType(req)

  async.waterfall([
    //get partner
    (callback) => {
      PartnerModel.getPartner(req, { user: req.userInfo.userId }, (err, partner) => {
        if (err) {
          callback(err)
        } else {
          callback(null, partner)
        }
      })
    },
    //get lookups
    (partner, callback) => {
      let lookups = {}
      LookupModel.getLookups(req, [
        constants.LOOKUP_TYPES.COUNTRIES,
        constants.LOOKUP_TYPES.STATES
      ], (err, lookups) => {
        lookups["countries"] = lookups[constants.LOOKUP_TYPES.COUNTRIES]
        lookups["states"] = lookups[constants.LOOKUP_TYPES.STATES]
        callback(null, partner, lookups)
      })
    }
  ], (err, partner, lookups) => {
    if (err) {
      logger.error(req.requestId, ns, '[PartnerApplicationSuccess]', JSON.stringify(err))
      res.redirect('/')
    } else {
      res.render('partner/PartnerApplicationSuccess', {
        data: lookups,
        partner,
        partnerType
      })
    }
  })
}

PartnerController.ResolvePortal = (req, res) => {
  logger.info(req.requestId, ns, '[ResolvePortal]')
  if (req.partnerInfo) {
    if (req.partnerInfo.length > 1) {
      logger.info(req.requestId, ns, '[ResolvePortal]:PartnerChoose')
      res.render('partner/PartnerChoose')
    } else {
      let partner = req.partnerInfo[0]
      if (partner.agent.accessLevel <= constants.AGENT_LEVELS.ADMIN) {
        logger.info(req.requestId, ns, '[ResolvePortal]:Partner Portal')
        logger.info(req.requestId, ns, '[ResolvePortal]:partner', JSON.stringify(partner))
        res.redirect('/partners/' + encodeURIComponent(partner._id) + '/info')
      } else {
        logger.info(req.requestId, ns, '[ResolvePortal]:Agent Portal')
        res.redirect('/partners/' + encodeURIComponent(partner._id) + '/agents/' + encodeURIComponent(partner.agent._id) + '/info')
      }
    }
  } else {
    logger.info(req.requestId, ns, '[ResolvePortal]:home')
    res.redirect('/')
  }
}

PartnerController.PartnerInfo = (req, res) => {
  logger.info(req.requestId, ns, '[PartnerInfo]')

  async.waterfall([
    //get page
    (callback) => {
      PageModel.getPage(req, "partners", (err, page) => {
        if (err) {
          callback(err)
        } else {
          callback(null, page)
        }
      })
    },
    //get partner
    (page, callback) => {
      let query = {
        _id: req.params.id
      }
      PartnerModel.getPartner(req, query, (err, partner) => {
        if (err) {
          callback(err)
        } else {
          if (partner) {
            callback(null, page, partner)
          } else {
            callback("No partner found")
          }
        }
      })
    },
    //get partner company owner
    (page, partner, callback) => {
      PartnerModel.getAgents(req, {
        partner: req.params.id,
        accessLevel: constants.AGENT_LEVELS.OWNER
      }, null, (err, agents) => {
        if (err) {
          callback(err)
        } else {
          callback(null, page, partner, agents[0])
        }
      })
    },
    //get lookups
    (page, partner, agent, callback) => {
      let lookups = {}
      lookups["countries"] = partner.fields.companyCountry;
      lookups["states"] = partner.fields.companyStateProvince;
      callback(null, page, partner, agent, lookups);
    },
    //get parent
    (page, partner, agent, lookups, callback) => {
      if (partner.parent) {
        PartnerModel.getPartner(req, {
          _id: partner.parent
        }, (err, parent) => {
          if (err) {
            callback(null, page, partner, agent, lookups, null)
          } else {
            callback(null, page, partner, agent, lookups, parent)
          }
        })
      } else {
        callback(null, page, partner, agent, lookups, null)
      }
    }
  ], (err, page, partner, agent, lookups, parent) => {
    if (err) {
      logger.error(req.requestId, ns, '[PartnerInfo]', JSON.stringify(err))
      res.redirect('/partners')
    } else {

      let canChangeStatus = false
      if (req.partnerInfo) {
        canChangeStatus = req.partnerInfo.filter(p => {
          return p.children.indexOf(req.params.id) > -1
        })[0]
      }

      res.render('partner/PartnerInfo', {
        _csrf: req.csrfToken(),
        partnerId: req.params.id,
        data: lookups,
        page,
        partner,
        agent,
        success: req.query.success,
        canChangeStatus,
        parent,
        active: 'info'
      })
    }
  })
}

PartnerController.SetPartnerStatus = (req, res) => {
  logger.info(req.requestId, ns, '[SetPartnerStatus]')
  if (!constants.PARTNER_STATUS_TYPES[req.params.status]) {
    logger.error(req.requestId, ns, '[SetPartnerStatus]: Invalid Status Param')
    return res.redirect('/partners/' + encodeURIComponent(req.params.id) + '/info')
  }

  PartnerModel.setPartnerStatus(req, (err) => {
    if (err) {
      logger.error(req.requestId, ns, '[SetPartnerStatus]', JSON.stringify(err))
    }
    res.redirect('/partners/' + encodeURIComponent(req.params.id) + '/info')
  })

}

PartnerController.PartnerOrders = (req, res) => {
  logger.info(req.requestId, ns, '[PartnerOrders]')

  async.waterfall([
    //get page
    (callback) => {
      PageModel.getPage(req, "partners", (err, page) => {
        if (err) {
          callback(err)
        } else {
          callback(null, page)
        }
      })
    },
    //get partner
    (page, callback) => {
      let query = {
        _id: req.params.id
      }
      PartnerModel.getPartner(req, query, (err, partner) => {
        if (err) {
          callback(err)
        } else {
          if (partner) {
            callback(null, page, partner)
          } else {
            callback("No partner found")
          }
        }
      })
    },
    //get partner company owner
    (page, partner, callback) => {
      PartnerModel.getAgents(req, {
        partner: req.params.id,
        accessLevel: constants.AGENT_LEVELS.OWNER
      }, null, (err, agents) => {
        if (err) {
          callback(err)
        } else {
          callback(null, page, partner, agents[0])
        }
      })
    },
    //get children
    (page, partner, agent, callback) => {
      PartnerModel.getPartnerChildrenAndAgents(req, partner._id, (err, children) => {
        callback(null, page, partner, agent, children)
      })
    },
    (page, partner, agent, children, callback) => {
      let query = {};
      PartnerController.findNewModelOrders(req, query, req.params.id).then((newOrders) => {
        callback(null, page, partner, agent, children, newOrders)
      })
    },
    //get parent
    (page, partner, agent, children, newOrders, callback) => {
      if (partner.parent) {
        PartnerModel.getPartner(req, {
          _id: partner.parent
        }, (err, parent) => {
          if (err) {
            callback(null, page, partner, agent, children, null, newOrders)
          } else {
            callback(null, page, partner, agent, children, parent, newOrders)
          }
        })
      } else {
        callback(null, page, partner, agent, children, null, newOrders)
      }
    },
    (page, partner, agent, children, parent, newOrders, callback) => {
      OfferBackend.find({ salesModels: { "$exists": true } }).then((offers) => {
        callback(null, page, partner, agent, children, parent, offers, newOrders);
      }).catch((err) => {
        logger.error(req.requestId, ns, 'error', err);
        callback("Product list not found");
      });
    }, (page, partner, agent, children, parent, offers, orders, callback) => {
      RegionBackend.find({ active: true }).then((regions) => {
        callback(null, page, partner, agent, children, parent, offers, orders, regions);
      }).catch((err) => {
        logger.error(req.requestId, ns, 'error', err);
        callback("Region list not found");
      });
    }
  ], (err, page, partner, agent, children, parent, offers, orders, regions) => {
    if (err) {
      logger.error(req.requestId, ns, '[PartnerOrders]', JSON.stringify(err))
      res.redirect('/partners')
    } else {
      res.render('partner/PartnerOrders', {
        _csrf: req.csrfToken(),
        partnerId: req.params.id,
        page,
        partner,
        agent,
        orders: orders,
        active: 'orders',
        children,
        parent,
        productlist: offers,
        regions
      })
    }
  })
}

PartnerController.PartnerCustomers = (req, res) => {
  logger.info(req.requestId, ns, '[PartnerCustomers]')

  async.waterfall([
    //get page
    (callback) => {
      PageModel.getPage(req, "partners", (err, page) => {
        if (err) {
          callback(err)
        } else {
          callback(null, page)
        }
      })
    },
    //get partner
    (page, callback) => {
      let query = {
        _id: req.params.id
      }
      PartnerModel.getPartner(req, query, (err, partner) => {
        if (err) {
          callback(err)
        } else {
          if (partner) {
            callback(null, page, partner)
          } else {
            callback("No partner found")
          }
        }
      })
    },
    //get partner company owner
    (page, partner, callback) => {
      PartnerModel.getAgents(req, {
        partner: req.params.id,
        accessLevel: constants.AGENT_LEVELS.OWNER
      }, null, (err, agents) => {
        if (err) {
          callback(err)
        } else {
          callback(null, page, partner, agents[0])
        }
      })
    },
    //get partner customers
    (page, partner, agent, callback) => {

      PartnerModel.getCustomers(req, {
        parentPartner: partner._id
      }, null, (err, customers) => {
        if (err) {
          callback(err)
        } else {
          callback(null, page, partner, agent, customers)
        }
      })
    },
    //get children
    (page, partner, agent, customers, callback) => {
      PartnerModel.getPartnerChildrenAndAgents(req, partner._id, (err, children) => {
        callback(null, page, partner, agent, customers, children)
      })
    },
    //get parent
    (page, partner, agent, customers, children, callback) => {
      if (partner.parent) {
        PartnerModel.getPartner(req, {
          _id: partner.parent
        }, (err, parent) => {
          if (err) {
            callback(null, page, partner, agent, customers, children, null)
          } else {
            callback(null, page, partner, agent, customers, children, parent)
          }
        })
      } else {
        callback(null, page, partner, agent, customers, children, null)
      }
    }
  ], (err, page, partner, agent, customers, children, parent) => {
    if (err) {
      logger.error(req.requestId, ns, '[PartnerCustomers]', JSON.stringify(err))
      res.redirect('/partners')
    } else {
      logger.info("Agents for Customers: ", children[0].agents);
      res.render('partner/PartnerCustomers', {
        partnerId: req.params.id,
        page,
        partner,
        agent,
        customers,
        active: 'customers',
        parent,
        children
      })
    }
  })
}

PartnerController.PartnerAdministration = (req, res) => {
  logger.info(req.requestId, ns, '[PartnerAdministration]')
  let query = {
    //"user.username": "drumforhim4@gmail.com"
  }
  if (req.query.field && req.query.search) {
    query[req.query.field] = { '$regex': escapeStringRegexp(req.query.search) }
  }






  PartnerModel.getPartners(req, query, null, (err, partners) => {
    if (err) {
      res.redirect('/')
    } else {

      res.render('partner/PartnerAdministration', {
        _csrf: req.csrfToken(),
        newPartnerFields,
        partners,
        query: req.query
      })
    }
  })
}

PartnerController.SetPartnerConnection = (req, res) => {
  logger.info(req.requestId, ns, '[SetPartnerConnection]')
  if (req.userInfo) {
    logger.info(req.requestId, ns, '[SetPartnerConnection]: user is logged in. Creating the code')
    PartnerModel.setPartnerConnection(req, req.params.code, () => {
      res.clearCookie(constants.PARTNER_CODE_COOKIE_NAME)
      res.redirect('/')
    });
  } else {
    logger.info(req.requestId, ns, '[SetPartnerConnection]: user is not logged in. Setting the cookie')
    res.cookie(constants.PARTNER_CODE_COOKIE_NAME, req.params.code, { expires: new Date(Date.now() + (1000 * 60 * 60 * 24)), httpOnly: true, secure: config.environment !== 'development' })
    logger.info(req.requestId, ns, '[SetPartnerConnection]: user is not logged in. Setting the cookie', JSON.stringify(req.cookies))
    res.redirect('/')
  }

}

PartnerController.PartnerConnections = (req, res) => {
  logger.info(req.requestId, ns, '[PartnerConnections]')
  let query = {}
  PartnerConnectionModel.getConnections(req, query, (err, connections) => {
    if (err) {
      logger.error(req.requestId, ns, '[PartnerConnections]', JSON.stringify(err))
      res.redirect('/')
    } else {
      res.render('partner/PartnerAdministrationConnections', {
        connections
      })
    }
  })
}

PartnerController.DeletePartnerConnection = (req, res) => {
  logger.info(req.requestId, ns, '[DeletePartnerConnection]')
  PartnerConnectionModel.removeConnection(req, {
    _id: req.params.id
  }, (err) => {
    if (err) {
      logger.error(req.requestId, ns, '[DeletePartnerConnection]', JSON.stringify(err))
    }

    res.redirect('/partners/administration/connections')
  })
}

PartnerController.PartnerBanking = (req, res) => {
  logger.info(req.requestId, ns, '[PartnerBanking]')

  async.waterfall([
    //get page
    (callback) => {
      PageModel.getPage(req, "partners", (err, page) => {
        if (err) {
          callback(err)
        } else {
          callback(null, page)
        }
      })
    },
    //get partner
    (page, callback) => {
      let query = {
        _id: req.params.id
      }
      PartnerModel.getPartner(req, query, (err, partner) => {
        if (err) {
          callback(err)
        } else {
          if (partner) {
            callback(null, page, partner)
          } else {
            callback("No partner found")
          }
        }
      })
    },
    //get partner company owner
    (page, partner, callback) => {
      PartnerModel.getAgents(req, {
        partner: req.params.id,
        accessLevel: constants.AGENT_LEVELS.OWNER
      }, null, (err, agents) => {
        if (err) {
          callback(err)
        } else {
          callback(null, page, partner, agents[0])
        }
      })
    },
    //get lookups
    (page, partner, agent, callback) => {
      let lookups = {}
      LookupModel.getLookups(req, [
        constants.LOOKUP_TYPES.COUNTRIES,
        constants.LOOKUP_TYPES.STATES
      ], (err, lookups) => {
        lookups["countries"] = lookups[constants.LOOKUP_TYPES.COUNTRIES]
        lookups["states"] = lookups[constants.LOOKUP_TYPES.STATES]
        callback(null, page, partner, agent, lookups)
      })
    }
  ], (err, page, partner, agent, lookups) => {
    if (err) {
      logger.error(req.requestId, ns, '[PartnerBanking]', JSON.stringify(err))
      res.redirect('/partners')
    } else {

      res.render('partner/PartnerBanking', {
        _csrf: req.csrfToken(),
        partnerId: req.params.id,
        data: lookups,
        page,
        partner,
        agent,
        active: 'banking'
      })
    }
  })
}

PartnerController.PartnerBankingPost = (req, res) => {
  logger.info(req.requestId, ns, '[PartnerBankingPost]')
  const THIS_FIELD_IS_REQUIRED = req.localizer.get('THIS_FIELD_IS_REQUIRED')
  const THIS_TAX_REGISTRATION_NUMBER_IS_ALREADY_IN_USE = req.localizer.get('THIS_TAX_REGISTRATION_NUMBER_IS_ALREADY_IN_USE')
  let fields = JSON.parse(req.body.fields)
  let bankFields = [
    "bankName", "bankAccountNumber", "bankNumber", "bankTransitNumber",
    "bankSwiftCode", "bankTaxRegistrationNumber", "bankAddress", "bankCountry",
    "bankCity", "bankStateProvince", "bankZipPostalCode"
  ]
  async.waterfall([
    //validate banking fields
    (callback) => {
      logger.info(req.requestId, ns, '[PartnerBankingPost]:validate bank fields')
      let data = {
        errors: []
      }
      fields.forEach(field => {
        if (bankFields.indexOf(field.name) > -1) {
          if (field.value === "") {
            data.errors.push({
              field: field.name,
              message: THIS_FIELD_IS_REQUIRED
            })
          }
        }
      })

      callback(null, data)

      // let bankTaxRegistrationNumber = fields.filter(field => {
      //   return field.name === "bankTaxRegistrationNumber"
      // })[0]
      // let query = {
      //   _id: { '$ne': req.partnerInfo._id },
      //   "fields.bankTaxRegistrationNumber": bankTaxRegistrationNumber.value
      // }
      // PartnerModel.getPartner(req, query, (err, partner) => {
      //   if(err){
      //     callback(err)
      //   } else {
      //     if(partner){
      //       data.errors.push({
      //         field: "bankTaxRegistrationNumber",
      //         message:THIS_TAX_REGISTRATION_NUMBER_IS_ALREADY_IN_USE
      //       })
      //     }
      //     callback(null, data)
      //   }
      // })
    }
  ], (err, data) => {
    if (err) {
      res.status(400).json({
        message: err
      })
    } else {
      logger.info(req.requestId, ns, '[PartnerApplicationPost]:data', JSON.stringify(data))
      if (data.errors.length) {
        res.json({
          errors: data.errors
        })
      } else {
        let updatedFields = req.partnerInfo.fields
        fields.forEach(field => {
          updatedFields[field.name] = field.value
        })

        PartnerModel.updatePartner(req, { fields: updatedFields }, (err) => {
          if (err) {
            res.json({
              errors: [err]
            })
          } else {
            res.json({
              redirect: '/partners/me/info?success=true'
            })
          }
        })
      }
    }
  })
}

PartnerController.PartnerAdministrationOrders = (req, res) => {
  logger.info(req.requestId, ns, '[PartnerAdministrationOrders]')
  PartnerController.findNewModelOrders(req, {}, req.query.parent).then((result) => {
    res.render('partner/PartnerAdministrationOrders', {
      orders: result
    })
  }).catch((err) => {
    logger.error(req.requestId, ns, '[PartnerAdministrationOrders]:error', err);
    res.redirect('/')
  });
}

PartnerController.PartnerAdministrationAddPartner = (req, res) => {
  logger.info(req.requestId, ns, '[PartnerAdministrationAddPartner]')
  async.waterfall([
    //add partner
    (callback) => {

      let date = new Date()

      let fields = {}

      newPartnerFields.forEach(f => {
        fields[f] = req.body[f]
      })


      let newPartnerRecord = {
        type: req.body.type,
        status: constants.PARTNER_STATUS_TYPES.APPROVED,
        fields: fields,
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

      logger.info(req.requestId, ns, '[processApplication]:newPartnerRecord', JSON.stringify(newPartnerRecord))

      let partner = new PartnerSchema(newPartnerRecord)

      DBWrapper.execute(partner, partner.save,
        req.requestId,
        (err, newPartner) => {
          if (err) {
            callback(err)
          } else {
            callback(null, newPartner)
          }
        }
      )
    },
    (newPartner, callback) => {
      let agentCode = Utils.generateRandomString(constants.AGENT_CODE_LENGTH).shuffle()
      let newAgentRecord = {
        user: req.body.userId,
        partner: newPartner._id,
        active: true,
        code: agentCode,
        accessLevel: constants.AGENT_LEVELS.OWNER,
        created: new Date()
      }

      let agent = new PartnerAgentSchema(newAgentRecord)
      DBWrapper.execute(agent, agent.save,
        req.requestId,
        (err, newAgent) => {
          if (err) {
            callback(err)
          } else {
            callback(null, newAgent)
          }
        }
      )
    }
  ], (err) => {
    if (err) {
      logger.info(req.requestId, ns, '[PartnerAdministrationAddPartner]', JSON.stringify(err))
    }
    res.redirect('/partners/administration')
  })
}

PartnerController.PartnerAgents = (req, res) => {
  logger.info(req.requestId, ns, '[PartnerAgents]')

  async.waterfall([
    //get page
    (callback) => {
      PageModel.getPage(req, "partners", (err, page) => {
        if (err) {
          callback(err)
        } else {
          callback(null, page)
        }
      })
    },
    //get partner
    (page, callback) => {
      let query = {
        _id: req.params.id
      }
      let data = {
        children: []
      }
      PartnerModel.getPartner(req, query, (err, partner) => {
        if (err) {
          callback(err)
        } else {
          if (partner) {
            data.children.push(partner)
            data['partner'] = partner
            data['page'] = page
            callback(null, data)
          } else {
            callback("No partner found")
          }
        }
      })
    },
    //get owner
    (data, callback) => {
      PartnerModel.getAgents(req, {
        partner: data.partner._id,
        accessLevel: constants.AGENT_LEVELS.OWNER
      }, null, (err, agents) => {
        if (err) {
          callback('No Owner found')
        } else {
          data['owner'] = agents[0]
          callback(null, data)
        }
      })
    },
    (data, callback) => {
      PartnerModel.getPartnerChildrenAndAgents(req, data.partner._id, (err, children) => {
        data['children'] = children
        callback(null, data)
      })
    },
    //get parent
    (params, callback) => {
      if (params.partner.parent) {
        PartnerModel.getPartner(req, {
          _id: params.partner.parent
        }, (err, parent) => {
          if (err) {
            callback(null, params)
          } else {
            params['parent'] = parent
            callback(null, params)
          }
        })
      } else {
        callback(null, params)
      }
    }
  ], (err, data) => {
    if (err) {
      logger.error(req.requestId, ns, '[PartnerAgents]', JSON.stringify(err))
      res.redirect('/partners')
    } else {

      // let agent = agents.filter(ag => {
      //   return ag.accessLevel === constants.AGENT_LEVELS.OWNER
      // })[0]

      res.render('partner/PartnerAgents', {
        _csrf: req.csrfToken(),
        partnerId: req.params.id,
        page: data.page,
        partner: data.partner,
        agent: data.owner,
        active: 'agents',
        children: data.children,
        parent: data.parent
      })
    }
  })
}

PartnerController.PartnerInvite = (req, res) => {
  logger.info(req.requestId, ns, '[PartnerInvite]')
  let fields = JSON.parse(req.body.fields)

  let invitationFields = {}
  fields.forEach(field => {
    invitationFields[field.name] = field.value
  })

  // make the invitee email into lower case to match zang accounts
  invitationFields.inviteeEmail = invitationFields.inviteeEmail.toLowerCase();

  async.waterfall([
    //check if partner exists
    (callback) => {
      let data = {}
      PartnerModel.getPartner(req, {
        _id: req.params.id
      }, (err, partner) => {
        if (err || !partner) {
          callback(400, {
            message: req.localizer.get('PARTNER_NOT_FOUND')
          })
        } else {
          data['partner'] = partner
          callback(null, data)
        }
      })
    },
    //validate fields
    (data, callback) => {
      switch (invitationFields.inviteeType) {
        case constants.PARTNER_INVITEE_TYPES.COMPANY:
          if (invitationFields.inviteeEmail === "" ||
            invitationFields.inviteeName === "" ||
            invitationFields.inviteeType === "") {
            callback(400, {
              message: req.localizer('ALL_FIELDS_ARE_REQUIRED')
            })
          } else {
            callback(null, data)
          }
          break;
        case constants.PARTNER_INVITEE_TYPES.INDIVIDUAL:
          if (invitationFields.inviteeEmail === "" ||
            invitationFields.inviteeName === "" ||
            invitationFields.inviteeType === "" ||
            invitationFields.inviteeRelation === "") {
            callback(400, {
              message: req.localizer('ALL_FIELDS_ARE_REQUIRED')
            })
          } else {
            callback(null, data)
          }
          break;
        default:
          callback(400, {
            message: "INVALID_INVITEE_TYPE"
          })
          break;
      }
    },
    //check if agent exists in the partner
    (data, callback) => {
      switch (invitationFields.inviteeType) {
        case constants.PARTNER_INVITEE_TYPES.INDIVIDUAL:
          PartnerModel.getAgents(req, {
            partner: data.partner._id
          }, null, (err, agents) => {
            if (err) {
              callback(400, {
                message: req.localizer.get('ERROR_GETTING_AGENTS')
              })
            } else {
              async.each(agents, (agent, agentCB) => {
                let emailField = fields.filter(f => {
                  return f.name === 'inviteeEmail'
                })[0]
                if (agent.user.account.username === emailField.value) {
                  agentCB(req.localizer.get('THERE_IS_ALREADY_AN_AGENT_WITH_THIS_EMAIL_IN_YOUR_TEAM'))
                } else {
                  agentCB(null)
                }
              }, (err) => {
                if (err) {
                  callback(400, {
                    message: err
                  })
                } else {
                  callback(null, data)
                }
              })
            }
          })
          break;
        case constants.PARTNER_INVITEE_TYPES.COMPANY:
          PartnerModel.getPartners(req, {
            parent: data.partner._id
          }, null, (err, children) => {
            if (err) {
              callback(400, {
                message: err
              })
            } else {
              async.each(children, (child, childCB) => {
                PartnerModel.getAgents(req, {
                  partner: child._id
                }, null, (agentErr, agents) => {
                  if (agentErr) {
                    childCB(agentErr)
                  } else {
                    async.each(agents, (agent, agentCB) => {
                      if (agent.user.account.username === invitationFields.inviteeEmail) {
                        agentCB(req.localizer.get('THERE_IS_ALREADY_A_COMPANY_WITH_THIS_EMAIL_IN_YOUR_TEAM'))
                      } else {
                        agentCB(null)
                      }
                    }, (agentErr) => {
                      if (agentErr) {
                        childCB(agentErr)
                      } else {
                        childCB(null)
                      }
                    })
                  }
                })
              }, (err) => {
                if (err) {
                  callback(400, {
                    message: err
                  })
                } else {
                  callback(null, data)
                }
              })
            }
          })
          break;
      }
    },
    (data, callback) => {
      PartnerModel.sendInvitation(req, data.partner, invitationFields, (err) => {
        if (err) {
          callback(400, {
            message: err
          })
        } else {
          callback(200, {
            message: req.localizer.get('THE_INVITATION_WAS_SENT_SUCCESSFULLY')
          })
        }
      })
    }
  ], (code, data) => {
    logger.info(req.requestId, ns, '[PartnerInvite]', code, JSON.stringify(data))
    res.status(code).json(data)
  })
}

PartnerController.PartnerJoin = (req, res) => {
  logger.info(req.requestId, ns, '[PartnerJoin]')
  async.waterfall([
    //get partner
    (callback) => {
      let params = {}
      PartnerModel.getPartner(req, {
        _id: req.params.id,
        type: { $in: [constants.PARTNER_TYPES.msa, constants.PARTNER_TYPES.sales] },
        status: constants.PARTNER_STATUS_TYPES.APPROVED
      }, (err, partner) => {
        if (err || !partner) {
          callback('Error Finding Partner')
        } else {
          params['partner'] = partner
          callback(null, params)
        }
      })
    },
    //get invitation
    (params, callback) => {
      PartnerModel.getInvitation(req, {
        _id: req.query.invitation_id
      }, (err, invitation) => {
        if (err) {
          callback(err)
        } else {
          params['invitation'] = invitation
          callback(null, params)
        }
      })
    },
    //create the agent
    (params, callback) => {
      let newAgentRecord = {
        user: req.userInfo.userId,
        partner: params.partner._id,
        active: params.invitation.autoActivate,
        code: Utils.generateRandomString(constants.AGENT_CODE_LENGTH).shuffle(),
        accessLevel: params.invitation.inviteeRelation,
        created: new Date()
      }

      PartnerModel.addAgent(
        req,
        newAgentRecord,
        (err, newAgent) => {
          if (err) {
            callback(err)
          } else {
            params['newAgent'] = newAgent
            callback(null, params)
          }
        }
      )
    },
    //delete invitation link
    (params, callback) => {
      DBWrapper.execute(
        PartnerInvitationSchema,
        PartnerInvitationSchema.remove,
        req.requestId,
        { _id: req.query.invitation_id },
        (err) => {
          if (err) {
            logger.error(req.requestId, ns, '[PartnerJoin]: error deleting invitation record')
          }
          callback(null, params)
        }
      )
    }
  ], (err, params) => {
    if (err) {
      logger.error(req.requestId, ns, '[PartnerJoin]', JSON.stringify(err))
      res.redirect('/')
    } else {
      res.redirect('/partners/me/resolve')
    }
  })
}

// Export a csv file with detailed tax/customer order details
PartnerController.exportOrderDetails = (orders, req, res) => {
  logger.info(req.requestId, ns, '[exportOrderDetails]:begin');
  let data = []
  let csvFileName = `Detailed_Sales_${new Date().toJSON()}.csv`
  let csvData = ""

  async.each(orders, (order, CB) => {
    async.waterfall([
      function (callback) {
        let recurringtax = '';
        if (order.subscriptions != undefined) {
          async.each(order.subscriptions[0].taxDetails, (tax, CB) => {
            if (tax.title && tax.title.text) {
              recurringtax += req.localizer.get(tax.title.text) + ': ' + formatCurrency(tax.amount, { code: order.currency, format: '%s %v' }) + ', ';
            }
            return CB();
          }, (err) => {
            if (err) {
              logger.info(req.requestId, ns, '[exportCdrs]:error', err)
            }
            return callback(null, recurringtax);
          });
        } else {
          return callback(null, recurringtax);
        }
      },
      function (recurringtax, callback) {
        let onetimetax = '';
        if (order.onetime.taxDetails != undefined) {
          async.each(order.onetime.taxDetails, (tax, CB) => {
            if (tax.title && tax.title.text) {
              onetimetax += req.localizer.get(tax.title.text) + ': ' + formatCurrency(tax.amount, { code: order.currency, format: '%s %v' }) + ', ';
            }
            return CB();
          }, (err) => {
            if (err) {
              logger.info(req.requestId, ns, '[exportCdrs]:error', err)
            }
            return callback(null, recurringtax, onetimetax);
          });
        } else {
          return callback(null, recurringtax, onetimetax);
        }
      }
    ], function (err, recurringtax, onetimetax) {
      if (err) {
        logger.info(req.requestId, ns, '[exportCdrs]:error', err)
      }
      // result now equals 'done'
      data.push({
        OrderConNumber: order.confirmationNumber,
        CustomerEmail: order.contact && order.contact.email || '',
        BillingAddress: order.billingAddress.address1,
        BillingCity: order.billingAddress.city,
        BillingState: order.billingAddress.state,
        BillingCountry: order.billingAddress.country,
        BillingZipCode: order.billingAddress.zip,
        CreatedOn: req.localizer.getDate(order.created.on),
        OneTimeFeeSubtotal: formatCurrency(order.onetime.subTotal, { code: order.currency, format: '%s %v' }),
        OneTimeTax: onetimetax,
        RecurringFeeSubtotal: formatCurrency(order.subscriptions[0].subTotal, { code: order.currency, format: '%s %v' }),
        RecurringTax: recurringtax,
      })
      CB();
    });

  }, () => {
    if (data.length) {
      let fields = Object.keys(data[0])
      csvData = json2csv({
        data: data,
        fields: fields,
        fieldNames: fields
      })
    } else {
      csvData = "No export data"
    }

    logger.info(req.requestId, ns, '[exportCdrs]:csvFileName', csvFileName)
    logger.info(req.requestId, ns, '[exportCdrs]:csvData', csvData)
    res.attachment(csvFileName)
    res.send(csvData)
  })
};

PartnerController.exportOrders = (orders, req, res) => {
  logger.info(req.requestId, ns, '[exportOrders]')
  let data = []
  let csvFileName = `Sales_${new Date().toJSON()}.csv`
  let csvData = ""

  async.each(orders, (order, CB) => {
    if (order.order) {
      let item = order.order.items[0]

      let planOption = item.product.planOptions.filter(po => {
        return po.value === item.product.planOption
      })[0]

      let usersBreakdown = ""
      if (order.details && order.details.users) {
        for (var p in order.details.users) {
          if (order.details.users.hasOwnProperty(p)) {
            usersBreakdown += p + ":" + order.details.users[p] + ','
          }
        }
      }

      let devicesBreakdown = ""
      if (order.details && order.details.devices) {
        for (var p in order.details.devices) {
          if (order.details.devices.hasOwnProperty(p)) {
            devicesBreakdown += p + ":" + order.details.devices[p] + ','
          }
        }
      }

      data.push({
        OrderPurchaseDate: order.created,
        OrderConfirmationNumber: order.order.confirmationNumber,
        AgentName: order.agent.user.account.displayname,
        AgentID: order.agent._id,
        AgentCompanyName: order.partner.fields.companyName,
        CustomerFirstName: order.order.accountInformation.firstName,
        CustomerLastName: order.order.accountInformation.lastName,
        CustomerCompanyName: order.order.accountInformation.companyName,
        BillingAddress: order.order.billingInformation.billingAddress,
        BillingCity: order.order.billingInformation.billingCity,
        BillingState: order.order.billingInformation.billingStateProvince,
        BillingCountry: order.order.billingInformation.billingCountry,
        BillingZipCode: order.order.billingInformation.billingPostalCode,
        OneTimeFee: (order.oneTimeFee / 100).formatDollars(2),
        IntervalFee: (order.intervalFee / 100).formatDollars(2),
        PlanOption: planOption ? req.localizer.get(planOption.label) : "",
        Product: item.product.title,
        Users: usersBreakdown,
        Devices: devicesBreakdown
      })
    } else {
      let subscription = order.subscriptions[0];
      let planOption = subscription ? subscription.contractLength + ' ' + req.localizer.get(subscription.contractPeriod.toUpperCase()) + ' | ' + req.localizer.get('BILLED_' + subscription.billingPeriod.toUpperCase()) : '';

      // form the orders
      let report = {
        products: {},
        users: {},
        devices: {}
      }; // initial state

      async.waterfall([
        function (callback) {
          async.eachSeries(order.items, function (item, cb) {
            let context = findCartItemContext(item, item.level);

            setImmediate(() => {
              let identifier = context.identifier; // change to identifier
              // parse products
              let products = report.products;
              let engine = item.engines;
              if (!products[engine]) {
                products[engine] = engine
              }
              // parse devices
              if (context.tags.indexOf(IPConstants.IPOFFICE_DEVICE_TAG) > -1) {
                let devices = report.devices;
                // if the device exists
                if (devices[identifier]) {
                  devices[identifier] += item.quantity;
                } else {
                  devices[identifier] = item.quantity;
                }
                // parse users
              } else if ((context.tags.indexOf(IPConstants.IPOFFICE_USER_TYPES_TAG) > -1) || (context.tags.indexOf(SpacesConstants.PRODUCT_ENGINE_NAME) > -1)) {
                let users = report.users;
                if (!users[item.title.text]) {
                  users[item.title.text] = item.quantity;
                }
              }
              return cb();
            })
          }, (err) => {
            if (err) {
              logger.info(req.requestId, ns, '[exportCdrs]:error', err)
            }
            return callback();
          });
        },
        function (callback) {
          // arg1 now equals 'one' and arg2 now equals 'two'
          let userString = '';
          async.each(Object.keys(report.users), (item, CB) => {
            userString += item + ': ' + report.users[item] + ', '
            return CB();
          }, (err) => {
            if (err) {
              logger.info(req.requestId, ns, '[exportCdrs]:error', err)
            }
            return callback(null, userString);
          });
        },
        function (user, callback) {
          // user now equals 'three'
          let deviceString = '';
          async.each(Object.keys(report.devices), (item, CB) => {
            deviceString += item + ': ' + report.devices[item] + ', '
            return CB();
          }, (err) => {
            if (err) {
              logger.info(req.requestId, ns, '[exportCdrs]:error', err)
            }
            return callback(null, user, deviceString);
          });
        },
        function (user, device, callback) {
          // user now equals 'three'
          let productString = '';
          async.each(Object.keys(report.products), (product, CB) => {
            productString += product + ' ';
            return CB();
          }, (err) => {
            if (err) {
              logger.info(req.requestId, ns, '[exportCdrs]:error', err)
            }
            return callback(null, user, device, productString);
          });
        }
      ], function (err, user, device, product) {
        if (err) {
          logger.info(req.requestId, ns, '[exportCdrs]:error', err)
        }
        // result now equals 'done'
        data.push({
          OrderPurchaseDate: order.created.on,
          OrderConfirmationNumber: order.confirmationNumber,
          AgentName: (order.partnerAgent ? order.partnerAgent.user.account.displayname : ""),
          AgentID: (order.partnerAgent ? order.partnerAgent._id : ''),
          AgentCompanyName: order.partner.fields.companyName,
          CustomerFirstName: order.contact.firstName,
          CustomerLastName: order.contact.lastName,
          CustomerCompanyName: order.company && order.company.name || '',
          CustomerEmailAddress: order.contact && order.contact.email || '',
          BillingAddress: order.billingAddress.address1,
          BillingCity: order.billingAddress.city,
          BillingState: order.billingAddress.state,
          BillingCountry: order.billingAddress.country,
          BillingZipCode: order.billingAddress.zip,
          OneTimeFee: (order.onetime != undefined ? formatCurrency(order.onetime.subTotal, { code: order.currency, format: '%s %v' }) : ''),
          IntervalFee: (order.subscriptions[0] != undefined ? formatCurrency(order.subscriptions[0].subTotal, { code: order.currency, format: '%s %v' }) : ''),
          PlanOption: planOption,
          Product: product,
          Users: user,
          Devices: device
        })
        CB();
      });
    }

  }, () => {
    if (data.length) {
      let fields = Object.keys(data[0])
      csvData = json2csv({
        data: data,
        fields: fields,
        fieldNames: fields
      })
    } else {
      csvData = "No export data"
    }

    logger.info(req.requestId, ns, '[exportCdrs]:csvFileName', csvFileName)
    logger.info(req.requestId, ns, '[exportCdrs]:csvData', csvData)
    res.attachment(csvFileName)
    res.send(csvData)

  })

}

const findCartItemContext = (cartItem, level) => {
  if (level >= 0) {
    return cartItem && (level === 0 ? cartItem.salesModel : (
      level === 1 ? cartItem.salesModelItem : (
        level === 2 ? cartItem.attribute : null)));
  }
  return cartItem && (cartItem.level === 0 ? cartItem.salesModel : (
    cartItem.level === 1 ? cartItem.salesModelItem : (
      cartItem.level === 2 ? cartItem.attribute : null)));
}

const findOldModelOrders = (req, query) => {
  return new Promise((resolve, reject) => {
    PartnerModel.getOrders(req, query, null, (err, orders) => {
      if (err) {
        reject(err);
      } else {
        ParsePartnerOrders(req, orders, (err, parsedOrders) => {
          if (err) {
            reject(err);
          } else {
            resolve(parsedOrders);
          }
        });
      }
    });
  });
}

PartnerController.findNewModelOrders = (req, query, parentPartnerId) => {
  return new Promise((resolve, reject) => {
    const callback = (err, partners) => {
      if (err) {
        logger.error(req.requestId, ns, '[FilterOrders]:error', err);
        return reject(err);
      }
      logger.info('partners', partners);
      let partnerIds = partners.map((one) => one._id);
      if (parentPartnerId) {
        partnerIds.push(parentPartnerId);
      }

      if (partnerIds.length > 0) {
        query['partner'] = {
          $in: partnerIds
        }
      }
      query['status'] = ORDER_STATUS_SUCCESS;

      logger.info(req.requestId, ns, '[FilterOrders]:order query', query);

      OrderBackend.find(query, {
        populate: [
          {
            path: 'partner'
          },
          {
            path: 'partnerAgent',
            populate: {
              path: 'user'
            }
          }
        ],
        sort: { 'created.on': -1 }
      }).then(resolve).catch(reject);
    }
    if (parentPartnerId) {
      PartnerModel.getPartners(req, { parent: parentPartnerId }, { _id: 1 }, callback);
    } else {
      callback(null, []);
    }
  });
}


PartnerController.FilterAdminOrders = (req, res) => {
  logger.info(req.requestId, ns, '[FilterAdminOrders]');

  const onOrderQuerySuccess = (result) => {
    if (result.length > 0) {
      PartnerController.exportOrderDetails(result, req, res);
    }
  };

  const onOrderQueryError = (err) => {
    logger.error(req.requestId, ns, '[FilterAdminOrders]:error', err);
    res.status(400).json({
      error: err
    })
  };

  return new Promise(() => {
    let query = {
      status: "success",
      subscriptions: {
        $exists: true,
        $not: {
          $size: 0
        }
      }
    };
    OrderBackend.find(query, {
      "subscriptions": 1,
      "billingAddress": 1,
      "contact.email": 1,
      "onetime": 1,
      "confirmationNumber": 1,
      "created.on": 1,
      "_id": 0
    }).then(onOrderQuerySuccess).catch(onOrderQueryError);
  });
}

PartnerController.FilterOrders = (req, res) => {
  logger.info(req.requestId, ns, '[FilterOrders]')

  const onOrderQuerySuccess = (result) => {
    //logger.info(req.requestId, ns, '[FilterOrders]:orders', fullOrderArray)
    if (req.query.export) {
      PartnerController.exportOrders(result, req, res);
    } else {
      res.status(200).json({
        requestId: req.requestId,
        orders: result,
        query: req.query,
      })
    }
  };

  const onOrderQueryError = (err) => {
    logger.error(req.requestId, ns, '[FilterOrders]:error', err);
    res.status(400).json({
      error: err
    })
  };

  let query = {};
  if (req.query.from && req.query.to) {
    let toDate = new Date(req.query.to);
    let fromDate = new Date(req.query.from);
    query['created'] = {
      $gte: fromDate,
      $lte: toDate
    }
  } else if (req.query.from) {
    let fromDate = new Date(req.query.from);
    query['created'] = {
      $gte: fromDate
    }
  } else if (req.query.to) {
    let toDate = new Date(req.query.to);
    query['created'] = {
      $lte: toDate
    }
  }

  let query2 = Object.assign({}, query);
  if (query.created) {
    query2['created.on'] = query['created'];
    delete query2.created;
  }

  if (req.query.partner) {
    query['partner'] = req.query.partner;
    query2['partner'] = req.query.partner;
  } else if (req.query.parent) {
    query['parentPartner'] = req.query.parent
  } else {
    return res.status(400).json({
      error: "no parent or partner"
    })
  }

  if (req.query.agent) {
    query['agent'] = req.query.agent
    query2['partnerAgent'] = req.query.agent;
    PartnerController.findNewModelOrders(req, query2, req.query.parent).then(onOrderQuerySuccess).catch(onOrderQueryError);
  }

  if (req.query.product) {
    query['slug'] = req.query.product;
    query2['items.offer.identifier'] = req.query.product;

    PartnerController.findNewModelOrders(req, query2, req.query.parent).then(onOrderQuerySuccess).catch(onOrderQueryError);
  }

  if (req.query.region) {
    query2['currency'] = req.query.region;
    PartnerController.findNewModelOrders(req, query2, req.query.parent).then(onOrderQuerySuccess).catch(onOrderQueryError);
  }

  if (!req.query.region && !req.query.product && !req.query.agent) {
    PartnerController.findNewModelOrders(req, query2, req.query.parent).then(onOrderQuerySuccess).catch(onOrderQueryError);
  }

}


PartnerController.FilterCustomers = (req, res) => {
  logger.info(req.requestId, ns, '[FilterCustomers]')

  let query = {};

  if (req.query.partner) {
    query['partner'] = req.query.partner
  } else if (req.query.parent) {
    query['parentPartner'] = req.query.parent
  } else {
    return res.status(400).json({
      error: "no parent or partner"
    })
  }

  if (req.query.agent) {
    query['agent'] = req.query.agent
  }

  if (req.query.from && req.query.to) {
    query['created'] = {
      $gte: req.query.from,
      $lt: req.query.to
    }
  }

  logger.info(req.requestId, ns, '[FilterCustomers]:query', JSON.stringify(query))

  PartnerModel.getCustomers(req, query, null, (err, customers) => {
    if (err) {
      res.status(400).json({
        error: err
      })
    } else {
      res.status(200).json({
        requestId: req.requestId,
        customers: customers,
        query: req.query
      })
    }
  })
}

export default PartnerController
