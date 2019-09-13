const ns = '[legal.controller]';
const logger = require('applogger');

import { AVAILABLE_REGIONS, DEFAULT_REGION } from '../region/region.constants'

const { SalesModelBackend } = require('../salesmodel/salesmodel.backend');

const viewLegalPage = async (req, res, next) => {
    const fn = `[${req.requestId}]${ns}[viewLegalPage]`
    var region = req.params.region.toLowerCase();

    // if region isn't valid redirect to the default region
    if (!region || AVAILABLE_REGIONS.indexOf(region.toLowerCase()) == -1) {
        return res.redirect(`/${encodeURIComponent(DEFAULT_REGION)}/legal`);
    }

    logger.info(fn, 'region=', region);
    // load the region accordingly
    res.render(`legal/regions/${region}/LegalIndex`, { region })

}

const redirectLegalDoc = async (req, res, next) => {
    const fn = `[${req.requestId}]${ns}[redirectLegalDoc]`;
    logger.info(fn);
    var doc = req.params.doc;
    var url = '';
    // get the TOS from the db
    if (doc === 'general-tos') {
        var salesModel = await SalesModelBackend.find({
           legalDocuments: { $size: 2 } 
        })
        // get the TOS url from the database and render the html page
        url = salesModel[0] && salesModel[0].legalDocuments[1] && salesModel[0].legalDocuments[1].url;
        return res.redirect(url);
    } else {
        return res.redirect(`/${encodeURIComponent(DEFAULT_REGION)}/legal`);
    }
}

const viewLegalDocument = async (req, res, next) => {
    const fn = `[${req.requestId}]${ns}[viewLegalDocument]`
    var region = req.params.region.toLowerCase();
    var doc = req.params.doc;

    // if region isn't valid redirect to the default region
    if (!region || AVAILABLE_REGIONS.indexOf(region.toLowerCase()) == -1) {
        return res.redirect(`/${encodeURIComponent(DEFAULT_REGION)}/legal`);
    }

    logger.info(fn, 'doc route: ', doc);

    var url = '';
    // get the TOS from the db
    if (doc === 'general-tos') {
        var salesModel = await SalesModelBackend.find({
           legalDocuments: { $size: 2 } 
        })
        // get the TOS url from the database
        url = salesModel[0] && salesModel[0].legalDocuments[1] && salesModel[0].legalDocuments[1].url;
    }

    res.render(`legal/regions/${region}/index`, { doc, url })

}

module.exports = {
    viewLegalPage,
    viewLegalDocument,
    redirectLegalDoc
};
