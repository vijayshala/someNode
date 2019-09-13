import logger from 'applogger'
import DBWrapper from 'dbwrapper'
import async from 'async'

import LegalDocSchema from '../schemas/LegalDocSchema'
import { version } from 'mongoose';


const ns = '[LegalDocModel]'

const LegalDocModel = {}

export async function getDoc(req, query) {
  try {
    let doc = await LegalDocSchema.findOne(query);
    doc = doc.toObject()
    let version = doc.versions.pop()
    delete doc.versions
    doc.versionLabel = version.versionLabel
    doc.external = version.external
    doc.contents = version.contents
    return doc
  }
  catch (err) {
    return null;
  }
}

export async function getDocs(req, query) {
  let docs = []
  try {
    docs = await LegalDocSchema.find(query)
  }
  catch (err) {
    docs = []
  }
  let parsedDocs = []
  for (var doc of docs) {
    doc = doc.toObject()
    let version = doc.versions.pop()
    parsedDocs.push({
      title: doc.title,
      slug: doc.slug,
      category: doc.category,
      versionLabel: version.versionLabel,
      external: version.external,
      contents: version.contents
    })
  }
  return parsedDocs
}

LegalDocModel.getDocs = (req, query, cb) => {
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

LegalDocModel.getDoc = (req, query, cb) => {
  logger.info(req.requestId, ns, '[getDoc]')

  DBWrapper.execute(
    LegalDocSchema,
    LegalDocSchema.findOne,
    req.requestId,
    query,
    (err, doc) => {
      if (err) {
        logger.error(req.requestId, ns, '[getDoc]:err', err)
        cb(err)
      } else {
        try {
          doc = doc.toObject()
          let version = doc.versions.pop()
          delete doc.versions
          doc.versionLabel = version.versionLabel
          doc.external = version.external
          doc.externalUrl = version.externalUrl;
          doc.pdfUrl = version.pdfUrl;
          doc.htmlUrl = version.htmlUrl;
          cb(null, doc);
        } catch (e) {
          cb(err);
        }
      }
    }
  )
}

LegalDocModel.getDocWithVersion = (req, slug, version, cb) => {
  logger.info(req.requestId, ns, '[getDocWithVersion]', slug, version)

  DBWrapper.execute(
    LegalDocSchema,
    LegalDocSchema.findOne,
    req.requestId,
    {
      slug: slug
    },
    (err, doc) => {
      if (err) {
        logger.error(req.requestId, ns, '[getDocWithVersion]:err', err)
        cb(err)
      } else {
        doc = doc.toObject()

        let ver = doc.versions.filter(ver => {
          return ver.versionLabel === version
        })[0]

        if (ver) {
          doc.versionLabel = ver.versionLabel
          doc.external = ver.external
          doc.externalUrl = version.externalUrl;
          doc.pdfUrl = version.pdfUrl;
          doc.htmlUrl = version.htmlUrl;
        } else {
          let last = doc.versions.pop()
          doc.versionLabel = last.versionLabel
          doc.external = last.external
          doc.externalUrl = version.externalUrl;
          doc.pdfUrl = last.pdfUrl;
          doc.htmlUrl = last.htmlUrl;
        }

        cb(null, doc)
      }
    }
  )
}



export default LegalDocModel