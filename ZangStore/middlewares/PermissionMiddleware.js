var ns = '[PermissionMiddleware]';
var logger = require('applogger');
var constants =  require('../config/constants');
var UserSchema = require('../schemas/UserSchema');
var DBWrapper = require('dbwrapper');

module.exports = function (req, res, next) {

  if(req.userInfo){
    res.locals.userLevels = constants.USER_LEVELS

    res.locals.hasAdminPermission =
    req.userInfo.accessLevel <= constants.USER_LEVELS.ADMIN;

    res.locals.hasEditorPermission =
    req.userInfo.accessLevel <= constants.USER_LEVELS.EDITOR;

    res.locals.hasPartnerApproverPermission =
    constants.PARTNER_APPROVERS.indexOf(req.userInfo.username) > -1;

    req.hasAdminPermission =
    req.userInfo.accessLevel <= constants.USER_LEVELS.ADMIN;

    req.hasEditorPermission =
    req.userInfo.accessLevel <= constants.USER_LEVELS.EDITOR;

    req.hasPartnerApproverPermission =
    constants.PARTNER_APPROVERS.indexOf(req.userInfo.username) > -1;



    logger.info(req.requestId, ns, '[userAccessLevel]: ' + req.userInfo.accessLevel);
    next();
  } else {
    next();
  }
};
