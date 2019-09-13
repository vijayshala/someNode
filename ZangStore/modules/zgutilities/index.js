const ns = '[zgutilities]';
const logger = require('applogger');
const crypto = require('crypto');
const b64url    = require('base64-url');
const config = require('../../config');

exports.getDomainFromHost = function(hostname){
  var portPos = hostname.indexOf(':');
  var WORLDWIDEWEBHEADER = 'www.'
  if (portPos > 0){
    var domain = hostname.substr(0, portPos);
  }
  else{
    var domain = hostname;
  }
  if (domain.startsWith(WORLDWIDEWEBHEADER)){
      domain = domain.substr(WORLDWIDEWEBHEADER.length);
  }
  return domain;
}

exports.getDomainFromRequest = function(req){
  return exports.getDomainFromHost(req.headers.host);  
}

exports.getIssFromHostname = function(domain){
  var parts = domain.split('.');
  if (parts.length >= 3){
    return parts.slice(parts.length-2).join('.');
  }
  else{
     return domain;
  }
};
	
exports.getAccountsUrlFromDomain = function(domain){
  if (process.env.ESNA_LINK){
    return process.env.ESNA_LINK;
  }
  return config.urls.identityProviderURL;
  // var iss = exports.getIssFromHostname(domain);
  // if (iss == 'esna.com'){
	// return 'https://' + 'onesnatesting.' + iss;
  // }
  // else if (iss == 'onesna.com'){
	// return 'https://' + 'www.' + iss;
  // }
  // else if (iss == 'zang.io'){
	// return 'https://' + 'accounts.' + iss;
  // }
  // else{
	// return 'https://acounts.zang.io';
  // }
};

exports.getAccountsUrlFromRequest = function(req){
  return exports.getAccountsUrlFromDomain(exports.getDomainFromRequest(req));
}

exports.generate_aes_key = function(len){
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < len; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

exports.getappaut_appid = function(){
  return config.APPAUTH.appid
}

exports.encrypt_aes_key = function (aes_key){
  let publickey=config.APPAUTH.seckey;
  
  let buf = Buffer.from(aes_key, 'utf8');
  let enbuf = crypto.publicEncrypt(publickey, buf)
  return b64url.encode(enbuf, 'utf-8')
}

exports.getAuthkid = function(){
  return config.APPAUTH.kid
}

exports.getAuthRedirectUri = function(){
  return config.APPAUTH.redirect_uri;
}

exports.getAuthLogoutUri = function(){
  return config.APPAUTH.logout_uri;
}
exports.decrpt_aes = function(aeskey, data){  
  let msg = b64url.decode(data)
  let msgs = msg.split(':')
  
  let iv = Buffer.from(msgs[0], 'base64')
  
  msg = msgs[1];
  var decrypt = crypto.createDecipheriv('aes-256-cbc', aeskey, iv);
  var s = decrypt.update(msg, 'base64', 'utf8');
  return s + decrypt.final('utf8');
}

exports.getTaskProxyUrl = function(){
  if (!process.env.NODE_ENV || process.env.NODE_ENV == 'development'){
    return 'http://localhost:3000/api/taskhandle/run_proxied'
  }
  else{
    return 'http://avayastore-taskprocessor.default.svc.cluster.local:8080/api/taskhandle/run_proxied'
  }
}

