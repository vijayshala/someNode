var ns = '[RegionMiddleware]';
var logger = require('applogger');
var constants =  require('../config/constants');
var UserSchema = require('../schemas/UserSchema');
var DBWrapper = require('dbwrapper');
const config = require('../config');
import { RegionBackend } from '../server/region/region.backend'

import { AVAILABLE_REGIONS, DEFAULT_REGION, isValidRegion, getRegionFromPath } from '../server/region/region.constants'

module.exports = async function (req, res, next) {
  let region = getRegionFromPath(req.path);

  let userRegion = isValidRegion(req.cookies['USER_REGION']);
  let viewerOrigin = isValidRegion(req.cookies['VIEWER_ORIGIN']);
  let isViewerSuppressed = req.cookies['SUPPRESS_SWITCHER'];
  region = (region || userRegion || viewerOrigin || DEFAULT_REGION).toLowerCase();
  logger.info(ns, 'region', {region, userRegion, viewerOrigin, isViewerSuppressed});
  let activeRegions = [];
  if (!viewerOrigin || (viewerOrigin.toLowerCase() != region && !isViewerSuppressed )) {
    activeRegions = await RegionBackend.find({ active: true });
  }

  let regionDetail = await RegionBackend.findByCode(region, {
    requestId: req.requestId,
    ignoreNotFoundError: true
  });
  
  req.region = region;
  req.regionDetail = regionDetail;
  res.locals.regionDetail = regionDetail;
  res.locals.viewerOrigin = viewerOrigin
  res.locals.region = region
  res.locals.activeRegions = activeRegions;
  // res.cookie('USER_REGION', region, { expires: new Date(Date.now() + (1000 * 60 * 60 * 24)), httpOnly: true, secure: config.environment !== 'development'});
  next();
};
