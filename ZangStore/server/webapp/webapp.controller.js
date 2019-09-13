const ns = '[webapp.controller]';
const logger = require('applogger');
var util = require('../../modules/zgutilities');
var url = require('url');
const { RegionBackend } = require('../region/region.backend');

import { ROUTES_SUBMENU } from '../marketing/marketing.constants'

const viewWebApp = async(req, res) => {
  const fn = `[${req.requestId}]${ns}[viewWebApp]`    
  let currentRegion = await RegionBackend.findByCode(req.region);
  res.render('webapp/AppView', {
    title: 'Shop',    
    error: false,
    preloadedData: {
      currentRegion,
      configurations: {
        urls: res.locals.urls
      }
    }
  });
}



const apiSubMenu = async (req, res) => {
  const fn = `[${req.requestId}]${ns}[apiSubMenu]`
  let route = req.params.route;      
  res.render('submenus/' + getSubMenu(req, route), {}, (err, html) => {
    logger.info(fn, 'html:', html);
    res.status(200).json({
      html
    });
  });
}


const getSubMenu = function (req, route='') {
  const fn = `[${req.requestId}]${ns}[getSubMenu]`
  route = route || url.parse(req.url).pathname;
  let submenu = route && ROUTES_SUBMENU[route] || 'blank'; 
  // logger.info(fn, 'route:', route, 'submenu:', submenu);
  return submenu;
}


module.exports = {
  viewWebApp,
  apiSubMenu,
  getSubMenu
};
