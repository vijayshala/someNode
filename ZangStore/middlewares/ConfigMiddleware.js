var ns = '[ConfigMiddleware]';
var config = require('../config/');
var logger = require('applogger');
var url = require('url');
const currencyFormatter = require('currency-formatter');
var moment = require('moment')
var constants = require('../config/constants')
var DeveloperSchema = require('../schemas/DeveloperSchema')
import Utils from '../common/Utils'
var util = require('../modules/zgutilities');
var config = require('../config');
const { getSubMenu } = require('../server/webapp/webapp.controller');
import { getPublicConfigs } from '../models/SysConfigModel'


function fullUrl(req){
	  var theURL = url.format({
      protocol: req.protocol,
      host: req.headers.host
    });
	  theURL = theURL + req.originalUrl;
  return theURL;
}

function BaseUrl(req) {
	var theURL = url.format({
		protocol: req.protocol,
		host: req.headers.host
	});
	return theURL;
}


module.exports = function (req, res, next) {
	var currentURL = fullUrl(req);
	logger.info(req.requestId, ns, currentURL);
	res.locals.urls = config.urls;
	res.locals.urls.bucket = config.bucket
	res.locals.CONSTANTS = constants
	res.locals.siteURL = BaseUrl(req)
	res.locals.resolvePictureUrl = Utils.resolvePictureUrl
	res.locals.resolvePlanType = Utils.resolvePlanType
	res.locals.resolvePartnerType = Utils.resolvePartnerType
	res.locals.environment = config.environment
	//res.locals.reverseOrderEmailAddresses = constants.EMAIL_ADDRESSESES_TO_REVERSE
	res.locals.baseUrl = BaseUrl(req);
	res.locals.escapedCurrentURL = encodeURIComponent(currentURL);
	res.locals.currentURL = currentURL;
	res.locals.currency = {
		"value": "usd",
		"symbol": "$"
	}
  res.locals.formatCurrency = (val, currencyCode) => currencyFormatter.format(val, { code: currencyCode, format: '%s %v' });
	res.locals.moment = moment
	res.locals.UI_DATE_FORMAT = constants.UI_DATE_FORMAT
	res.locals.developers = []
	res.locals.requestId = req.requestId
	res.locals.idProviderUrl = util.getAccountsUrlFromRequest(req);
	res.locals.subMenus = getSubMenu(req);
	//res.locals.route = url.parse(req.url).pathname
	req.developers = []

getPublicConfigs({ id: req.requestId }, {}, function (sysCfgErr, sysConfigs) {
		// console.error('============sysConfigs:', sysConfigs);		
		res.locals.sysConfigs = sysConfigs;
		req.sysConfigs = sysConfigs;
	//if (config.environment != 'production')	{
		DeveloperSchema.find({}, function (err, developers) {
			if(err){
				return next();
			}
			developers.forEach((developer) => {
				req.developers.push(developer.email)
				res.locals.developers.push(developer.email)
			})
			return next();
		});
	// }
	// else{
	// 	return next();
	// }
})
};
