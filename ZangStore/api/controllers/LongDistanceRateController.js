import esErr from '../../modules/errors';
import cst from '../../modules/constants';
import logger from 'applogger';
import escapeStringRegexp from 'escape-string-regexp';
import {LongDistance} from '../models/Rate/LongDistance';
import querystring from 'querystring'
import rateLongDistance from '../../schemas/longDistanceRateSchema'; 

exports.import = function(req, res, next){
  let funcName = '[RateController.import] ';
  let lgdist = new LongDistance();
  lgdist.importFromGcs(req, 
    {provider: req.params.provider, file: req.body.file},
    (err, result) => {
      if (err){
        logger.error(req.requestId, funcName + `Failed to import data from gcs!`, err.message, err.stack);
        return res.status(cst.HttpErrorStatus).json(err);
      }
      else{
        return res.status(cst.HttpSuccessStatus).json({});
      }
    }
  )
}

exports.search = function(req, res, next){
  let funcName = '[RateController.search] ';
  const MAXSIZE = 100;
  const DEFAULT_PAGE = 0;
  //The search api is /api/rates/long-distance/search?from=us&prefix=84869&size=100&country=China&page=0

  let searchLimit ={
    size: parseInt(req.query.size) || MAXSIZE,
    page: parseInt(req.query.page) || DEFAULT_PAGE,
  };

  if (searchLimit.size > MAXSIZE){
    searchLimit.size = MAXSIZE;
  }

  let queryParmas = {    
    from: req.query.from || 'us',
    status: cst.RATE_LONGDISTC_IMPORT_READY_STATUS
  };

  if (req.query.prefix){
    queryParmas.prefix = req.query.prefix
  }
  if (req.query.countryName){
    if (req.query.countryNameAnchorBegin){
      let regexobj = new RegExp('^' + escapeStringRegexp(req.query.countryName));
      queryParmas.countryName = {'$regex': regexobj, $options: 'i'}
    } 
    else{ 
      queryParmas.countryName = {'$regex': escapeStringRegexp(req.query.countryName), $options: 'i'}
    }
  }
  
  let lgdist = new LongDistance();
  lgdist.search(req, {limit: searchLimit, query: queryParmas, sort: req.query.sort, project: {countryName: 1, from: 1, prefix: 1, cdefault: 1,  cfirstInc: 1, csecondInc:1, cinter:1, cintra:1}}, (err, results) => {
    let retresults = {
      data: [],
      nextPageUrl: '',
      prevPageUrl: ''
    };

    if (err){
      return res.status(cst.HttpSuccessStatus).json(retresults);
    }
    else{
      retresults.data = results.slice(0, searchLimit.size);
      if (results.length > searchLimit.size){
        req.query.page = searchLimit.page + 1;
        retresults.nextPageUrl = req.baseUrl + req.path + '?' + querystring.stringify(req.query);
      }
      if (searchLimit.page > 0){
        req.query.page = searchLimit.page - 1;
        retresults.prevPageUrl = req.baseUrl + req.path + '?' + querystring.stringify(req.query);
      }
      return res.status(cst.HttpSuccessStatus).json(retresults);
    }
  })
}