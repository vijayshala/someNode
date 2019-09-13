const ns = '[AgentController]'
import logger from 'applogger'
import async from 'async'
import constants from '../config/constants'
import PartnerModel from '../models/PartnerModel'
import {OfferBackend} from '../server/offer/offer.backend';
import _ from 'lodash'
import PartnerConnectionModel from '../models/PartnerConnectionModel'
import PartnerController from '../controllers/PartnerController';
import PageModel from '../models/PageModel'
import LookupModel, { getLookup } from '../models/LookupModel'

const AgentController = {}

const ParsePartnerOrders = (req, orders, callback, toObject) => {
  logger.info(req.requestId, ns, '[ParsePartnerOrders]')

    let theOrders = []
    async.each(orders, (order, orderCB) => {
      let item = order && order.order && order.order.items[0];
      if(item && item.product.slug === constants.ADVANCED_PRODUCTS['ip-office'].slug) {
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
          if(details.devices[user.device]) {
            details.devices[user.device] += 1;
          } else {
            details.devices[user.device] = 1;
          }
          userCB()
        }, () => {
          if(toObject) {
            order = order.toObject()
          }
          order['details'] = details;
          theOrders.push(order);
          orderCB()
        })
        
      } else if(item && item.product.slug === constants.ADVANCED_PRODUCTS['zang-spaces'].slug) {
        let details = {}

        details['users'] = {
          'Plus': item.product.salesmodel.users.team.qty,
          'Business': item.product.salesmodel.users.business.qty
        }
        if(toObject) {
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

const canUpdateAgentInfo = function(req) {
  if(req.partnerInfo) {
    if(req.userInfo.accessLevel <= constants.USER_LEVELS.ADMIN) {
      return true
    } else {
      let partner = req.partnerInfo.filter(p => {
        //return p._id.toString() === req.params.id && p.agent._id.toString() === req.params.agentId
        return p._id.toString() === req.params.id
      })[0]
      if(partner && partner.agent.accessLevel <= constants.AGENT_LEVELS.ADMIN) {
        return true
      } else {
        return false
      }
    }
  } else {
    if(req.userInfo.accessLevel <= constants.USER_LEVELS.ADMIN) {
      return true
    }
    return false
  }
}

function getPartnerAndAgentInfo(req, cb) {
  async.waterfall([
    //get page
    (callback) => {
      let params = {}
      PageModel.getPage(req, 'partners', (err, page) => {
        if(err) {
          callback(err)
        } else {
          params['page'] = page
          callback(null, params)
        }
      })
    },
    //get partner
    (params, callback) => {
      PartnerModel.getPartner(req, {
        _id: req.params.id
      }, (err, partner) => {
        if(err || !partner) {
          callback('Error Finding Partner')
        } else {
          params['partner'] = partner
          callback(null, params)
        }
      })
    },
    //get agent
    (params, callback) => {
      PartnerModel.getAgent(req, {
        _id: req.params.agentId
      }, null, (err, agent) => {
        if(err || !agent) {
          callback('Error Finding Agent')
        } else {
          agent = agent.toObject()
          agent['relation'] = Object.keys(constants.AGENT_LEVELS).find(key => constants.AGENT_LEVELS[key] === agent.accessLevel)
          params['agent'] = agent
          callback(null, params)
        }
      })
    },
  ], cb)
}


AgentController.getInfo = (req, res) => {
  logger.info(req.requestId, ns, '[getInfo]')
  async.waterfall([
    //get partner and agent info
    (callback) => {
      let params = {}
      getPartnerAndAgentInfo(req, (err, paParams) => {
        if(err) {
          callback(err)
        } else {
          params = paParams
          callback(null, params)
        }
      })
    },
    //more params
    (params, callback) => {
      params['active'] = 'info'
      params['canUpdateAgentInfo'] = canUpdateAgentInfo(req)
      params['_csrf'] = req.csrfToken()
      callback(null, params)
    }
  ], (err, params) => {
    if(err) {
      logger.error(req.requestId, ns, '[getInfo]', JSON.stringify(err))
      res.redirect('/')
    } else {
      res.render('agent/AgentInfo', params)
    }
  })
}

AgentController.getQuotes = (req, res) => {
  logger.info(req.requestId, ns, '[getInfo]')
  async.waterfall([
    //get partner and agent info
    (callback) => {
      let params = {}
      getPartnerAndAgentInfo(req, (err, paParams) => {
        if(err) {
          callback(err)
        } else {
          params = paParams
          callback(null, params)
        }
      })
    },
    //more params
    (params, callback) => {
      params['active'] = 'quotes'
      params['canUpdateAgentInfo'] = canUpdateAgentInfo(req)
      params['_csrf'] = req.csrfToken()
      callback(null, params)
    },
  ], async (err, params) => {
    if(err) {
      logger.error(req.requestId, ns, '[getInfo]', JSON.stringify(err))
      res.redirect('/')
    } else {
      
      let countriesFilter = ['United States'];
      if (req.hasAdminPermission) {
        countriesFilter.push('Canada');
      }
      let countries = await getLookup(req, {
        type: constants.LOOKUP_TYPES.COUNTRIES,
        keyValue: {
          $in: countriesFilter
        }
      });

      let states = await getLookup(req, {
        type: constants.LOOKUP_TYPES.STATES
      });
      params.username2 = 'ray'
      params.preloadedData = { countries, states }
      logger.info(ns, '------------preload', params);
      res.render('agent/AgentQuotes', params)
    }
  })
}

AgentController.updateInfo = (req, res) => {
  logger.info(req.requestId, ns, '[updateInfo]')
  if(!canUpdateAgentInfo(req)) {
    return res.redirect('/')
  }

  let data = {
    accessLevel: Object.values(constants.AGENT_LEVELS).indexOf(parseInt(req.body.accessLevel)) > -1 ? parseInt(req.body.accessLevel) : constants.AGENT_LEVELS.AGENT,
    active: req.body.active ? true : false,

  }

  PartnerModel.updateAgent(req, req.params.id, req.params.agentId, data, (err, agent) => {
    if(err) {
      logger.error(req.requestId, ns, '[updateInfo]:error', err);
    }
    
    res.redirect('/partners/' + encodeURIComponent(req.params.id) + '/agents/' + encodeURIComponent(req.params.agentId) + '/info' )
  })
}

AgentController.getOrders = (req, res) => {
  logger.info(req.requestId, ns, '[getOrders]')
  async.waterfall([
    //get partner and agent info
    (callback) => {
      let params = {}
      getPartnerAndAgentInfo(req, (err, paParams) => {
        if(err) {
          callback(err)
        } else {
          params = paParams
          callback(null, params)
        }
      })
    },
    //get orders
    (params, callback) => {
      PartnerModel.getOrders(req, {
        partner: req.params.id,
        agent: req.params.agentId
      }, null, (err, orders) => {
        if(err) {
          callback(err)
        } else {
          params['orders'] = orders
          callback(null, params)
        }
      })
    },
    //more params
    (params, callback) => {
      params['active'] = 'orders'
      callback(null, params)
    },
    (params, callback) => {
      ParsePartnerOrders(req, params.orders, (err, parsedOrders) => {
        params['orders'] = parsedOrders
        callback(null, params)
      })
    },
    (params, callback)  =>  {
      PartnerController.findNewModelOrders(req, {partnerAgent: req.params.agentId}, req.params.id).then((newOrders)  =>  {
        params.orders = newOrders.concat(params.orders);
        callback(null, params)
      })
    },
    (params, callback)  =>  {
      OfferBackend.findAllByIdentifiers(['uc-essentials', 'uc-business'], {
        identifierType: 'slug',
        requestId: req.requestId
      }).then((offers) => {
        params.productlist = offers;
        callback(null, params);
      }).catch((err)  =>  {
        logger.error(req.requestId, ns, 'error', err);
        callback("Product list not found");
      });
    }
  ], (err, params) => {
    if(err) {
      logger.error(req.requestId, ns, '[getOrders]', JSON.stringify(err))
      res.redirect('/')
    } else {
      params['orders'] = params['orders']
      res.render('agent/AgentOrders', params)
    }
  })
}

AgentController.getCustomers = (req, res) => {
  logger.info(req.requestId, ns, '[getCustomers]')
  async.waterfall([
    //get partner and agent info
    (callback) => {
      let params = {}
      getPartnerAndAgentInfo(req, (err, paParams) => {
        if(err) {
          callback(err)
        } else {
          params = paParams
          callback(null, params)
        }
      })
    },
    //get orders
    (params, callback) => {
      PartnerModel.getCustomers(req, {
        partner: req.params.id,
        agent: req.params.agentId
      }, null, (err, customers) => {
        if(err) {
          callback(err)
        } else {
          params['customers'] = customers
          callback(null, params)
        }
      })
    },
    //more params
    (params, callback) => {
      params['active'] = 'customers'
      callback(null, params)
    }
  ], (err, params) => {
    if(err) {
      logger.error(req.requestId, ns, '[getCustomers]', JSON.stringify(err))
      res.redirect('/')
    } else {
      res.render('agent/AgentCustomers', params)
    }
  })
}


export default AgentController
