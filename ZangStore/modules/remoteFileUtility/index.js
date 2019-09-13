import logger from 'applogger';
import storagelib from '@google-cloud/storage';

class GCSFileOper {
  constructor(bucketname, credential) {
    let options = {
      projectId: credential.project_id,
      credentials: credential //For service account
    };
    this.storage = storagelib(options);
    this.bucket = this.storage.bucket(bucketname);
  }

  createWriteStream(filename, options){
    let file = this.bucket.file(filename)
    return file.createWriteStream(options);
  }

  createReadStream(filename, options){
    let file = this.bucket.file(filename)
    return file.createReadStream(options);
  }

  deleteFile(filename, cb){
    let file = this.bucket.file(filename)
    file.delete((err, apiResponse) => {
      cb(err, apiResponse);
    });
  }

  clearFolder(req, folder, cb){
    let funcName = '[clearFolder] '
    this.bucket.getFiles({prefix: folder}, (err, files)=>{
      if (err){
        logger.warn(req.requestId, `${funcName} failed to get file list from folder ${folder}`, err)
      }
      let counter = 0;
      if (files.length == 0){
        return cb();
      }
      for (let fileIdx in files){
        let fileItem = files[fileIdx];
        logger.info(req.requestId, `${funcName} will delete file ${fileItem.name}`)
        fileItem.delete((err)=>{
          if (err){
            logger.warn(req.requestId, `${funcName} failed to delete file list from folder ${fileItem.name}`, err)
          }
          counter++;
          if (counter == files.length){
            return cb()
          }
        })
      }
    })
  }

  moveFile(oriFilename, newFilename, cb){
    let file = this.bucket.file(oriFilename);
    file.move(newFilename, (err, destinationFile, apiResponse) => {
      return cb(err, destinationFile, apiResponse)
    });
  }
}

exports.GCSFileOper = GCSFileOper;
