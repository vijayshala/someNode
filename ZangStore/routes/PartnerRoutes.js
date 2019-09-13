import logger from 'applogger'
import express from 'express'
import constants from '../config/constants'
import BaseController from '../controllers/BaseController'
import PartnerController from '../controllers/PartnerController'
import AgentController from '../controllers/AgentController'
import PartnerInvitationSchema  from '../schemas/PartnerInvitationSchema'
import { viewQuotes } from '../server/quote/quote.controller';
import DBWrapper from 'dbwrapper'

const ns = '[PartnerRoutes]'
const router = express.Router()

const AuthorizeAdmin = (req, res, next) => {
  if(req.params.id !== 'me'){
     return BaseController.authorizeAdmin(req, res, next)
  }
  next()
}

const hasAccessToPP = (req, res, next) => {
  if(req.partnerInfo) {
    if(req.userInfo.accessLevel <= constants.USER_LEVELS.ADMIN) {
      logger.info(req.requestId, ns, '[hasAccessToPP]:isADMIN')
      next()
    } else {
      let partner = req.partnerInfo.filter(p => {
        return p._id.toString() === req.params.id
      })[0]
      logger.info(req.requestId, ns, '[hasAccessToPP]:partner', JSON.stringify(partner))
      if(partner && partner.agent.accessLevel <= constants.AGENT_LEVELS.ADMIN) {
        logger.info(req.requestId, ns, '[hasAccessToPP]:isOWNER')
        next()
      } else {
        //check child company
        let child = req.partnerInfo.filter(p => {
          return p.children.indexOf(req.params.id) > -1
        })[0]

        if(child) {
          next()
        } else {
          logger.info(req.requestId, ns, '[hasAccessToPP]:home')
          res.redirect('/')
        }
      }
    }
  } else {
    return BaseController.authorizeAdmin(req, res, next)
  }
}

const hasAccessToFilterOrExportPP = (req, res, next) => {
  if(req.partnerInfo) {
    if(req.userInfo.accessLevel <= constants.USER_LEVELS.ADMIN) {
      logger.info(req.requestId, ns, '[hasAccessToFilterOrExportPP]:isADMIN')
      next()
    } else {
      let partner = req.partnerInfo.filter(p => {
        return p._id.toString() === req.query.partner || p._id.toString() === req.query.parent
      })[0]
      logger.info(req.requestId, ns, '[hasAccessToFilterOrExportPP]:partner', JSON.stringify(partner))
      if(partner && partner.agent.accessLevel <= constants.AGENT_LEVELS.ADMIN) {
        logger.info(req.requestId, ns, '[hasAccessToFilterOrExportPP]:isOWNER')
        next()
      } else {
        //check child company
        let child = req.partnerInfo.filter(p => {
          return p.children.indexOf(req.query.partner) > -1 || p.children.indexOf(req.query.parent) > -1
        })[0]

        if(child) {
          next()
        } else {
          logger.info(req.requestId, ns, '[hasAccessToFilterOrExportPP]:401')
          res.status(401).json({
            err: 'Access Denied'
          })
        }
      }
    }
  } else {
    return BaseController.authorizeAdmin(req, res, next)
  }
}

const hasAccessToAP = (req, res, next) => {
  if(req.partnerInfo) {
    if(req.userInfo.accessLevel <= constants.USER_LEVELS.ADMIN) {
      next()
    } else {
      let partner = req.partnerInfo.filter(p => {
        return p._id.toString() === req.params.id && p.agent._id.toString() === req.params.agentId
      })[0]
      if(partner) {
        next()
      } else {
        partner = req.partnerInfo.filter(p => {
          return p._id.toString() === req.params.id
        })[0]
        if(partner && partner.agent.accessLevel <= constants.AGENT_LEVELS.ADMIN) {
          next()
        } else {
          //check child company
          let child = req.partnerInfo.filter(p => {
            return p.children.indexOf(req.params.id) > -1
          })[0]
          if(child) {
            next()
          } else {
            res.redirect('/')
          }
          
        }

      }
    }
  } else {
    return BaseController.authorizeAdmin(req, res, next)
  }
}

const hasAccessToFilterOrExportAP = (req, res, next) => {
  if(req.partnerInfo) {
    if(req.userInfo.accessLevel <= constants.USER_LEVELS.ADMIN) {
      next()
    } else {
      let partner = req.partnerInfo.filter(p => {
        return p._id.toString() === req.query.partner && p.agent._id.toString() === req.query.agent
      })[0]
      if(partner) {
        next()
      } else {
        partner = req.partnerInfo.filter(p => {
          return p._id.toString() === req.query.partner
        })[0]
        if(partner && partner.agent.accessLevel <= constants.AGENT_LEVELS.ADMIN) {
          next()
        } else {
          //check child company
          let child = req.partnerInfo.filter(p => {
            return p.children.indexOf(req.query.partner) > -1
          })[0]
          if(child) {
            next()
          } else {
            res.status(401).json({
              err: 'Access Denied'
            })
          }
          
        }

      }
    }
  } else {
    return BaseController.authorizeAdmin(req, res, next)
  }
}

const canJoinPartner = (req, res, next) => {
  if(req.partnerInfo) {
    let partner = req.partnerInfo.filter(p => {
      return p._id.toString() === req.params.id
    })[0]
    if(partner) {
      res.redirect('/partners/me/resolve')
    } else {
      next()
    }
  } else {
    next()
  }
}


