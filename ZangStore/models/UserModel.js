import dbWp from 'dbwrapper';
import config from '../config/'
import esErr from '../modules/errors';
import cst from '../modules/constants';
import async from 'async';
import logger from 'applogger';
import constants from '../config/constants'

var ns = '[UserModel]'
var UserSchema = require('../schemas/UserSchema');


var UserModel = {}
exports.UserModel = UserModel;

class SecUserModel{
   static FromAccountSchema(user){
     let userLang = user.account.languages.filter(lang => {
       return lang.primary === true
     })[0]
     let newObj = new SecUserModel();
     newObj.userId = user._id,
     newObj.accessLevel = user.accessLevel || newObj.accessLevel,
     newObj.accountId = user.accountId;
     newObj.username = user.account.username;
     newObj.firstName = user.account.name.givenname;
     newObj.lastName = user.account.name.familyname;
     newObj.language = userLang.code;
     newObj.picturefile = user.account.picturefile;
     newObj.secret = user.account.security_token;
     newObj.relation_graphs = user.account.relation_graphs;
     newObj.permissions = user.account.permissions
     return newObj;
   }

   static FromEsnaObject(user){
     let userLang = user.languages.filter(lang => {
       return lang.primary === true
     })[0]
  	 let newObj = new SecUserModel();
     newObj.accountId = user.id;
     newObj.accessLevel = user.accessLevel || 3;
     newObj.username = user.username;
     newObj.firstName = user.name.givenname;
     newObj.lastName = user.name.familyname;
     newObj.language = userLang.code;
     newObj.picturefile = user.picturefile;
     newObj.secret = user.security_token;
     newObj.relation_graphs = user.relation_graphs;
     newObj.permissions = user.permissions
     return newObj;
   }

   constructor(){
     this.userId = '';
     this.accessLevel = 3;
     this.accountId = '';
     this.username = '';
     this.firstName = '';
     this.lastName = '';
     this.language =  '';
     this.picturefile = 'https://www.onesna.com/norevimages/noimage.jpg';
     this.needVerify = true;
     this.relation_graphs = [];
     this.permissions = [];
   }

   get pictureURL() {
     if (!this.picturefile) {
        return 'https://www.onesna.com/norevimages/noimage.jpg';
     }
     if (this.picturefile.indexOf('http://') > -1 || this.picturefile.indexOf('https://') > -1) {
        return this.picturefile;
     }
     return 'https://storage.googleapis.com/' + config.bucket + '/' + this.picturefile;
   }

   toRequestUserInfor(){
     return {
	    userId: this.userId,
	    accessLevel: this.accessLevel,
	    accountId: this.accountId,
	    username: this.username,
	    firstName: this.firstName,
	    lastName: this.lastName,
	    language: this.language,
	    pictureURL: this.pictureURL,
	    relation_graphs: this.relation_graphs,
      permissions: this.permissions
  	 };
   }
}
exports.SecUserModel = SecUserModel;

class UserBzModel {
  loadUserByAccountId(src, data, cb){
  	let functionName = '[UserModel.loadUserByAccountId] ';
  	dbWp.execute(UserSchema, UserSchema.findOne, src.requestId, {accountId: data.accountId}, (err, userObj) => {
  		if (err){
  			logger.error(src.requestId, functionName + 'Query user by accountId happen error', err);
  		}
  		if (!userObj){
  			logger.warn(src.requestId, functionName + 'There is no such user with accountId: ' + data.accountId);
  		}
  		return cb(null, userObj)
  	})
  }

  addUserByAccountsUserobj(src, accountsUser, cb){
    console.log('====>>>>>>>addUserByAccountsUserobj:user', accountsUser)
  	let functionName = '[UserModel.addUserByAccountsUserobj] ';
  	let newUserObj = new UserSchema();
  	newUserObj.accountId = accountsUser.id;
  	newUserObj.account =  accountsUser;
  	newUserObj.created.on = Date.now();
  	dbWp.execute(newUserObj, newUserObj.save, src.requestId, (err, createdUser) => {
  		if (err){
  			logger.error(src.requestId, functionName + 'Create user failed', err);
  		}
  		return cb(err, createdUser);
  	});
  }

