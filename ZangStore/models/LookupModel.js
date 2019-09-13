

import logger from 'applogger'
import async from 'async'
import DBWrapper from 'dbwrapper'
import LookupSchema from '../schemas/LookupSchema'

const ns = '[LookupModel]'
const LookupModel = {}

LookupModel.getLookup = (req, query, cb) => {
  logger.info(req.requestId, ns, '[getLookup]')
  DBWrapper.execute(LookupSchema, LookupSchema.find, req.requestId, query, (err, result) => {
    if(err){
      logger.error(req.requestId, ns, '[getLookup]', err)
      cb(err)
    } else {
      logger.info(req.requestId, ns, '[getLookup]:Result')
      cb(null, result)
    }
  })
  //LookupSchema.find(query).sort(options).exec(cb)
}


LookupModel.getLookups = (req, types, cb) => {
  logger.info(req.requestId, ns, '[getLookups]', JSON.stringify(types))
  let lookups = {}
  async.times(types.length, (i, next) => {
    LookupModel.getLookup(req, { type: types[i] }, (err, lookup) => {
      lookup.sort((a, b) => {
        if(a.keyValue < b.keyValue) return -1;
        if(a.keyValue > b.keyValue) return 1;
        return 0;
      });
      lookups[types[i]] = lookup
      next(err, lookup)
    })
  }, (err) => {
    if(err){
      cb(err)
    } else {
      cb(null, lookups)
    }
  })
}

export async function getLookup(req, query) {
  let fn = `[${req.requestId}]${ns}[getLookup]` 
  logger.info(fn, '[getLookup]')
  return await LookupSchema.find(query);  
}


export default LookupModel