const canJoinOrApply = (req, res, next) => {
  if(req.query.invitation_id) {
    DBWrapper.execute(
      PartnerInvitationSchema,
      PartnerInvitationSchema.findOne,
      req.requestId,
      { _id: req.query.invitation_id },
      (err, invitation) => {
        if(err){
          logger.info(req.requestId, ns, '[canJoinOrApply]:Error getting invitation with _id:' + req.query.invitation_id)
          res.redirect('/')
        } else {
          if(invitation) {
            next()
            //disable email matching
            // if(invitation.inviteeEmail === req.userInfo.username) {
            //   next()
            // } else {
            //   logger.info(req.requestId, ns, '[canJoinOrApply]:Invalid Invitation Email')
            //   res.redirect('/')
            // }
          } else {
            logger.info(req.requestId, ns, '[canJoinOrApply]:No invitation found with _id:' + req.query.invitation_id)
            res.redirect('/')
          }
        }
      }
    )
  } else {
    res.redirect('/')
  }
}

const canChangeStatus = (req, res, next) => {
  if(req.partnerInfo) {
    if(req.userInfo.accessLevel <= constants.USER_LEVELS.ADMIN) {
      logger.info(req.requestId, ns, '[hasAccessToPP]:isADMIN')
      next()
    } else {
      let partner = req.partnerInfo.filter(p => {
        return p._id.toString() === req.params.id
      })[0]
      logger.info(req.requestId, ns, '[hasAccessToPP]:partner', JSON.stringify(partner))
      if(partner && partner.agent.accessLevel <= constants.AGENT_LEVELS.ADMIN) {
        logger.info(req.requestId, ns, '[hasAccessToPP]:isOWNER')
        next()
      } else {
        //check child company
        let child = req.partnerInfo.filter(p => {
          return p.children.indexOf(req.params.id) > -1
        })[0]
        if(child) {
          next()
        } else {
          logger.info(req.requestId, ns, '[hasAccessToPP]:home')
          res.redirect('/')
        }
      }
    }
  } else {
    return BaseController.authorizePantnerApprover(req, res, next)
  }
} 

//router.get('/', PartnerController.PartnerPrograms)

router.get('/administration', BaseController.authenticate, BaseController.authorizeAdmin, PartnerController.PartnerAdministration)
router.post('/administration', BaseController.authenticate, BaseController.authorizeAdmin, PartnerController.PartnerAdministrationAddPartner)
router.get('/administration/connections', BaseController.authenticate, BaseController.authorizeAdmin, PartnerController.PartnerConnections)
router.get('/administration/connections/:id/delete', BaseController.authenticate, BaseController.authorizeAdmin, PartnerController.DeletePartnerConnection)
router.get('/administration/orders', BaseController.authenticate, BaseController.authorizeAdmin, PartnerController.PartnerAdministrationOrders)

//router.get('/:type', PartnerController.PartnerPage)

// router.get('/:type/application', BaseController.authenticate, canJoinOrApply,  PartnerController.PartnerApplication)
// router.post('/:type/application', BaseController.authenticate, PartnerController.PartnerApplicationPost)

router.get('/sales/application', BaseController.authenticate, canJoinOrApply,  PartnerController.PartnerApplication)
router.post('/sales/application', BaseController.authenticate, PartnerController.PartnerApplicationPost)

router.get('/me/resolve', BaseController.authenticate, PartnerController.ResolvePortal)
router.get('/:id/info', BaseController.authenticate, hasAccessToPP, PartnerController.PartnerInfo)
router.get('/:id/orders', BaseController.authenticate, hasAccessToPP, PartnerController.PartnerOrders)
router.get('/:id/quotes', BaseController.authenticate, hasAccessToPP, viewQuotes);
router.get('/:id/customers', BaseController.authenticate, hasAccessToPP, PartnerController.PartnerCustomers)
router.get('/:id/agents', BaseController.authenticate, hasAccessToPP, PartnerController.PartnerAgents)
router.post('/:id/invite', BaseController.authenticate, PartnerController.PartnerInvite)
router.get('/:id/join', BaseController.authenticate, canJoinOrApply, canJoinPartner, PartnerController.PartnerJoin)

router.get('/:id/agents/:agentId/info', BaseController.authenticate, hasAccessToAP, AgentController.getInfo)
router.post('/:id/agents/:agentId/info', BaseController.authenticate, hasAccessToAP, AgentController.updateInfo)
router.get('/:id/agents/:agentId/orders', BaseController.authenticate, hasAccessToAP, AgentController.getOrders)
router.get('/:id/agents/:agentId/customers', BaseController.authenticate, hasAccessToAP, AgentController.getCustomers)
router.get('/:id/agents/:agentId/quotes*', BaseController.authenticate, hasAccessToAP, AgentController.getQuotes)

router.get('/orders/administration/export', BaseController.authenticate, hasAccessToFilterOrExportPP, PartnerController.FilterAdminOrders)
router.get('/orders/partner', BaseController.authenticate, hasAccessToFilterOrExportPP, PartnerController.FilterOrders)
router.get('/orders/agent', BaseController.authenticate, hasAccessToFilterOrExportAP, PartnerController.FilterOrders)

router.get('/customers/partner', BaseController.authenticate, hasAccessToFilterOrExportPP, PartnerController.FilterCustomers)
router.get('/customers/agent', BaseController.authenticate, hasAccessToFilterOrExportAP, PartnerController.FilterCustomers)

router.get('/:id/status/:status', BaseController.authenticate, hasAccessToPP, canChangeStatus, PartnerController.SetPartnerStatus)








export default router
