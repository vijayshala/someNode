import logger from 'applogger'
import config from '../config'
import constants from '../config/constants'

import async from 'async'
import PartnerModel from '../models/PartnerModel'
import PartnerConnectionModel from '../models/PartnerConnectionModel'


const ns = '[PartnerMiddleware]'

export default function (req, res, next) {
  req.partnerInfo = null
  res.locals.partnerInfo = null
  req.partnerConnection = null
  res.locals.partnerConnection = null
  res.locals.partnerCookie = req.cookies[constants.PARTNER_CODE_COOKIE_NAME]

  logger.info(req.requestId, ns, '[partnerCookie]', res.locals.partnerCookie)
  if(req.userInfo){
    if(req.cookies[constants.PARTNER_CODE_COOKIE_NAME]){
      logger.info(req.requestId, ns, '[FoundCookie]:', constants.PARTNER_CODE_COOKIE_NAME, req.cookies[constants.PARTNER_CODE_COOKIE_NAME])
      PartnerModel.setPartnerConnection(req, req.cookies[constants.PARTNER_CODE_COOKIE_NAME], () => {
        res.clearCookie(constants.PARTNER_CODE_COOKIE_NAME)
        logger.info(req.requestId, ns, '[CreatedPartnerConnection]:Cleared Cookie', req.cookies[constants.PARTNER_CODE_COOKIE_NAME])
        res.redirect(req.url)
      })
    } else {
      async.waterfall([
        (callback) => {
          PartnerModel.getPartnersWithPageInfo(req, {
            user: req.userInfo.userId
          }, (err, partner) => {
            if(partner){
              req.partnerInfo = partner
              res.locals.partnerInfo = partner
            }
            callback(null)
          })
        },
        //get partner connection
        (callback) => {
          PartnerConnectionModel.getConnection(req, { customer: req.userInfo.userId }, (err, connection) => {
            if(err){
              logger.error(req.requestId, ns, ':getConnection', JSON.stringify(err))
            } else {
              req.partnerConnection = connection
              res.locals.partnerConnection = connection
            }
            callback(null)
          })
        }
      ], () => {
        next()
      })
    }
  } else {
    next()
  }
}
