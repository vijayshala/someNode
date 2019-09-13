import esErr from '../modules/errors';
import util from '../modules/zgutilities';
import constants from '../config/constants'
import b64url from 'base64-url'
import fs from 'fs';
import logger from 'applogger';
import config from '../config';
import cst from '../modules/constants';
import { HttpUnauthorizedStatus } from '../modules/constants';

function getFullUri(baseUrl, uri){
  if (uri.indexOf('http') == 0){
    return uri
  }
  else{
    return baseUrl + uri
  }
}

exports.requireLoginApi = function(req, res, next){
  if (req.userInfo){    
    return next();
  }
  else {
    // console.error('[requireLoginApi]-------------------- no user is defined --------------------------');
    // let err = new(esErr.ESErrors(esErr.AuthenticateFailed));
    res.status(401);
    res.json({
      error: { code: 'unauthorized' },
      redirect: config.urls.identityProviderURL + "/account/login?next={0}" + config.urls.identityProviderLoginView
    });
  }
}

exports.requireAPIorUserAuth = function(req, res, next) {
  if (req.userInfo){    
    return next();
  } else if (req.auth.authenType == cst.AuthenticateTypeAPIKey){
		return next();
	}
  else {
    // console.error('[requireLoginApi]-------------------- no user is defined --------------------------');
    // let err = new(esErr.ESErrors(esErr.AuthenticateFailed));
    res.status(401);
    res.json({
      error: { code: 'unauthorized' },
      redirect: config.urls.identityProviderURL + "/account/login?next={0}" + config.urls.identityProviderLoginView
    });
  }
}

exports.requireLoginPage = function(req, res, next){
  let funcName = '[AuthUserCheckMiddleware.requireLoginPage] ';
  if (req.userInfo){    
    return next();
  }
  else{
    var redirectUrl = util.getAccountsUrlFromRequest(req);
    req.session.appauth_key = util.generate_aes_key(32);
    let redirect_uri = getFullUri(res.locals.baseUrl, util.getAuthRedirectUri());
    let logout_uri = getFullUri(res.locals.baseUrl, util.getAuthLogoutUri());
    
    var redirectURL = redirectUrl + "/account/login?next=" + encodeURIComponent("/internal_app_auth/authorize?appid="+util.getappaut_appid()+"&redirect_uri=" +
    encodeURIComponent(redirect_uri) +  
    '&logout_uri=' + encodeURIComponent(logout_uri) + 
    '&encryptkey=' + util.encrypt_aes_key(req.session.appauth_key) + 
    '&kid=' + util.getAuthkid()) +
    config.urls.identityProviderLoginView;

    if (req.originalUrl){
      logger.info(req.requestId, funcName + 'The next url ' + req.originalUrl + ' is saved into session');
      req.session.next = decodeURIComponent(req.originalUrl)
    }
    req.session.save((err) =>{
      if (err){
        logger.error(funcName + 'When save session data, error happes', err.message, err.stack);
        res.send('Some errors happened on server!');
      }
      else{
        logger.info(funcName + 'The session id= ' + req.session.id + ' And the appauth_key=' + req.session.appauth_key);
        res.redirect(redirectURL);
      }
    });
  }
}
