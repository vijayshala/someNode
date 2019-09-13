const ns = '[AuthenticationMiddleware]';

import request from 'request';
import expressJwt from 'express-jwt';
import jwtDecode from 'jwt-decode';
import jwt from 'jsonwebtoken';
import logger from 'applogger';
import dbWp from 'dbwrapper';
import UserSchema from '../schemas/UserSchema';
import config from '../config'
import util from '../modules/zgutilities';
import async from 'async';
import crypto from 'crypto';
import base64url from 'base64url';
import bufferEqual from 'buffer-equal-constant-time';
import esErr from '../modules/errors';
import {SecUserModel} from '../models/UserModel';
import {jwtPublicKeyCache} from '../modules/cache';
import cst from '../modules/constants';
import constants from '../config/constants';
import csrf from 'csurf';
import { handleRequestUserInfo } from './UserMiddleware'

class JwtAuthenticator{
  constructor(){
    this.name = 'JwtAuthenticator';
    this.checkSig = true;
  }

  getJwtToken(req, cb) {
    let token = null;
    let cookies = req.cookies;
	  if(cookies[constants.AUTH_TOKEN]){
	    token = cookies[constants.AUTH_TOKEN];
	  }
    return token;
  } 

  removeJwtToken(req, res, cb){
  	let rootdm = util.getIssFromHostname(util.getDomainFromRequest(req));
    //res.clearCookie(config.session.identityProviderCookieName, {domain: '.'+rootdm, path: '/'});
    if (req.cookies[constants.AUTH_TOKEN]){
      res.clearCookie(constants.AUTH_TOKEN);
    }   
  }

  getUserOnesna(userid, cb) {
    var functionName = '[JwtAuthenticator.getUserOnesna] ';
    var url = util.getAccountsUrlFromRequest(this.request) + '/api/1.0/users/' + userid + '/sync-fulluserinfo';
    var token = this.token;
    var options = {
      url: url,
      headers: {
        'Authorization': 'API_KEY ' + config.ACCOUNTS_API_KEY
      },
      accept: '*/*',
      json:true
    };
    var self = this;
    logger.info(self.reqId, functionName + 'Access esna by url ' + url);
    request.get(options, function(err, response, retobj) {
      if (err || response.statusCode !== 200) {
        logger.error(self.reqId, functionName + 'Wrong response!: ');
        if (response && response.statusCode == 400 && retobj && retobj.error && retobj.error.code== 'user.not_found'){
        	return cb(new esErr.ESErrors(esErr.AuthenticateErrorJWT));
        }
        return cb(new esErr.ESErrors(esErr.AccessOnesnaHappenError));
      }
      return cb(null, retobj);
    });
  }


