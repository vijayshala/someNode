import { IPOfficeSubscriptionTrackSchema } from '../server/ip-office/models/ipoffice-subscription-track.model' ;
import rfutil from '../modules/remoteFileUtility';
import config from '../config';
import Utils from '../common/Utils';
import logger from 'applogger';
import cst from '../modules/constants';
import js2xmlparser from 'js2xmlparser';
import sysconfSchema from '../schemas/sysconfigSchema';
import dbWp from 'dbwrapper';
import taskqueue from '../modules/taskqueue';

function createSubscriptionTempFilename() {
  return cst.IPOfficeSubscriptionTempFolder + '/' + Utils.generateRandomString(10) + (new Date())
    .getTime()
    .toString()
}

async function createMiddlePart(req, stream) {
  let funcName = '[CreateMiddlePart] '
  let exeObj = IPOfficeSubscriptionTrackSchema.find();
  exeObj = exeObj.sort({_id:1});
  let cursor = exeObj.cursor();
  for (let subscriptionObj = await cursor.next(); subscriptionObj != null; subscriptionObj = await cursor.next()) {
    let subscriptionjson = subscriptionObj.toIPOXML_JSON()

    delete subscriptionjson._id;
    let xmlcontent = js2xmlparser.parse('Subscription', subscriptionjson, {
      'declaration': {
        'include': false
      }
    });
    stream.write(xmlcontent)
  }
  logger.info(req.requestId, funcName + 'All subscription object are dumped to xml already');
  return;
}

async function saveToXml_Async(req, data) {
  let funcName = '[saveToXml_Async] ';
  //TODO; Open a temp file in GCS and write header part
  let fileOper = new rfutil.GCSFileOper(config.IPOFFICE && config.IPOFFICE.GCS_SUBSCRIPTION_BUCKET, config.IPOFFICE && config.IPOFFICE.GCS_CRED);
  let filename = createSubscriptionTempFilename()
  logger.info(req.requestId, funcName + 'Will dump xml to the file ' + filename);
  let wstream = fileOper.createWriteStream(filename, {
    metadata: {
      contentType: 'text/xml'
    }
  });

  let wstreamEndPromise = new Promise((resolve, reject) => {
    wstream.on('finish', () => {
      return resolve();
    })

    wstream.on('error', (err) => {
      return reject(err);
    })
  });

  const chooseHeader = () =>  {
    if (config.environment == 'production') {
      return cst.IPOfficeSubscription80Header;
    } else {
      return cst.IPOfficeSubscription70Header;
    }
  }

  const chooseFileName = () => {
    if (config.environment == 'production') {
      return cst.IPOfficeSubscription80Filename;
    } else {
      return cst.IPOfficeSubscription70Filename;
    }
  }

  wstream.write(chooseHeader());

  //TODO: Generate xml middle parts
  await createMiddlePart(req, wstream);

  //TODO: Write XML footer
  wstream.write(cst.IPOfficeSubscriptionFooter);
  wstream.end();

  try {
    await wstreamEndPromise;
    //TODO: Move the temp file to subscription.xml
    await new Promise((resolve, reject) => {
      const SUBSCIPTION_FILE_NAME = chooseFileName();
      fileOper.moveFile(filename, SUBSCIPTION_FILE_NAME, (err) => {
        if (err) {
          logger.warn(req.requestId, funcName + 'Move file from ' + filename + ' to ' + SUBSCIPTION_FILE_NAME + ' failed!');
          reject(err);
        } else {
          logger.info(req.requestId, funcName + 'The subscription xml file ' + SUBSCIPTION_FILE_NAME + ' created successfully')
          resolve(null);
        }
      });
    });
  } catch (err) {
    await new Promise((resolve, reject) => {
      fileOper.deleteFile(filename, (err, result) => {
        resolve(null);
      })
    });
    throw err;
  }

}

