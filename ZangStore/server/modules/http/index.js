const logger = require('applogger');

const request = require('request');

const httpRequest = (caller, options) => {
  const fn = `${caller}[httpRequest]`;

  const defaultOptions = {
    method: 'GET',
    url: '',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  options = options || {};
  options.headers = options.headers || {};

  const requestOptions = {
    ...defaultOptions,
    ...options,
    ...{ headers: { ...defaultOptions.headers, ...options.headers } }
  };
  logger.info(fn, 'options:', JSON.stringify(requestOptions));

  return new Promise((resolve, reject) => {
    request(requestOptions, (err, response, body) => {
      logger.info(fn, 'response:', JSON.stringify(response));

      if (err) {
        logger.error(fn, 'err:', err);
        return reject(err);
      }

      try {
        const responseIsJson = response.headers['content-type'] && response.headers['content-type'] === 'application/json';
        if (responseIsJson) {
          const data = JSON.parse(body);
          return resolve({ response, body: data, });
        } else {
          return resolve({ response, body, });
        }
      } catch (e) {
        logger.error(fn, 'parse body error:', e);
        return reject(e);
      }
    });
  });
};

module.exports = httpRequest;