  get_secret_token_user(userid, cb) {
    var functionName = '[JwtAuthenticator.get_secret_token_user] ';
    var self = this;
    var reqid = this.reqId;
    var oldUser = null;

    async.waterfall([
      function(callback){
        let exeobj = UserSchema.findOne({accountId: userid}, {account:1, accessLevel:1, accountId: 1}).lean();
        dbWp.execute(exeobj, exeobj.exec, reqid, callback);
      },
      function(user, callback){
      	if (user){
          oldUser = user;
        }
        if (!user || user.account.lastupdatetime.getTime() < (new Date(self.payload.lastupdatetime)).getTime()){
          logger.info(reqid, functionName + 'No user found, lets go to onesna');
          self.getUserOnesna(userid, callback);
        }
        else{
          return cb(null, SecUserModel.FromAccountSchema(user));
        }
      },
      function(newUser, callback){
      	var newUserObj = newUser;
      	var loganUser = SecUserModel.FromEsnaObject(newUserObj);
      	newUserObj = {accountId: loganUser.accountId, account: newUserObj, accessLevel: loganUser.accessLevel};

        dbWp.execute(UserSchema, UserSchema.findOneAndUpdate, reqid, {accountId: loganUser.accountId}, newUserObj, {upsert: true, new: true}, (err, savedUser)=>{
          if (!err && savedUser){
          	savedUser = SecUserModel.FromAccountSchema(savedUser);
          	return callback(null, savedUser);
          }
          else if (err && err.code == esErr.DBErrorDuplicateKey){
            //Under ndbid unique and username unique condition, happen such error only possible be username duplicate
            //To avoid problem of endless loop, get user by username and replace secret in memory to make verify pass
          	logger.info(reqid, functionName + 'Happen duplicate username ' + loganUser.username + '. Get user by same username from db!');
            dbWp.execute(UserSchema, UserSchema.findOne, reqid, {"account.username": loganUser.username}, (err, savedUser)=>{
              if (err || (!savedUser)){
                logger.error(reqid, functionName + 'Failed to get user by username ' + loganUser.username);
                return cb(err);
              }
              let curtm = Date.now().toString();
              let usernameold = savedUser.account.username;
              savedUser.account.username = savedUser.account.username + '_removed' + curtm;
              for (let emailItem of savedUser.account.emails){
              	if (emailItem.value == usernameold){
              		emailItem.value = savedUser.account.username;
              	}
              	else{
              		emailItem.value = emailItem.value + '_removed' + curtm;
              	}
              }

              logger.info(reqid, functionName + 'Remove username form existing user with _id= ' + savedUser._id.toString());
              savedUser.save((err, result)=>{
              	if (err){
              		logger.error(reqid, functionName + 'Failed to remove username form existing user');
              		return callback(err);
              	}
              	else{
              		logger.info(reqid, functionName + 'Add new user');
              		dbWp.execute(UserSchema, UserSchema.findOneAndUpdate, reqid, {accountId: loganUser.accountId}, newUserObj, {upsert: true, new: true}, (err, savedUser)=>{
                    if (!err && savedUser){
                    	logger.info(reqid, functionName + 'Add new user successfully');
                    	savedUser = SecUserModel.FromAccountSchema(savedUser);
                    	return callback(null, savedUser);
                    }
                    else{
                    	logger.error(reqid, functionName + 'Add new user failed', err);
                    	return callback(err);
                    }
                  });
              	}
              })
            });
          }
          else{
            return callback(err);
          }
        });
      },
      function(savedUser, callback){
        if (!savedUser) {
          logger.error(reqid, functionName + 'Error while save/update Logan user');
          return callback(new esErr.ESErrors(esErr.DBError));
        }
        return callback(null, savedUser);
      }
    ],function(err, result){
        if (err){
          logger.error(reqid, functionName + ' happen error! ', err.message);
        }
        return cb(err, result);
      }
    );
  }

  verifyToken(secret, token, req, res, cb) {
    var functionName = '[JwtAuthenticator.verifyToken] ';
    logger.info(this.reqId, functionName + 'Begin verify token');
    var self = this;
    var secretCallback = function(req, dtokenPayload, callback){
      if (dtokenPayload.ver == '2.0' && dtokenPayload.publickeyid){
        var publicKey = jwtPublicKeyCache.get(dtokenPayload.publickeyid);
        if (publicKey){
          return callback(null, publicKey)
        }
        else{
          var url = util.getAccountsUrlFromRequest(self.request) + '/api/1.0/jwt/publickey/'+dtokenPayload.publickeyid;
          var options = {
            url: url,
            json: true
          };
          request.get(options, function(err, response, retobj) {
            if (err || response.statusCode !== 200) {
            	if (response && response.statusCode == 400 && retobj && retobj.error && retobj.error.code == 'jwt.publickey_not_exist'){
            		return callback(new esErr.ESErrors(esErr.AuthenticateErrorJWT))
            	}
              logger.error(self.reqId, functionName + 'Wrong response!: with url ' + url);
              return callback(null, secret + config.commonSecretJwt)
            }
            var publicKeyObj = retobj;
            jwtPublicKeyCache.set(publicKeyObj.publickeyid, publicKeyObj.publickey)
            return callback(null, publicKeyObj.publickey)
          });
        }
      }
      else{
        return callback(null, secret + config.commonSecretJwt)
      }
    }

    var verify = expressJwt({
      secret: secretCallback,
      getToken: function () {
        return token;
      }
    });
    verify(req, res, function(err, result){
      if (self.payload.ver == '2.0' && self.payload.user_id && self.payload.user_id_sig){
        var buff = self.payload.user_id.toString('binary');
        var hmac = crypto.createHmac('sha256', secret + config.commonSecretJwt);
        var sig = (hmac.update(buff), hmac.digest('base64'));
        var computedSig = base64url.fromBase64(sig);
        if (!bufferEqual(Buffer(self.payload.user_id_sig), Buffer(computedSig))){
          logger.info(req.requestId, functionName + 'Verify failed for check user_id token ' + token);
          return cb(new esErr.ESErrors(esErr.AuthenticateErrorJWT));
        }
      }

      if (err){
        logger.info(req.requestId, functionName + 'Verify failed for token ' + token);
        return cb(err);
      }
      else{
        return cb(null);
        //verify domain of jwt
        // if (util.getIssFromHostname(util.getDomainFromRequest(req)) != self.payload.iss){
        //   logger.info(req.requestId, functionName + 'Issure is not correct with value ' + self.payload.iss);
        //   return cb(new esErr.ESErrors(esErr.AuthenticateErrorJWT));
        // }
        // else{
        //   return cb(null);
        // }
      }
    });
  }