async function saveToXMLTaskEntry(req, data) {
  let funcName = '[saveToXMLTaskEntry]';
  let throwError = false;
  try {
    await saveToXml_Async(req, data);
  } catch (err) {
    throwError = true;
    logger.error(req.requestId, funcName + 'When save to xml async, error happens', err.message, err.statck);
  } finally {
    if (await shouldTriggerAnotherTask(req, throwError, data)) {
      logger.info(req.requestId, "Trigger a task to save xml again!")
      if (throwError) {
        taskqueue.launchDefer(req, "saveIpOfficeSubscriptionToXMLHandle", {}, {
          defferOption: true,
          delay: 300,
          attempts: 1
        });
      } else {
        taskqueue.launchDefer(req, "saveIpOfficeSubscriptionToXMLHandle", {}, {
          defferOption: true,
          attempts: 1
        });
      }
    } else {
      logger.info(req.requestId, "Don't trigger any task!")
    }
  }
}

async function shouldTriggerAnotherTask(req, throwError, data) {
  let funcName = '[shouldTriggerAnotherTask] ';
  let remainTasks = 0
  if (throwError) {
    //Just change lock time
    remainTasks = 1;
  } else {
    remainTasks = await new Promise((resolve, reject) => {
      dbWp.execute(sysconfSchema, sysconfSchema.findOneAndUpdate, req.requestId, {
        "name": cst.SYSCFG_IPOFFICE_SUBSCRIPTION_TRIGGERED_TIMES
      }, {
        "$inc": {
          "value": -1
        }
      }, {
        new: true
      }, (err, result) => {
        if (err || result.value <= 0) {
          return resolve(0);
        } else {
          return resolve(result.value)
        }
      });
    });
  }
  if (!remainTasks) {
    logger.info(req.requestId, funcName + 'There is no more task need triggering! Make status as idle flag!');
    await new Promise((resolve, reject) => {
      dbWp.execute(sysconfSchema, sysconfSchema.findOneAndUpdate, req.requestId, {
        "name": cst.SYSCFG_IPOFFICE_SUBSCRIPTION_STATUS,
        "value.status": cst.SYSCFG_IPOFFICE_SUBSCRIPTION_INPROCESS
      }, {
        "value.status": cst.SYSCFG_IPOFFICE_SUBSCRIPTION_IDLE
      }, (err, result) => {
        if (err || !result) {
          return resolve(false);
        } else {
          return resolve(true)
        }
      });
    });
    //Don't trigger a task.
    return false;
  } else {
    await new Promise((resolve, reject) => {
      dbWp.execute(sysconfSchema, sysconfSchema.findOneAndUpdate, req.requestId, {
        "name": cst.SYSCFG_IPOFFICE_SUBSCRIPTION_STATUS
      }, {
        "value": {
          'status': cst.SYSCFG_IPOFFICE_SUBSCRIPTION_INPROCESS,
          'lockedtm': (new Date())
        }
      }, (err, result) => {
        if (err || !result) {
          return resolve(false);
        } else {
          return resolve(true)
        }
      });
    });
    await new Promise((resolve, reject) => {
      dbWp.execute(sysconfSchema, sysconfSchema.findAndModify, req.requestId, {
        "name": cst.SYSCFG_IPOFFICE_SUBSCRIPTION_TRIGGERED_TIMES
      }, {
        "value": 1
      }, {
        new: true
      }, (err, result) => {
        if (err || result.value <= 0) {
          return resolve(0);
        } else {
          return resolve(result.value)
        }
      });
    });
    //Trigger a task.
    return true;
  }
}

exports.saveIpOfficeSubscriptionToXMLHandle = function(req, data, cb) {
  let funcName = '[saveIpOfficeSubscriptionToXMLHandle] ';
  logger.info(funcName, 'begin');
  saveToXMLTaskEntry(req, data).then((result) => {
    logger.info(funcName, 'finished', result);
    if (cb) {
      process.nextTick(() => {
        return cb(null, result);
      });
    }
  }).catch((err) => {
    logger.error(req.requestId, funcName + 'Error happens when save subscription to xml', err, err.statck);
    if (cb) {
      process.nextTick(() => {
        return cb(err);
      });
    }
  });
};

