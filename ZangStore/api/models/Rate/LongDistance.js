import cst from '../../../modules/constants';
import esErr from '../../../modules/errors';
import rfutil from '../../../modules/remoteFileUtility';
import csvstrm from 'csv-stream';
import taskqueue from '../../../modules/taskqueue';
import rateLongDistance from '../../../schemas/longDistanceRateSchema';
import logger from 'applogger';


var config = require('../../../config')
import asynclib from 'async'
class LongDistance{
  async isValidProvider(req, provider){
    //Current phrase we use the hard coded way to check, next will use database to check!!!    
    for (let item of cst.RATE_LONGDISTC_PROVIDERS){
      if (item.type === provider){
        return item;
      }
    }
    return null;
  }

  calCustomPrice(oriVal, ratio){
    let oriValf = Math.round((parseFloat(oriVal) ? parseFloat(oriVal): 0) * 100);    
    let retValf = Math.round(oriValf * ratio);
    if (retValf < 1){
      retValf = 1
    }
    if (retValf <= oriValf){
      retValf += 1
    }
    return retValf / 100;
  }

  async importFromGcsImpl_async (req, data){
    let funcName = '[LongDistance.importFromGcsImpl_async] ';
    let remoteFile = new  rfutil.GCSFileOper(config.AVAYASTORE_GCS_BUCKET, config.AVAYASTORE_GCS_CRED);      
    let stream = remoteFile.createReadStream(data.file);
    let csvStream = csvstrm.createStream();
    let batchArray = [];
    let batchSize = 100;
    let batchCnt = 0;
    let created = new Date();
    data.created = created;
    let dumpPromises = [];
    let parseError = null;
    let self = this;
    logger.info(req.requestId, funcName + `Whill dump file ${data.file}`);
    return new Promise((resolveot, rejectot)=>{
      stream.on('error', (err)=>{        
        logger.warn(req.requestId, funcName + `Error happen when access file ${data.file} from gcs`, err.message);
        return rejectot(new esErr.ESErrors(esErr.rateLongDistImportFailed, `Failed to read file ${data.file}`));   
      })   
      .on('end', ()=>{
        if (batchArray.length > 0){
          let promise = new Promise((resolve, reject) =>{                      
            rateLongDistance.insertMany(batchArray, (err, result)=>{
              if (err){
                logger.error(req.requestId, funcName + 'When dump data to database, error happens', err);                  
                return reject(new esErr.ESErrors(esErr.rateLongDistImportFailed, `Failed to access the file`));
              }
              else{                
                return resolve();
              }
            })
          });
          dumpPromises.push(promise);
        }
        Promise.all(dumpPromises)
          .then(()=>{
            if (!parseError){
              logger.info(req.requestId, funcName + `All data in csv file ${data.file} is dumpped!`);            
              return resolveot();
            }
            else{
              logger.warn(req.requestId, funcName + `All data in csv file ${data.file} is dumpped with error! All record will be removed soon!`, parseError);
              return rejectot(parseError);
            }
          })
          .catch((err)=>{
            logger.error(req.requestId, funcName + `When dump file ${data.file} into database , error happens`, err);
            return rejectot(err);
          })
      })  
      .pipe(csvStream)
        .on('error', (err)=>{
          logger.warn(req.requestId, funcName + `Error happen when parse csv file ${data.file}`, err.message);
          parseError = new esErr.ESErrors(esErr.rateLongDistImportFailed, `Failed to parse the file`); 
            
        })
        .on('data', (csvdata)=>{          
          if (parseError){
            return;
          }
          //country_name,prefix,inter,intra,default,first_inc,second_inc
          csvdata['provider'] = data.provider;
          csvdata['countryName'] = csvdata['country_name'];
          csvdata['firstInc'] = csvdata['first_inc'];
          csvdata['secondInc'] = csvdata['second_inc'];
          csvdata['from'] = data.providerData.from;
          csvdata['created'] = created;
          csvdata['status'] = cst.RATE_LONGDISTC_IMPORT_UNREADY_STATUS;
          csvdata['cdefault'] = self.calCustomPrice(csvdata['default'], data.providerData.cost_ratio);
          csvdata['cfirstInc'] = self.calCustomPrice(csvdata['first_inc'], data.providerData.cost_ratio);
          csvdata['csecondInc'] = self.calCustomPrice(csvdata['second_inc'], data.providerData.cost_ratio);
          csvdata['cinter'] = self.calCustomPrice(csvdata['inter'], data.providerData.cost_ratio);
          csvdata['cintra'] = self.calCustomPrice(csvdata['intra'], data.providerData.cost_ratio);


          if (++batchCnt < batchSize){
            batchArray.push(csvdata);           
          }
          else{
            let promise = new Promise((resolve, reject) =>{                      
              rateLongDistance.insertMany(batchArray, (err, result)=>{
                if (err){
                  logger.error(req.requestId, funcName + 'When dump data to database, error happens', err);   
                  parseError = new esErr.ESErrors(esErr.rateLongDistImportFailed, `Failed to dump data to database`);
                  return resolve();
                }
                else{
                  return resolve();
                }
              })
            });
            dumpPromises.push(promise);
            batchArray = [csvdata];
            batchCnt = 0;            
          }
        })      
    });
  }

