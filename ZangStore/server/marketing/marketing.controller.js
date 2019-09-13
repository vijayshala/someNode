const ns = '[marketing.controller]';
const logger = require('applogger');
import {  MARKETING_SUBROUTES } from './marketing.constants'
import { AVAILABLE_REGIONS, DEFAULT_REGION } from '../region/region.constants';


require('../offer/offer.routes.views');

const rootView = async (req, res, next) => {
  const fn = `[${req.requestId}]${ns}[rootView]`
  var region = req.params.region;  
  if (!region || AVAILABLE_REGIONS.indexOf(region.toLowerCase()) == -1) {
    region = DEFAULT_REGION;
  }
  return res.redirect(`/${region}`);
}


const view = async (req, res, next) => {
  const fn = `[${req.requestId}]${ns}[view]`
  var region = req.params.region;  
  if (!region || AVAILABLE_REGIONS.indexOf(region.toLowerCase()) == -1) {
    return res.redirect(`/${encodeURIComponent(DEFAULT_REGION)}`);
  }
  
  logger.info(fn, 'region=', region);
  let homeView = 'index'
  res.render(`marketing/regions/${region}/${homeView}`, {

  });
}


function removeTrailingSlash(url) {     
    return url.replace(/\/$/, "");
} 

const viewWithSlug = async (req, res, next) => {
  const fn = `[${req.requestId}]${ns}[viewWithSlug]`
  var region = req.params.region;
  if (!region || AVAILABLE_REGIONS.indexOf(region.toLowerCase()) == -1) {
    //RAY TODO: need to see if we need to just throw 404 or redirect?
    //this is issue with invalid public static files
    return res.redirect(`/${encodeURIComponent(DEFAULT_REGION)}`);
  }
  
//req.originalUrl.replace(`/${region}`, '')
  let slug = removeTrailingSlash(req.originalUrl) || '/';
  logger.info(fn, 'slug', slug);
  let view = MARKETING_SUBROUTES[slug.toLowerCase()];

  logger.info(fn, {
    slug,
    view
  })

  if (!view) {    
    return res.redirect(`/${encodeURIComponent(region)}`);
  }

  // return res.status(200).json({
  //   baseUrl: res.locals.baseUrl,
  //   currentUrl: res.locals.currentURL,
  //   originalUrl: req.originalUrl,
  //   slug,
  //   view
  // });

  logger.info(fn, 'region=', {
    baseUrl: res.locals.baseUrl,
    currentUrl: res.locals.currentURL,
    originalUrl: req.originalUrl,
    slug,
    view
  });  

  if (region == 'de') {
    return res.redirect(`/${encodeURIComponent(region)}/shop/configure/avaya-office-sb-de`);
  }

  res.render(`marketing/regions/${region}/${view}`, {

  });
}


module.exports = {
  view,
  rootView,
  viewWithSlug
};
