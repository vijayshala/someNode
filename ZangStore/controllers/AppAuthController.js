import util from '../modules/zgutilities';
import constants from '../config/constants'
import b64url from 'base64-url'
import fs from 'fs';
import logger from 'applogger';
import config from '../config';

function getFullUri(baseUrl, uri){
  if (uri.indexOf('http') == 0){
    return uri
  }
  else{
    return baseUrl + uri
  }
}

exports.login = function(req, res, next){
  let funcName = '[AppAuthController.login] ';
  var redirectUrl = util.getAccountsUrlFromRequest(req);
  //var redirectURL = redirectUrl + "/account/login?next=" + res.locals.escapedCurrentURL + config.urls.identityProviderLoginView;
  req.session.appauth_key = util.generate_aes_key(32);
  
  let redirect_uri = getFullUri(res.locals.baseUrl, util.getAuthRedirectUri());
  let logout_uri = getFullUri(res.locals.baseUrl, util.getAuthLogoutUri());
  
  var redirectURL = redirectUrl + "/account/login?next=" + encodeURIComponent("/internal_app_auth/authorize?appid="+util.getappaut_appid()+"&redirect_uri=" +
   encodeURIComponent(redirect_uri) +  
  '&logout_uri=' + encodeURIComponent(logout_uri) + 
  '&encryptkey=' + util.encrypt_aes_key(req.session.appauth_key) + 
  '&kid=' + util.getAuthkid()) +
  config.urls.identityProviderLoginView;

  if (req.query.next){
    logger.info(req.requestId, funcName + 'The next url ' + req.query.next + ' is saved into session');
    req.session.next = encodeURIComponent(req.query.next)
  }
  
  //According the document of https://github.com/expressjs/session
  //When redirect to other url, it's better to call save explicitly.
  req.session.save((err) =>{
    if (err){
      logger.error(req.requestId, funcName + 'When save session data, error happes', err.message, err.stack);
      res.send('Some errors happened on server!');
    }
    else{
      logger.info(req.requestId, funcName + 'The session id= ' + req.session.id + ' And the appauth_key=' + req.session.appauth_key);
      res.redirect(redirectURL);
    }
  });
  
  return;
}

exports.callback = function(req, res, next){
  let funcName = '[AppAuthController.callback] ';
  let appauth_key = req.session.appauth_key;
  let data = req.query.endata;
  let nextUrl;
  
  if (req.session.next) {
    nextUrl = decodeURIComponent(req.session.next);
  }
  
  try{
    let plainData = util.decrpt_aes(appauth_key, data)
    let secInfo = JSON.parse(plainData)
    if (secInfo.auth_token){
      let tokensParts = secInfo.auth_token.split('.')
      let payload = JSON.parse(b64url.decode(tokensParts[1], 'utf8'))
      let expiration = payload.exp * 1000;      

      if (!secInfo.expires){
        res.cookie(constants.AUTH_TOKEN, secInfo.auth_token, {httpOnly: true, secure: config.environment !== 'development'})        
      }else{        
        res.cookie(constants.AUTH_TOKEN, secInfo.auth_token, {httpOnly: true, maxAge: secInfo.expires * 1000, secure: config.environment !== 'development'})         
      }
      
    }
  }
  catch(err){
    logger.error(req.requestId, funcName + 'When try to get auth_token information, error happens and go to root url!', err.message, err.stack);
    logger.info(req.requestId, funcName + 'The session id= ' + req.session.id + ' And the appauth_key=' + appauth_key);
    return res.redirect('/')
  }

  delete req.session.next;
  delete req.session.appauth_key;
  req.session.save((err) => {
    if (err){
      logger.error(req.requestId, funcName + 'When save session data, error happes', err.message, err.stack);
      return res.redirect('/')
    }
    else{
      
      if (nextUrl){
        
        logger.info(req.requestId, funcName + 'Will go to the url' + nextUrl);
        res.redirect(nextUrl)
      }
      else{
        logger.info(req.requestId, funcName + 'Will go to the url /');
        res.redirect('/')
      }
    }
  });  
}

exports.logout = function (req, res, next) {
  fs.readFile(__dirname + '/public/images/logout.gif', (err, data)=>{
    if (data){
      res.clearCookie(constants.AUTH_TOKEN);      
      res.writeHead(200, {'Content-Type': 'image/gif' });
      res.end(data, 'binary');
    }
    else{
      res.write('Render failed')
      res.end()
    }
  })
}

exports.logmeout = function (req, res, next) {
  let nextUrl = req.query.next ? encodeURIComponent(req.query.next) : '';
  //#{urls.identityProviderURL + "/account/logout?next=" + escapedCurrentURL}
  let authUrl = config.urls.identityProviderURL + "/account/logout?next=" + nextUrl
  res.clearCookie(constants.AUTH_TOKEN); 
  res.redirect(authUrl);

}