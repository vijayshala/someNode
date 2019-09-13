'use strict';

import js2xmlparser from 'js2xmlparser';
import libxml from 'libxmljs';

import { GCSFileOper } from '../modules/remoteFileUtility';
import config from '../config';
import Utils from '../common/Utils';
import cst from '../modules/constants';
import sysconfSchema from '../schemas/sysconfigSchema';
import logger from 'applogger';
import dbWp from 'dbwrapper';

const ns = '[IPOfficeCustomerModel]';

let IPOfficeCustomerModel = {};

/**
 * Save cutomer to GCS.
 *
 * @method IPOfficeCustomerModel#save
 * @param {Request}  [req]      The HTTP request object which calls this function
 * @param {Object}   [content]  The data will be saved into GCS file
 * @param {String}   [toFile]   File name in GCS
 * @param {Function} [callback] Callback function.
 * @example
*/

IPOfficeCustomerModel.save = (req, content, toFile, isContainer, callback) => {
  const fn = '[save]';
  logger.info(req.requestId, ns, fn)

  try {
    // convert content to XML
    const xml = js2xmlparser.parse('configaudit', content, {
      typeHandlers: {
        '[object Date]': (d) => d.toISOString()
      },
      wrapHandlers: {
        users: () => 'user',
        groups: () => 'group',
        members: () => 'member',
      }
    });
    logger.info(req.requestId, ns, fn, 'content converted to XML', xml);

    let bucket, bucketPath = '';
    if (isContainer)  {
      bucket = config.IPOFFICE && config.IPOFFICE.GCS_CUSTOMER_BUCKET_CONTAINER;
      bucketPath = config.IPOFFICE && config.IPOFFICE.GCS_CUSTOMER_PATH_CONTAINER;
    } else {
      bucket = config.IPOFFICE && config.IPOFFICE.GCS_CUSTOMER_BUCKET_VM;
      bucketPath = config.IPOFFICE && config.IPOFFICE.GCS_CUSTOMER_PATH_VM;
    }

    // write temporary file
    if (bucketPath && toFile.substr(0, bucketPath.length + 1) !== bucketPath + '/') {
      toFile = bucketPath + '/' + toFile;
    }
    const randomFileName = (bucketPath ? bucketPath + '/' : '') + 'tmp-ipoffice-customer-' + Utils.generateRandomString(10).toLowerCase();
    const GCS_BUCKET = bucket;
    logger.info(req.requestId, ns, fn, 'write temp file', 'gs://' + GCS_BUCKET + '/' + randomFileName);
    const remoteFile = new GCSFileOper(GCS_BUCKET, config.IPOFFICE && config.IPOFFICE.GCS_CRED);
    const fw = remoteFile.createWriteStream(randomFileName, {
      metadata: {
        contentType: 'text/xml',
      }
    });
    fw.on('drain', (err) => {
      if (!err) {
        err = new Error('write stream drained prematurely');
      }
      logger.error(req.requestId, ns, fn, 'write stream drain', err);
      callback(err);
    });
    fw.on('close', (err) => {
      if (!err) {
        err = new Error('write stream closed prematurely');
      }
      logger.error(req.requestId, ns, fn, 'write stream close', err);
      callback(err);
    });
    fw.on('error', (err) => {
      logger.error(req.requestId, ns, fn, 'write stream error', err);
      callback(err);
    });
    fw.on('finish', (err) => {
      // move temporary file to target file
      logger.info(req.requestId, ns, fn, 'write temp file finish, try move to', toFile);
      remoteFile.moveFile(randomFileName, toFile, (err, destinationFile, apiResponse) => {
        if (err) {
          logger.error(req.requestId, ns, fn, 'failed on move temp file', err);
          callback(err);
        } else {
          logger.info(req.requestId, ns, fn, 'file moved successfully');
          callback(null, true);
        }
      });
    });

    fw.write(xml);
    fw.end();

    // dbWp.execute(sysconfSchema, sysconfSchema.findOne,
    //   req.requestId, { name: (config.IPOFFICE ? cst.SYSCFG_IPOFFICE_SUBSCRIPTION70_CUSTOMER_XSD : cst.SYSCFG_IPOFFICE_SUBSCRIPTION_CUSTOMER_XSD) },
    //   (err, result) => {
    //     if (err) {
    //       logger.error(req.requestId, ns, fn, 'failed to read XSD', err);
    //       callback(err);
    //       return;
    //     }
    //     if (!result || !result.value) {
    //       let err = new Error('Cannot find customer XSD');
    //       logger.error(req.requestId, ns, fn, 'cannot find XSD', err);
    //       callback(err);
    //       return;
    //     }

    //     // get libxml docs
    //     const xmlDoc = libxml.parseXml(xml);
    //     const xsdDoc = libxml.parseXml(result.value);

    //     // validate the XML file
    //     if (!xmlDoc.validate(xsdDoc)) {
    //       logger.error(req.requestId, ns, fn, 'customer XML is invalid', JSON.stringify(xmlDoc.validationErrors));
    //       logger.info(req.requestId, ns, fn, 'content converted to XML', xml);
    //       let err = new Error('Invalid customer XML file');
    //       err.validationErrors = xmlDoc.validationErrors;
    //       callback(err);
    //       return;
    //     }

        
    //   });
  } catch (err) {
    logger.error(req.requestId, ns, fn, 'other', err);
    callback(err);
    return;
  }
};

export default IPOfficeCustomerModel;
