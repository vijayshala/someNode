import {UserBzModel} from '../../models/UserModel';
import esErr from '../../modules/errors';
import cst from '../../modules/constants';
import logger from 'applogger';

exports.syncUsers = function (req, res, next){
	let functionName = '[UserController.syncUsers] ';
	if (req.auth.sysname != cst.AccountsSystemName){
		logger.warn(req.requestId, functionName + 'The caller system must be accounts!, but now is ' + req.auth.sysname);
		return res.status(cst.HttpNoPermissionStatus).json(new esErr.ESErrors(esErr.AuthorizeErrorPermission))
	}

	let userBz = new UserBzModel();
	try{
		let reqData = req.body;
		logger.info(req.requestId, functionName + ' Get request of synchronize with data', reqData)

		let data = {accountsUsers: reqData};
	  userBz.syncUsersByAccountsUsers(req, data, (err, result)=>{
	  	if (err){
	  		logger.warn(req.requestId, functionName + 'Synchronize users call function syncUsersByAccountsUsers', err, data);
	  		return res.status(cst.HttpErrorStatus).json(new esErr.ESErrors(esErr.syncUserFailed));
	  	}
	  	else{
	  		return res.status(cst.HttpSuccessStatus).json(result)
	  	}
	  });
	}
	catch (err){
		logger.warn(req.requestId, functionName + 'Synchronize users happen error.', req.body, err);
		return res.status(cst.HttpErrorStatus).json(new esErr.ESErrors(esErr.BadRequestError));
	}
}
