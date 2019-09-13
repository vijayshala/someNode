import logger from 'applogger'
import _ from 'lodash'
import request from 'request'

function generateHttpRequestID() {
  var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  var string_length = 10;
  var randomstring = '';
  for (var i=0; i<string_length; i++) {
    var rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum,rnum+1);
  }

  return randomstring;
}

export function asyncHttpRequest(requestId, ns, options) {
  return new Promise((resolve, reject) => {
    let httpRequestID = generateHttpRequestID()
    HttpRequest(requestId, ns, options, (err, response, data) => {
      if (err) {
        return reject(err)
      }
      try{        
        resolve({response, data});
      } catch(e) {
        logger.error(requestId, ns + ':JSON.parse-'+httpRequestID, e)
        reject(e);
      }      
    })
  })
}


function HttpRequest(requestId, ns, options, callback) {
  let httpRequestID = generateHttpRequestID()
  let requestOptions = _.extend({
    method: 'GET',
    url: "",
    headers: {
      'Content-Type': 'application/json'
    }
  }, options)

  logger.info(requestId, ns + ':RequestOptions-'+httpRequestID, JSON.stringify(requestOptions))

  request(requestOptions, (requestError, response, body) => {
    logger.info(requestId, ns + ':Response-'+httpRequestID, JSON.stringify(response))
    if(requestError){
       logger.error(requestId, ns + ':requestError-'+httpRequestID, JSON.stringify(requestError))
       callback(requestError, response, body)
    } else {
      let data = {}
      try{
        //logger.info(requestId, ns + ':Body', JSON.stringify(body))
        data = JSON.parse(body)
      } catch(e) {
        logger.error(requestId, ns + ':JSON.parse-'+httpRequestID, e)
        return callback(e, response, body)
      }

      callback(null, response, data)
    }
  })
}


export default HttpRequest