async function addASubscriptionToTackTable_async(req, data) {
  let funcName = '[addASubscriptionToTackTable_async] ';
  let shouldTriggerTask = await new Promise((resolve, reject) => {
    dbWp.execute(sysconfSchema, sysconfSchema.findOneAndUpdate, req.requestId, {
      "name": cst.SYSCFG_IPOFFICE_SUBSCRIPTION_STATUS,
      '$or': [
        {
          'value.status': cst.SYSCFG_IPOFFICE_SUBSCRIPTION_IDLE
        }, {
          'value.lockedtm': {
            '$lt': new Date((new Date()).getTime() - cst.SYSCFG_IPOFFICE_SUBSCRIPTION_LOCKTM)
          }
        }
      ]
    }, {
      "value": {
        'status': cst.SYSCFG_IPOFFICE_SUBSCRIPTION_INPROCESS,
        'lockedtm': (new Date())
      }
    }, {
      upsert: true,
      new: true
    }, (err, result) => {
      if (err || !result) {
        return resolve(false);
      } else {
        return resolve(true)
      }
    });
  });
  if (shouldTriggerTask) {
    logger.info(req.requestId, funcName + 'Will trigger a task');
    await new Promise((resolve, reject) => {
      dbWp.execute(sysconfSchema, sysconfSchema.findOneAndUpdate, req.requestId, {
        "name": cst.SYSCFG_IPOFFICE_SUBSCRIPTION_TRIGGERED_TIMES
      }, {
        "value": 1
      }, {
        new: true,
        upsert: true
      }, (err, result) => {
        if (err || result.value <= 0) {
          return resolve(0);
        } else {
          return resolve(result.value)
        }
      });
    });
    logger.info(req.requestId, "Trigger a task to save xml!")
    taskqueue.launchDefer(req, "saveIpOfficeSubscriptionToXMLHandle", {}, {
      defferOption: true,
      attempts: 1
    });
  } else {
    await new Promise((resolve, reject) => {
      dbWp.execute(sysconfSchema, sysconfSchema.findOneAndUpdate, req.requestId, {
        "name": cst.SYSCFG_IPOFFICE_SUBSCRIPTION_TRIGGERED_TIMES
      }, {
        '$inc': {
          "value": 1
        }
      }, {
        new: true
      }, (err, result) => {
        if (err || result.value <= 0) {
          return resolve(0);
        } else {
          return resolve(result.value)
        }
      });
    });
  }

  return;
}

exports.addASubscriptionToTackTable = function (req, data, cb) {
  let funcName = '[addASubscriptionToTackTable] ';
  addASubscriptionToTackTable_async(req, data).then((result) => {
    if (cb) {
      process.nextTick(() => {
        return cb(null, result);
      });
    }
  }).catch((err) => {
    logger.error(req.requestId, funcName + 'Error happens', err, err.statck);
    if (cb) {
      process.nextTick(() => {
        return cb(err, result);
      });
    }
  });
}

exports.asyncGetSubscriptionId = function (req, options) {
  return new Promise((resolve, reject) => {
    exports.getSubscriptionId(req, options, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data)
      }
    })
  })
}

exports.getSubscriptionId = function (req, data, cb) {
  let funcName = '[getSubscriptionId] ';
  dbWp.execute(sysconfSchema, sysconfSchema.findOneAndUpdate, req.requestId, {
    "name": cst.SYSCFG_IPOFFICE_SUBSCRIPTIONID_REC
  }, {
    '$inc': {
      'value.steps': 1
    },
    '$setOnInsert': {
      'value.initval': cst.SYSCFG_IPOFFICE_SUBSCRIPTIONID_INITVAL
    }
  }, {
    upsert: true,
    new: true
  }, (err, result) => {
    if (err) {
      logger.error(funcName + 'Can not get subscription ID.', err.message, err.statck);
      return cb(err);
    } else {
      return cb(null, {
        subscriptionId: result.value.initval + result.value.steps
      });
    }
  });
}
