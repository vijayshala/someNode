import esErr from '../../modules/errors';
import cst from '../../modules/constants';
import logger from 'applogger';
import taskrunner from '../../modules/taskqueue';
import request from 'request';
import utils from '../../modules/zgutilities';
import TaskTrack from '../../schemas/tasktrackSchema';

exports.run = function (req, res, next){
  let funcName = 'TaskController.run'  

  if (req.auth.sysname != cst.AccountsSystemName){
		logger.warn(req.requestId, funcName + 'The caller system must be accounts!, but now is ' + req.auth.sysname);
		return res.status(cst.HttpNoPermissionStatus).json(new esErr.ESErrors(esErr.AuthorizeErrorPermission));
  }	
  
  let taskTrackObj = new TaskTrack({
    liveRec: new Date(),
    status: ''
  });
  taskTrackObj.save((err, taskTrackObjNew) => {
    let options = {
      url: utils.getTaskProxyUrl(),
      method: 'POST',
      headers: {
        'authorization': req.headers.authorization || '',
        'Content-Type': 'application/json',
        'taskTrackId': taskTrackObjNew._id.toString()
      },
      body: JSON.stringify(req.body),    
    };
    logger.info(req.requestId, funcName + 'Proxy the request to the url: ' + options.url + ' The task track id ' + taskTrackObjNew._id.toString())
    request(options, (e, r, body)=>{
      if (e){
        logger.warn(req.requestId, funcName +'Try to send out the request happen error', e.message, e.stack);
        return res.status(cst.HttpErrorTaskQueueNeverTry).json(new esErr.ESErrors(esErr.proxyTaskHappenError));
      }
      return res.status(r.statusCode).json({'taskTrackId': taskTrackObjNew._id.toString()});    
    })
  });  
}

exports.runStatus = function(req, res, next){
  let taskTrackId = req.params.id;
  if (req.auth.sysname != cst.AccountsSystemName){
		logger.warn(req.requestId, functionName + 'The caller system must be accounts!, but now is ' + req.auth.sysname);
		return res.status(cst.HttpNoPermissionStatus).json(new esErr.ESErrors(esErr.AuthorizeErrorPermission));
  }	
  TaskTrack.findById(taskTrackId, (err, taskTrackObj) => {
    if (taskTrackObj && taskTrackObj.status){
      if (taskTrackObj.status == esErr.SysAlreadyRegisterDeferError || 
        taskTrackObj.status == esErr.TaskNoRetryError ||
        taskTrackObj.status == esErr.TaskqueueEndBeforeTimout){
          TaskTrack.findByIdAndRemove(taskTrackId, (err, result) => {               
            return res.status(cst.HttpErrorTaskQueueNeverTry).json({code: taskTrackObj.status});
          });
        }
      else{
        TaskTrack.findByIdAndRemove(taskTrackId, (err, result) => {
          return res.status(cst.HttpErrorStatus).json({});
        });
      }
    }
    else{
      if (taskTrackObj && (new Date()).getTime() - taskTrackObj.liveRec.getTime() > 20000){
        TaskTrack.findByIdAndRemove(taskTrackId, (err, result) => {
          return res.status(cst.HttpErrorStatus).json({});
        });
      }
      else if (taskTrackObj && !taskTrackObj.status){
        return res.status(cst.HttpSuccessStatus).json({status: 'processing'});        
      }
      else{
        return res.status(cst.HttpSuccessStatus).json({status: 'success'});
      }
    }
  });
}

exports.run_proxied = function (req, res, next){
  let functionName = '[TaskController.run_proxied] ';
  logger.info(req.requestId, functionName + 'A task hander come')
	if (req.auth.sysname != cst.AccountsSystemName){
    logger.warn(req.requestId, functionName + 'The caller system must be accounts!, but now is ' + req.auth.sysname);
    TaskTrack.findByIdAndRemove(taskTrackId, (err, result) => {               
      return res.status(cst.HttpNoPermissionStatus).json(new esErr.ESErrors(esErr.AuthorizeErrorPermission));
    });		
  }	
  let taskTrackId = req.headers['tasktrackid'];
  logger.info(req.requestId, functionName + 'The task track id ' + taskTrackId);
  let liveTimer = setInterval(() => {    
    TaskTrack.findById(taskTrackId, (err, taskTrackObj) => {
      if (taskTrackObj){
        taskTrackObj.liveRec = new Date();
        taskTrackObj.save();
      }
    });
  }, 5000);
	taskrunner.runner(req, req.body, (err, result)=>{    
    clearInterval(liveTimer);
		if (err){
      logger.warn(req.requestId, 'Task queue runner happen error', err);
      TaskTrack.findById(taskTrackId, (err1, taskTrackObj) => {
        if(taskTrackObj){
          taskTrackObj.status = 'task.error';
          if (err.code && 
            err.code == esErr.SysAlreadyRegisterDeferError || 
            err.code == esErr.TaskNoRetryError ||
            err.code == esErr.TaskqueueEndBeforeTimout){
              taskTrackObj.status = err.code
          }
          else{
            taskTrackObj.status = esErr.TaskNeedRetryError;
          }
          console.log(req.id, functionName + `Save taskTrackObj with status=$(taskTrackObj.status).`)
          taskTrackObj.save((err, result) => {           
          });
        }
      });           
    }
    else{
      logger.info(req.requestId, 'Task queue runner finish successfuly');
      TaskTrack.findByIdAndRemove(taskTrackId, (err, result) => {               
      });
    }
  
  });	
  
  return res.status(cst.HttpSuccessStatus).json({status: 'success'});
  
}