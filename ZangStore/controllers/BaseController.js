
import logger from 'applogger';
import constants from '../config/constants';
import config from '../config';
import util from '../modules/zgutilities';
import DeveloperSchema from '../schemas/DeveloperSchema';

const ns = '[BaseController]'
const BaseController = {};


BaseController.authenticate = function (req, res, next) {
  var authenticated = req.userInfo;
  if(!authenticated){
  	var redirectUrl = util.getAccountsUrlFromRequest(req);
    var redirectURL = res.locals.baseUrl + '/appauth/login?next=' + res.locals.escapedCurrentURL + config.urls.identityProviderLoginView;    
    res.redirect(redirectURL);
    return;
  }

  next();
};

BaseController.authorizeAdmin = function (req, res, next) {
  var authorized = req.userInfo.accessLevel <= constants.USER_LEVELS.ADMIN;
  if(authorized){
    next();
  } else {
    logger.warn('[authorizeAdmin] NOT ADMIN is-authorized:', authorized)
    res.redirect('/');
  }
};

BaseController.authorizeDev = function (req, res, next) {
  DeveloperSchema.find({email: req.userInfo.username}, function (err, developers) {
    if(err){
      res.redirect('/');
    }
    if (developers.length > 0) {
      return next();
    }
    res.redirect('/');
  });
};

BaseController.authorizeEditor = function (req, res, next) {
  var authorized = req.userInfo.accessLevel <= constants.USER_LEVELS.EDITOR;
  if(authorized){
    next();
  } else {
    res.redirect('/');
  }
};

BaseController.authorizePageEditor = function (req, res, next) {
  if(req.hasPageEditorPermission){
    next();
  } else {
    res.redirect('/');
  }
}

BaseController.authorizePantnerApprover = function (req, res, next) {
  if(req.hasPartnerApproverPermission){
    next();
  } else {
    res.redirect('/partners/admin');
  }
}


BaseController.checkEmptyCart =  (req, res, next) => {
  if(req.cart.items.length){
    next()
  } else {
    res.redirect('/')
  }
}

module.exports = BaseController;