  updateUserByAccountsUserobj(src, data, cb){
  	let functionName = '[UserModel.updateUserByAccountsUserobj] ';
  	let storeUser = data.storeUser;
  	let accountsUser = data.accountsUser;
  	if (storeUser.accountId != accountsUser.id){
  		logger.warn(src.requestId, functionName + 'The storeUser accountId:' + storeUser.accountId + '. But accountsUser id:' + accountsUser.id)
  		return cb(new esErr.ESErrors(esErr.updateUserFailed))
  	}
  	storeUser.account = data.accountsUser;
  	storeUser.updated.on = Date.now();

  	dbWp.execute(storeUser, storeUser.save, src.requestId, (err, updatedUser) => {
  		if (err){
  			logger.error(src.requestId, functionName + 'Create user failed', err);
  		}
  		return cb(err, updatedUser);
  	});
  }

  addUpdateUserByAccountsUser(src, accountsUser, cb){
  	let functionName = '[UserModel.addUpdateUserByAccountsUser] ';
  	var self = this;
  	this.loadUserByAccountId(src, {accountId: accountsUser.id}, (err, userObj)=>{
  		if (err){
  			logger.error(src.requestId, functionName + 'Query user by accountId: ' + accountsUser.id +' happen error', err);
  			return cb(err);
  		}
  		if (!userObj){
  			logger.info(src.requestId, functionName + 'Try to add user');
  			return self.addUserByAccountsUserobj(src, accountsUser, cb);
  		}
  		else{
  			if ((new Date(accountsUser.lastupdatetime)).getTime() > userObj.account.lastupdatetime){
  				logger.info(src.requestId, functionName + 'The user with accountId: ' + accountsUser.id + ' got from onesna is newer than that stored in database, update the user');
  				return self.updateUserByAccountsUserobj(src,
  						     {storeUser: userObj, accountsUser: accountsUser},
  						     (err, result)=>{
  						       return cb(err, result);
  						     });
  			}
  			else{
  				logger.info(src.requestId, functionName + 'The user with accountId: ' + accountsUser.id + ' got from onesna is older than or same as that stored in database, ignore the user');
  				return cb(null);
  			}
  		}
  	})
  }

  deleteUserByAccountsUser(src, accountsUser, cb){
  	let functionName = '[UserModel.deleteUserByAccountsUser] ';
  	dbWp.execute(UserSchema, UserSchema.findOneAndRemove, src.id, {accountId: accountsUser.id}, (err, deletedUser) => {
  		if (err){
  			logger.error(src.requestId, functionName + 'When remove user with accountId: ' + accountsUser.id + ', there happen error');
  		}
  		else{
  			if (!deletedUser){
  				logger.warn(src.requestId, functionName + 'There is no user with accountId: ' + accountsUser.id);
  			}
  			else{
  				logger.info(src.requestId, functionName + 'Remove the user with accountId: ' + accountsUser.id);
  			}
  		}
  		return cb(err, deletedUser);
  	});
  }

  syncUsersByAccountsUsers(src, data, cb){
  	let functionName = '[UserModel.addUpdateUsersByAccountsUsers] ';
  	var self = this;
  	var resultList = [];
  	var promiseArray = [];
  	for (let accountsUserIdx in data.accountsUsers){
  		let accountsUser = data.accountsUsers[accountsUserIdx];
  		let aPromise = new Promise((resolve, reject)=>{
  			if (accountsUser.operate_type === cst.SyncOperateDelete){
  				self.deleteUserByAccountsUser(src, accountsUser, (err, result)=>{
  					if (err){
  						logger.warn(src.request, functionName + ' When remove user happen error', err);
  						resolve({id: accountsUser.id, index: accountsUserIdx, status: 'fail', error: err});
  					}
  					else{
  						resolve({id: accountsUser.id, index: accountsUserIdx, status: 'success'});
  					}
  				});
  			}
  			else{
  				self.addUpdateUserByAccountsUser(src, accountsUser, (err, result) => {
  					if (err){
  						logger.warn(src.request, functionName + ' When remove user happen error', err);
  						resolve({id: accountsUser.id, index: accountsUserIdx, status: 'fail', error: err});
  					}
  					else{
  						resolve({id: accountsUser.id, index: accountsUserIdx, status: 'success'});
  					}
  				})
  			}
  		});
  		promiseArray.push(aPromise);
  	}

  	Promise.all(promiseArray)
  		.then((results)=>{
        return cb(null, results);
      });
  }

}
exports.UserBzModel = UserBzModel;
