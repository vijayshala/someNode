import logger from 'applogger';
import util from '../zgutilities';
import request from 'request';
import config from '../../config'
import esErr from '../errors';
import cst from '../constants';


global.deferHandleDict = {};

exports.registerDeferHandle = function(keyString, funcObj){
  setTimeout(function(){
    if (keyString in global.deferHandleDict){
      logger.warn('sysloading', 'registerDeferHandle happen already registered error for keyString=' + keyString);
    }
    else{
      logger.info('sysloading', 'registerDeferHandle load defer with keyString=' + keyString + ' successfully!')
      global.deferHandleDict[keyString] = funcObj;
    }
  });
};

exports.getDeferHandleByKeyString = function(keyString){
  if (keyString in global.deferHandleDict){
    return global.deferHandleDict[keyString];
  }
  logger.warn('sysloading', 'getDeferHandleByKeyString not existed');
  throw new esErr.ESErrors(esErr.SysAlreadyRegisterDeferError);
};


exports.TimerWayLauchDefer = function(src, keyString){
  try{
    logger.info('Begin starting defer with keyString = ' + keyString);
    let funcObj = this.getDeferHandleByKeyString(keyString);
    var tempoptions = arguments[arguments.length - 1];
    logger.info('payload', tempoptions)
    var parametersFuncObj = Array.prototype.splice.call(arguments, 2);
    logger.info('funcobj', parametersFuncObj)

    var options = {delay: 0,
                   attempts: 0,
                   backoff_seconds: 0,
                   callback: null};
    if (Object.prototype.toString.call(tempoptions) == '[object Object]' &&
        tempoptions.defferOption){
      //Remove the last element from parameterFuncObj
      parametersFuncObj = Array.prototype.splice.call(parametersFuncObj, 0, parametersFuncObj.length - 1);
      options = {
          delay: tempoptions.delay || options.delay,
          attempts: tempoptions.attempts || options.attempts,
          backoff_seconds: tempoptions.backoff_seconds || options.backoff_seconds,
          callback: tempoptions.callback || options.callback,
        };
    }

    parametersFuncObj[0]._taskoptions = {attempts: 0, attempt_times: 0};
    Array.prototype.splice.call(parametersFuncObj, 0, 0, {requestId: src.requestId});
    let tmoutObj = setTimeout(function(inParametersFuncObj){
      //let parametersFuncObjTemp = JSON.parse(inParametersFuncObj);
      parametersFuncObj.push(function(){});
      funcObj.apply(funcObj, parametersFuncObj);
    }, options.delay * 1000, parametersFuncObj);

    let deferOut = {
        deferOutObj: tmoutObj,
        aType: cst.deferOutTimeout
    };
    if (options.callback){
      options.callback(null, tmoutObj);
    }
  }
  catch(err){
    logger.warn(src.requestId, 'Start timmer defer with keyString = ' + keyString + ' failed!', err);
  }
};

exports.GAELauchDefer = function(src, keyString){
	var functionName = "[GAELauchDefer] ";
	var callbackUrl = "http://avayastorelocal.onesna.com:3000/api/taskhandle/run";
	var putTaskUrl = config.urls.identityProviderURL + "/api/1.0/remotetask";
  var storeUrl = config.urls.storeURL;
  if (storeUrl.substr(-1) !== '/') {
    storeUrl += '/';
  }
	if (process.env.NODE_ENV == "testing"){
		callbackUrl = "https://avayastoretesting.onesna.com/api/taskhandle/run";    
		callbackUrl = storeUrl ? storeUrl + 'api/taskhandle/run' : "https://avayastoretesting.onesna.com/api/taskhandle/run";
	}
  else if (process.env.NODE_ENV == "staging"){
    callbackUrl = "https://avayastorestagine.onesna.com/api/taskhandle/run";    
  }
	else if (process.env.NODE_ENV == "production"){
		callbackUrl = "https://www.avayamarket.com/api/taskhandle/run";    
    
    if (process.env.DEPLOYMENT_NAME == "production-candidate"){
      callbackUrl = "https://www2.avayamarket.com/api/taskhandle/run";
    }    

    if (process.env.DEPLOYMENT_NAME == "production-demo"){
      callbackUrl = "https://ipocloud.avayamarket.com/api/taskhandle/run";
    }
	}
	let tempoptions = arguments[arguments.length - 1];
  let parametersFuncObj = Array.prototype.splice.call(arguments, 2);

	var options = {delay: 0,
    attempts: 0,
    backoff_seconds: 0,
    eta: null
  };
	if (Object.prototype.toString.call(tempoptions) == '[object Object]' &&
      tempoptions.defferOption){
    //Remove the last element from parameterFuncObj
    parametersFuncObj = Array.prototype.splice.call(parametersFuncObj, 0, parametersFuncObj.length - 1);
    options = {
        delay: tempoptions.delay || options.delay,
        attempts: tempoptions.attempts || options.attempts,
        backoff_seconds: tempoptions.backoff_seconds || options.backoff_seconds,
        eta: tempoptions.eta || null,
        callback: tempoptions.callback || options.callback,
      };
  }
	options.url = callbackUrl;
  options.keyString = keyString;
  options.attempt_times = 0;
  options.args = JSON.stringify(parametersFuncObj);
  let callback = options.callback;
  delete options.callback;


	var requestOptions = {
	  url: putTaskUrl,
	  body: options,
	  json: true,
	  headers: {
      'Authorization': 'API_KEY ' + config.ACCOUNTS_API_KEY
    },
	  method: "post"
	}

  logger.info(src.requestId, functionName + "Add task with request options ", JSON.stringify(requestOptions));

	request(requestOptions, (err, response, body) => {
		let errObj = null;
		if (err){
			logger.warn(src.requestId, functionName + 'Insert task happen error', err);
			errObj = new esErr.ESErrors(esErr.taskInsertFailed);
		}
		else{
			if (response.statusCode != 200){
				logger.warn(src.requestId, functionName + 'Insert task happen error with statusCode', response.statusCode, body);
				errObj = new esErr.ESErrors(esErr.taskInsertFailed);
			}
			else{
				logger.info(src.requestId, functionName + 'Insert task successfully');
			}
		}
		if (callback){
			return callback(errObj);
		}
	})
}

exports.launchDefer = function(src, keyString){
	if (process.env.DeferType && process.env.DeferType === 'timeout'){
    exports.TimerWayLauchDefer.apply(this, arguments);
  }
  else{
    exports.GAELauchDefer.apply(this, arguments);
  }
};

exports.runner = function(src, options, cb){
  logger.info(src.requestId, 'Try to call function ' + options.keyString);
  try{
    let funcObj = this.getDeferHandleByKeyString(options.keyString);
    //Push callback function to the end of args
    let args = JSON.parse(options.args);
    args[0]._taskoptions = {attempts: options.attempts, attempt_times: options.attempt_times, task_endtm: (new Date()).getTime() + cst.DeferOutTimeoutInMSec};
    args.unshift(src);
    args.push(cb);
    funcObj.apply(funcObj, args);
  }
  catch(err){
    logger.warn(src.requestId, 'Start runner defer with keyString = ' + options.keyString + ' failed!');
    cb(err)
  }
}

function tester(src, data, cb){
	console.log("=====================================>>>>>>> the tester is triggered");
}
exports.registerDeferHandle('tester', tester);
