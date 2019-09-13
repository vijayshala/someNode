var ns = '[UserMiddleware]';
var request = require('request');
var jwtDecode = require('jwt-decode');
var logger = require('applogger');
var UserSchema = require('../schemas/UserSchema');
import {SecUserModel} from '../models/UserModel';
var config = require('../config/');
var constants = require('../config/constants');

function userNotFoundInDB(req, res, next, cookie, jwt){
  //get user from onesna
  logger.info(ns, 'No user found');
  var options = {
    url: config.urls.identityProviderApiURL + '/user/self/logan',
    headers: {
      'Authorization': 'jwt ' + cookie
    },
    accept: '*/*'
  };
  logger.info(req.requestId, ns, 'About to make a call to onesna');
  request.get(options, function (err, response) {
    if(err){
      logger.error(req.requestId, ns, 'Request to OnEsna failed', err);
      next();
    } else {
      if(response.error){
        logger.error(req.requestId, ns, 'OnEsna Error', error);
        next();
        return;
      } else {
        var accountUser = JSON.parse(response.body);
        var newUser = new UserSchema({
          accountId: jwt.user_id,
          account: accountUser,
          created: {
            by: null,
            on: new Date()
          }
        });
      }

      logger.info(req.requestId, ns, 'OnEsna Account: ', accountUser);
      newUser.save(function(err, theNewUser) {
        if(!err){
          logger.info(ns, 'newUser:', theNewUser);
          req.session.userInfo = {
            connected: true,
            created: new Date(),
            userId: theNewUser._id,
            accountId: jwt.user_id,
            username: accountUser.username,
            firstName: accountUser.name.givenname,
            lastName: accountUser.name.familyname,
            language: accountUser.languages[0].code,
            pictureURL: config.urls.identityProviderStorageURL + accountUser.picturefile
          }
          next();
        } else {
          logger.error(req.requestId, ns, 'User could not be created')
          next();
        }
      });
    }

  });
}


export function handleRequestUserInfo(req, res, next) {
  var cookies = req.cookies;
  //also try to grab the cookie from the header
  if(!cookies[constants.AUTH_TOKEN]){
    logger.info(req.requestId, ns, 'no cookie present');
    if(req.session.userInfo){
      req.session.userInfo =  req.userInfo = {
          connected:false
      };
    }
    next();
    return;
  }


  var cookie = cookies[constants.AUTH_TOKEN];
  var jwt = null;
  try {
    jwt = jwtDecode(cookie);
    logger.info(req.requestId, ns, 'Cookie found');
  } catch (e) {
    logger.error(req.requestId, ns, 'decoding jwt error:', e);
    next();
    return;
  }

  //check if there is a session with the onesna user_id
  if (req.session.userInfo && req.session.userInfo.connected) {
    req.userInfo = req.session.userInfo;
    logger.info(req.requestId, ns, 'User found in session');
    next();
    return;
  }


  // if there is no session find the user lo
  UserSchema.findOne({accountId: jwt.user_id}, function(err, user) {
    if(err){
      logger.error(req.requestId, ns, 'error: ', err);
      next();
      return;
    }

    //logger.info(ns, 'user:', user)

    if(!user){
      next();
      // userNotFoundInDB(req, res, next, cookie, jwt);
    } else {
      //set session for the found user
      // logger.info(req.requestId, ns, 'session found for the user', user);
      let userInfo = SecUserModel.FromAccountSchema(user);
      userInfo.connected = true;
      req.session.userInfo = req.userInfo = userInfo;
      next();
    }

  });

}

export default handleRequestUserInfo