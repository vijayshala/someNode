import logger from 'applogger';
import constants from '../../config/constants';
import config from '../../config';
import esErr from '../../modules/errors';
import cst from '../../modules/constants';

const ns = '[BaseController]'


exports.authorizeAdminApi = function (req, res, next) {
	let functionName = '[authorizeAdminApi] ';
	if (req.auth.authenType == cst.AuthenticateTypeAPIKey){
		return next();
	}
	else{
	  var authorized = req.userInfo.accessLevel <= constants.USER_LEVELS.ADMIN;
	  if(authorized){
			return next();
	  } else {
	  	logger.warn(req.requestId, functionName + 'The user who call this api must be admin. But his level is ' + req.userInfo.accessLevel)
	  	return res.status(cst.HttpNoPermissionStatus).json(new esErr.ESErrors(esErr.AuthorizeErrorPermission))
	  }
	}
};

exports.authorizeAdminApiGSMB = function (req, res, next) {
	let functionName = '[authorizeAdminApiGSMB] ';
	if (req.auth.sysname == cst.GermanyBillingEngine){
		return next();
	}
	else{
	  var authorized = req.userInfo.accessLevel <= constants.USER_LEVELS.ADMIN;
	  if(authorized){
			return next();
	  } else {
	  	logger.warn(req.requestId, functionName + 'The user who call this api must be admin. But his level is ' + req.userInfo.accessLevel)
	  	return res.status(cst.HttpNoPermissionStatus).json(new esErr.ESErrors(esErr.AuthorizeErrorPermission))
	  }
	}
};

exports.authorizeAdminApiKazoo = function (req, res, next) {
	let functionName = '[authorizeAdminApiKazoo] ';
	if (req.auth.sysname == cst.KazooSystemName){
		return next();
	}
	else{
	  var authorized = req.userInfo.accessLevel <= constants.USER_LEVELS.ADMIN;
	  if(authorized){
			return next();
	  } else {
	  	logger.warn(req.requestId, functionName + 'The user who call this api must be admin. But his level is ' + req.userInfo.accessLevel)
	  	return res.status(cst.HttpNoPermissionStatus).json(new esErr.ESErrors(esErr.AuthorizeErrorPermission))
	  }
	}
};
