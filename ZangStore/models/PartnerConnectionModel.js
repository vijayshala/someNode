import logger from 'applogger'
import DBWrapper from 'dbwrapper'

import PartnerConnectionSchema from '../schemas/PartnerConnectionSchema'

const ns = '[PartnerConnectionModel]'

const PartnerConnectionModel = {}

PartnerConnectionModel.getConnection = (req, query, cb) => {
  logger.info(req.requestId, ns, '[getConnection]', JSON.stringify(query))
  let execObj = PartnerConnectionSchema.findOne(query)
  .populate('partner')
  .populate({
    path: 'agent',
    populate: {
      path: 'user',
      model: 'User'
    }
  })
  .populate('customer', { _id: 1, "account.displayname":1, "account.picturefile": 1, "account.username": 1 })
  // .populate({
  //   path: 'partner',
  //   populate: {
  //     path: 'user',
  //     model: 'User'
  //   }
  // })
  DBWrapper.execute(
    execObj,
    execObj.exec,
    req.requestId,
    query,
    (err, connection) => {
      if(err){
        logger.error(req.requestId, ns, '[getConnection]', JSON.stringify(err))
        cb(err)
      } else {
        cb(null, connection)
      }
    }
  )
}

PartnerConnectionModel.getConnections = (req, query, cb) => {
  logger.info(req.requestId, ns, '[getConnections]', JSON.stringify(query))
  let execObj = PartnerConnectionSchema
  .find(query, null, {sort: { "created": -1 }})
  .populate('partner')
  .populate({
    path: 'agent',
    populate: {
      path: 'user',
      model: 'User'
    }
  })
  .populate('customer', { _id: 1, "account.displayname":1, "account.picturefile": 1, "account.username": 1 })
  DBWrapper.execute(
    execObj,
    execObj.exec,
    req.requestId,
    query,
    (err, connections) => {
      if(err){
        logger.error(req.requestId, ns, '[getConnections]', JSON.stringify(err))
        cb(err)
      } else {
        cb(null, connections)
      }
    }
  )
}

PartnerConnectionModel.setConnection = (req, connectionData, cb) => {
  logger.info(req.requestId, ns, '[setConnection]', JSON.stringify(connectionData))
  let newConnection = new PartnerConnectionSchema(connectionData)
  DBWrapper.execute( newConnection, newConnection.save,
    req.requestId,
    (err, connection) => {
      if(err){
        cb(err)
      } else {
        cb(null, connection)
      }
    }
  )
}

PartnerConnectionModel.removeConnection = (req, query, cb) => {
  logger.info(req.requestId, ns, '[removePartnerConnection]', JSON.stringify(query))
  DBWrapper.execute(
    PartnerConnectionSchema,
    PartnerConnectionSchema.remove,
    req.requestId,
    query,
    (err) => {
      if(err){
        logger.error(req.requestId, ns, '[removePartnerConnection]', JSON.stringify(err))
        cb(err)
      } else {
        cb(null)
      }
    }
  )
}

export default PartnerConnectionModel