  async switchToNewRates(req, data){    
    let funcName = '[LongDistance.switchToNewRates] ';
    let promises = [];
    //Step1. Remove ready data
    promises.push(new Promise((resolve, reject) => {  
      rateLongDistance.remove({'provider': data.provider, 'created': {'$lt': data.created}},
      (err, result) =>{
        if (err){
          logger.error(req.requestId, funcName + `Remove records old provider ${data.provider} before time ${data.created} failed!`, err.message, err.stack);          
        }
        else{
          logger.info(req.requestId, funcName + `Remove records old provider ${data.provider} before time ${data.created} successfully!`);
        }
        return resolve();
      });
    }));
    //Step2. Change the dumpped data to ready
    promises.push(new Promise((resolve, reject) => {      
      rateLongDistance.update({'provider': data.provider, 'created': data.created},
      {$set: {status: cst.RATE_LONGDISTC_IMPORT_READY_STATUS}},
      {'multi': true},
      (err, result) =>{
        if (err){
          logger.error(req.requestId, funcName + `Update records provider ${data.provider} at time ${data.created} to ready failed!`, err.message, err.stack);          
        }
        else{
          logger.info(req.requestId, funcName + `Update records provider ${data.provider} at time ${data.created} to ready successfully!`);
        }
        return resolve();
      });
    }));

    await Promise.all(promises);
    
  }

  async removeRecordsbyCreatedAndProvider(req, data){
    let funcName = '[LongDistance.removeRecordsbyCreatedAndProvider] ';
    return new Promise((resolve, reject) => {
      rateLongDistance.remove({'provider': data.provider, 'created':  data.created},       
        (err, result) =>{
          if (err){
            logger.error(req.requestId, funcName + `Remove records old provider ${data.provider} before time ${data.created} failed!`, err.message, err.stack);          
          }
          else{
            logger.info(req.requestId, funcName + `Remove records old provider ${data.provider} before time ${data.created} successfully!`);
          }
          return resolve();
        });
      });
  }

  async importFromGcs_async (req, data){
    let funcName = '[LongDistance.importFromGcs_async] '
    let providerData = await this.isValidProvider(req, data.provider);
    if (providerData){      
      data.providerData = providerData
      
      return new Promise((resolve, reject) => {
        taskqueue.launchDefer(
          req, 
          'longDistanceLoadFromGCSDefer',
          data,
          {
            defferOption : true,
            backoff_seconds : 300,
            attempts : 3,
            callback: (err) =>{
              if (err){
                logger.error(req.requestId, funcName + 'Set the task of longDistanceLoadFromGCSDefer failed.', data, err.message);
                return reject(new esErr.ESErrors(esErr.rateLongDistImportFailed, `Create task of longDistanceLoadFromGCSDefer failed`));              
              }
              else{
                logger.info(req.requestId, funcName + 'Set the task of longDistanceLoadFromGCSDefer successfully.');
                return resolve(null);
              }
            }
        });
      });
    }
    else{
      logger.warn(req.requestId, `${funcName} The provider ${data.provider} is invalid!`);
      throw(new esErr.ESErrors(esErr.rateLongDistInvalidProd, `The provider ${data.provider} is invalid`));
    }
  }

