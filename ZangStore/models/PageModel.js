var ns = '[PageModel]';
var logger = require('applogger');
var _  = require('lodash');
var DBWrapper = require('dbwrapper');


var PageSchema = require('../schemas/PageSchema')
var PageModel = {};


PageModel.getPage = function (req, slug, cb) {
  logger.info(req.requestId, ns, '[getPage]:slug', slug);
  DBWrapper.execute(PageSchema,PageSchema.findOne,req.requestId,{ slug: slug },cb);
};




module.exports = PageModel;
