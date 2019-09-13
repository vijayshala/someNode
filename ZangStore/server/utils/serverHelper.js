import _ from 'lodash';
import querystring from 'querystring';
const logger = require('applogger');

export const createPaginationByPage = function (req, data) {
  const ns = '[createPaginationByPage]';
  let queryData = data.queryData;
  let results = data.results;
  var nextPageUrl = '';
  var previousPageUrl = '';
  var oriurl = req.originalUrl;
  logger.info(ns, ':queryData', queryData);
  // create the next page url
  if (queryData.size>=results.results.length){//results.havingNextPage
    nextPageUrl = oriurl.replace(/\?.*/, '');
    let nextPageUrlQueryStringObj = _.extend({}, queryData);
    nextPageUrlQueryStringObj.page = nextPageUrlQueryStringObj.page + 1;
    nextPageUrlQueryStringObj.prev = true;
    nextPageUrl += '?' + querystring.stringify(nextPageUrlQueryStringObj);
    logger.info(ns, ':nextPageUrl', nextPageUrl);
  }
  // create the prev page url
  if (queryData.page > 1 && results.results.length > 0){
    previousPageUrl = oriurl.replace(/\?.*/, '');
    let prevPageUrlQueryStringObj = _.extend({}, queryData);
    prevPageUrlQueryStringObj.page = prevPageUrlQueryStringObj.page - 1;
    prevPageUrlQueryStringObj.prev = (prevPageUrlQueryStringObj.page == 1 ? false : true);
    previousPageUrl += '?' + querystring.stringify(prevPageUrlQueryStringObj);
    logger.info(ns, ':previousPageUrl', previousPageUrl);
  }
  return {data: results.results, nextPageUrl:nextPageUrl, previousPageUrl:previousPageUrl, total:results.results.length};
}


export function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}