  importFromGcs(req, data, cb){
    this.importFromGcs_async(req, data).then(()=>{
      process.nextTick(() =>{
        return cb(null);
      })
    })
    .catch((err) => {
      process.nextTick(() =>{
        return cb(err);
      })
    })
  }
  
  async getOrderFromSort(req, sort){
    let order = [];
    let orderset = new Set()
    if (sort){    
      let sorts = sort.split(',');
      for (let sortItem of sorts){
        let isDesc = false;
        if (sortItem.startsWith('-')){
          sortItem = sortItem.substring(1);
          isDesc = true;
        }
        if (rateLongDistance.schema.path(sortItem)){
          if (!(sortItem in orderset)){
            if (isDesc){
              order.push([sortItem, -1])
            }
            else{
              order.push([sortItem, 1])
            }
          }        
        }        
        orderset.add(sortItem);
      }
    }
    if (order.length <= 0){
      order = [['countryName', 1], ['prefix', 1]];
    }
    return order;
  }

  async search_async(req, data){
    let funcName = '[LongDistance.search_async]';
    let order = await this.getOrderFromSort(req, data.sort);
    logger.info(req.requestId, funcName + 'The query begin with data', data, order);
    return new Promise((resolve, reject) => {
      if (!data.project){
        rateLongDistance.find(data.query).sort(order).skip(data.limit.page * data.limit.size).limit(data.limit.size + 1).exec((err, results) => {
          if (err){
            logger.err(req.requestId, funcName + 'When query, error happend!', err.message, err.stack);
            return resolve([]);
          }
          else{
            return resolve(results)
          }
        })
      }
      else{
        rateLongDistance.find(data.query, data.project).sort(order).skip(data.limit.page * data.limit.size).limit(data.limit.size + 1).exec((err, results) => {
          if (err){
            logger.err(req.requestId, funcName + 'When query, error happend!', err.message, err.stack);
            return resolve([]);
          }
          else{
            return resolve(results)
          }
        })
      }
    })
  }

  search(req, data, cb){
    let funcName = '[LongDistance.search] ';
    this.search_async(req, data).then((results)=>{
      process.nextTick(()=>{
        return cb(null, results);
      })
    })
    .catch((err)=>{
      process.nextTick(()=>{
        return cb(err);
      })
    })
  }
}


async function longDistanceLoadFromGCSDefer_async(req, data){
  let funcName = '[longDistanceLoadFromGCSDefer_async] '
  let lgDist = new LongDistance();
  let providerData = await lgDist.isValidProvider(req, data.provider);
  if (providerData){
    logger.info(req.requestId, funcName + 'Start the work of dumpping data from gcs to database!');
    data.providerData = providerData;
    try{
      await lgDist.importFromGcsImpl_async(req, data);      
    }
    catch(err){
      logger.error(req.requestId, funcName + `When dump gcs to database error happens!`, err.message, err.stack);
      await lgDist.removeRecordsbyCreatedAndProvider(req, data);
      logger.warn(req.requestId, funcName + 'Remove the new record successfully!');
      return;
    }
    await lgDist.switchToNewRates(req, data);
    logger.info(req.requestId, funcName + 'Finish the work of dumpping data from gcs to database!');
  }
  else{
    logger.warn(req.requestId, `${funcName} The provider ${data.provider} is invalid!`);
    return
  }
}

function longDistanceLoadFromGCSDefer(req, data, cb){
  longDistanceLoadFromGCSDefer_async(req, data).then(() =>{
    process.nextTick(() => {
      return cb();
    })
  })
  .catch((err) =>{
    process.nextTick(() => {
      return cb(err);
    })
  });
}

taskqueue.registerDeferHandle('longDistanceLoadFromGCSDefer', longDistanceLoadFromGCSDefer)

module.exports = {
  LongDistance: LongDistance
}