import cookie from 'react-cookie';
// import { CurrentViewer } from '../utils/currentViewer';
import logger from 'js-logger'

const ns = '[fetchRest]';

function gotoLogin(redirectUrl) {
  let loginUrl = redirectUrl.replace('{0}', escape(location.href));
  console.log('login url', loginUrl);  
  location.href = loginUrl;
}


export class FetchRest {
  constructor() {
    var csrf = document.querySelector('meta[name="csrf-token"]').getAttribute('content')
    this.headers = {
      // Authorization: `jwt ${
      //   process.env.REACT_APP_JWT !== 'false'
      //     ? process.env.REACT_APP_JWT
      //     : CurrentViewer.authToken ? CurrentViewer.authToken.token : ''
      // }`,
      'x-csrf-token': csrf, //cookie.load('_csrf'),
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
    this.method = 'GET';
  }

  setQuery(fullUrl, query) {
    if (!query) {
      return fullUrl;
    }

    let queryStr = '';
    Object.keys(query).map(
      key =>
      queryStr ?
      (queryStr += `&${key}=${query[key]}`) :
      (queryStr += `${key}=${query[key]}`)
    );
    return `${fullUrl}?${queryStr}`;
  }

  fetch(fullUrl, options, query) {
    return new Promise((resolve, reject) => {
      logger.info(ns, 'fetch', {
        fullUrl,
        options,
        query
      });
      fetch(this.setQuery(fullUrl, query), {
          headers: this.headers,
          method: this.method,
          credentials: "same-origin",
          ...options
        })
        .then(response => {
          if (response.status === 200) {
            response.json().then(resolve);
          } else {            
            response
              .json()
              .then(reason => {
                logger.error(ns, reason);
                if (response.status == 401) {
                  return gotoLogin(reason.redirect);
                }
                reject({
                  status: response.status,
                ...{ ...reason.error || {}}
                })
              })
              .catch(error=>
                reject({
                  status: response.status,
                ...{ ...response.error || {}}
                })
              );
          }
        })
        .catch(error => {
          logger.error(ns, 'fullUrl:', fullUrl, error);
          reject(error)
        });
    });
  }
}




