import logger from 'applogger'
import DBWrapper from 'dbwrapper'
import async from 'async'

import LegalDocSchema from '../schemas/LegalDocSchema'
import { version } from 'mongoose';


const ns = '[LegalDocModel]'

const AdwModel = {}

AdwModel.getAll = (req, query, cb) => {
    logger.info(req.requestId, ns, '[getDocs]')
  
    DBWrapper.execute(
      LegalDocSchema,
      LegalDocSchema.find,
      req.requestId,
      query,
      (err, docs) => {
        if (err) {
          logger.error(req.requestId, ns, '[getDocs]:err', err)
          cb(err)
        } else {
          let parsedDocs = []
          async.each(docs, (doc, docCB) => {
            doc = doc.toObject()
            let version = doc.versions.pop()
            parsedDocs.push({
              title: doc.title,
              slug: doc.slug,
              category: doc.category,
              versionLabel: version.versionLabel,
              external: version.external,
              externalUrl: version.externalUrl,
              htmlUrl: doc.htmlUrl,
              pdfUrl: doc.pdfUrl
            })
            docCB()
          }, () => {
            cb(null, parsedDocs)
          })
        }
      }
    )
  }

  export default AdwModel