  auth(req, res, cb){
    var functionName = '[JwtAuthenticator.auth] ';
    var token = this.getJwtToken(req);
    this.reqId = req.requestId;    
    
    if (!token) {            
      logger.info(req.requestId, functionName + 'No jwt token in header. Maybe it is right for this request!');
      this.removeJwtToken(req, res);
      return cb(new esErr.ESErrors(esErr.AuthenticateErrorJWT));
    }
    
    this.token = token;
    var payload;
    try{
      payload = jwt.decode(token);
    }
    catch(err){
      logger.error(req.requestId, functionName + 'Decode token happen error' + token, err);
      this.removeJwtToken(req, res);
      return cb(new esErr.ESErrors(esErr.AuthenticateErrorJWT));
    }
    if (!payload){
        logger.warn(req.requestId, functionName + 'Payload is undefined in token' + token);
        this.removeJwtToken(req, res);
        return cb(new esErr.ESErrors(esErr.AuthenticateErrorJWT));
    }
    if (!payload.user_id){
      logger.warn(req.requestId, functionName + 'user_id is undefined in Payload of token' + token);
      this.removeJwtToken(req, res);
      return cb(new esErr.ESErrors(esErr.AuthenticateErrorJWT));
    }
    var uid = payload.user_id;
    var self = this;
    var userObj = null;
    this.payload = payload;
    this.request = req;
    async.waterfall([
      function(callback){
        self.get_secret_token_user(uid, callback);
      },
      function(userObj, callback){
        self.userObj = userObj;
        if (userObj.accountId == uid){
          self.verifyToken(userObj.secret, token, req, res, callback);
        }
        else{
          if (userObj.fakeSecret){
            self.verifyToken(userObj.fakeSecret, token, req, res, (err)=>{
              if (err){
                return self.verifyToken(userObj.secret, token, req, res, callback);
              }
              else{
                return callback(null)
              }
            });
          }
          else{
            self.verifyToken(userObj.secret, token, req, res, callback);
          }
        }
      },
    ], function(err, result){
    	if (err){
        logger.warn(req.requestId, functionName + 'Verify Token :' + token + ' has Error: ', err);
        if (err.code && err.code == esErr.AuthenticateErrorJWT){
	        self.removeJwtToken(req, res);
	      }
        return cb(err);
      }
      else{
        if (self.userObj.fakeSecret){
          delete self.userObj.fakeSecret;
        }
        req.userInfo = self.userObj.toRequestUserInfor();
        // logger.info('-------------------------------userInfo................', req.userInfo);
        res.locals.userInfo = req.userInfo;
        req.auth = payload;
        req.auth.authenType = cst.AuthenticateTypeJWT;
        return cb();
      }
    });
  }
}

class APIAuthenticator{
  constructor(){
    this.name = 'ApiAuthenticator';
  }

  getApiKey(req) {
    var token;
    var authorization;
    if (req.headers && req.headers.authorization) {
      authorization = req.headers.authorization;
    } else if (req.body && req.body.Authorization)  {
      authorization = req.body.Authorization;
    } else if (req.query && req.query && req.query.api_key) {
      authorization = `API_KEY ${req.query.api_key}`;
    }
    if (authorization) {
      var parts = authorization.split(' ');
      if (parts.length == 2) {
        var scheme = parts[0].toLowerCase();
        var credentials = parts[1];
        if (/^API_KEY$/i.test(scheme)) {
          token = credentials;
        } else {
          return null;
        }
      } else {
        return null;
      }
    }
    return token;
  }

  verifyAPIKEY(token, cb){
  	var functionName = '[verifyAPIKEY] ';
  	if (token == config.FOR_ACCOUNTS_API_KEY){
  		return cb(null, cst.AccountsSystemName);
  	} else if(token == config.FOR_KAZOO_API_KEY){
      return cb(null, cst.KazooSystemName);
    } else if(token == config.FOR_BILLING_ENGINE_API_KEY){
      return cb(null, cst.BillingEngineSystemName);
    } else if (token == (config.germanyBilling && config.germanyBilling.extApiKey))  {
      return cb(null, cst.GermanyBillingEngine);
    } else if(token == (config.kazoo_de && config.kazoo_de.webhookKey)) {
      return cb(null, cst.KazooSystemName);
    }
  	logger.warn(this.reqId, functionName + 'The api_key '+ token +' is invalid');
  	return cb(new esErr.ESErrors(esErr.AuthenticateErrorApiKey))
  }

