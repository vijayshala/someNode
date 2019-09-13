/**
 * Created by ericd on 26/11/2015.
 */
var ns = '[DBWrapper]';
var logger = require('applogger');
var mongoose = require('mongoose');
var esErr = require ('./errors');

var execute = function(scheme, schemeMethod, req_id){
  var cb = arguments[arguments.length - 1];
  arguments[arguments.length - 1] = function(err, result){
    if (err){
      if (err.name == 'ValidationError'){
        for (var field in err.errors) {
          var errorItem = err.errors[field];
          logger.error(ns, req_id, '[ValidationError]', err);
          return cb(new esErr.ESErrors(esErr.SchemaInvalidHeader + scheme.modelName + '.' + errorItem.path, errorItem.message || 'Happen invalid error'));
        }
      }
      if (err.code == '11000'){
        logger.error(ns, req_id, '[DBErrorDuplicateKey]', err);
        return cb(new esErr.ESErrors(esErr.DBErrorDuplicateKey, err.errmsg));
      }
      logger.error(ns, req_id, 'failed' ,err);
      return cb(new esErr.ESErrors(esErr.DBError));
    }
    return cb(null, result)
  }

  try{
    // Copy the following statements from Agenda!
    // Don't try and access Mongo Db if we've lost connection to it. Also see clibu_automation.js db.on.close code. NF 29/04/2015
    // Trying to resolve crash on Dev PC when it resumes from sleep.
    if (mongoose.connection.db.s.topology.connections().length === 0) {
      logger.warn(req_id, "The connection to mongodb produced an error, close connection and try later!");
      mongoose.disconnect();
      return cb(new esErr.ESErrors(esErr.DBError));
    }
    var args = Array.prototype.slice.call(arguments, 3);
    schemeMethod.apply(scheme, args);
  }
  catch(err){
  	logger.error(ns, req_id, 'call mongoose happen error ', err);
  	return cb(new esErr.ESErrors(esErr.DBError))
  }
}

module.exports = {
  execute: execute
}