  auth(req, res, cb){
  	var functionName = '[APIAuthenticator.auth] ';
  	var token = this.getApiKey(req);
    this.reqId = req.requestId;
    if (token){
    	this.verifyAPIKEY(token, (err, otherSysName) => {
    		if (err){
          req.auth = {sysname: null, authenType:null};
    			return cb(err);
    		}
	    	logger.info(this.reqId, functionName + 'Pass api_key check');
//	    	var secUserObj = new SecUserModel();
//	    	secUserObj.accountId = '__virtual_id';
//	    	secUserObj.username = 'ServerSuperUser';
//	    	secUserObj.accessLevel = constants.USER_LEVELS.ADMIN
//	    	req.userInfo = secUserObj.toRequestUserInfor();
//	      res.locals.userInfo = req.userInfo;
	      req.auth = {sysname: otherSysName, authenType:cst.AuthenticateTypeAPIKey};
	      return cb(null);
    	})
    }
    else{
    	logger.warn(this.requestId, functionName + 'No valid api_key');
    	return cb(new esErr.ESErrors(esErr.AuthenticateErrorApiKey));
    }
  }
}

class JwtAPIAuthenticator extends JwtAuthenticator{
	constructor(){
		super();
    this.name = 'JwtAPIAuthenticator';
  }

  getJwtToken(req, cb) {
    let token = ''
    if (req.headers && req.headers.authorization) {
      var parts = req.headers.authorization.split(' ');
      if (parts.length == 2) {
        var scheme = parts[0].toLowerCase();
        var credentials = parts[1];
        if (/^JWT$/i.test(scheme)) {
          token = credentials;
        } else {
          token = '';
        }
      } else {
        token = '';
      }
    }
    if (token){
      this.shouldCheckCsrf = false;
      return token;
    }else{
      token = JwtAuthenticator.prototype.getJwtToken.call(this, req);
      if (token){
        this.shouldCheckCsrf = true;
        return token;
      }
      else{
        return '';
      }
    }
  }
}

const csrfProtectionRest = csrf({ cookie: true, ignoreMethods: []})
function checkCsrfRest(req, res, next){
  return csrfProtectionRest(req, res, (err)=>{
    if (err){
      err.httpStatus = 403;
    }
    return next(err);
  });
}

const csrfProtectionView = csrf({ cookie: true})

export default function (req, res, next) {
  //logger.info(req.requestId, '[AuthenticationMiddleware]:headers', JSON.stringify(req.headers))
  //logger.info(req.requestId, '[AuthenticationMiddleware]:body', JSON.stringify(req.body))

//  req.userInfo = false;
//  let cookies = req.cookies;
//  if(cookies[config.session.identityProviderCookieName]){
//    let cookie = cookies[config.session.identityProviderCookieName];
//    cookieFound(cookie, req, res, next);
//  } else {
//    cookieNotFound(req, res, next);
//  }
	if (req.originalUrl.indexOf('/api') == 0 || req.originalUrl.indexOf('/clientapi') == 0 || req.originalUrl.indexOf('/webservice') == 0){
    if (req.originalUrl.indexOf('/api/rates/long-distance/search')==0){
      return next();
    }    
    if (req.method=='GET' && req.originalUrl.match(/\/clientapi\/regions/)){
      return next();
    }
    if (req.method=='GET' && req.originalUrl.match(/\/clientapi\/quotes\/\w+/)){
      return handleRequestUserInfo(req, res, next);
    }
    if (req.method=='GET' && req.originalUrl.match(/\/clientapi\/webapp\/submenus\/.+/)){
      return handleRequestUserInfo(req, res, next);
    }
    
      
    var jwtapiAuth = new JwtAPIAuthenticator();
    jwtapiAuth.checkSig = false;
		jwtapiAuth.auth(req, res, (err) => {
			if (err){
				if (err.code == esErr.AuthenticateErrorJWT){
					var apikeyAuth = new APIAuthenticator();
					apikeyAuth.auth(req, res, (err) =>{
            if(err){
              err.status = 401;
            }            
						return next(err);
					});
				}
				else{
					return next(err);
				}
			}
			else{
        if (jwtapiAuth.shouldCheckCsrf){
          return checkCsrfRest(req, res, next);
        }
        else{
          return next();
        }
			}
		});
	}
	else{
		var jwtAuth = new JwtAuthenticator();
		jwtAuth.auth(req, res, (err) => {
			return csrfProtectionView(req, res, (err) =>{
        res.locals.metacsrftoken = req.csrfToken();
        return next();
      });
		});
	}
}
