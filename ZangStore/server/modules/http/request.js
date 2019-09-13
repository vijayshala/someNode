const logger = require('applogger');

const request = require('request');

const httpRequest = (caller, options) => {
  const fn = `${caller}[httpRequest]`;

  return new Promise((resolve, reject) => {
    request(options, (err, response, body) => {
      if (err)  {
        logger.error(fn, 'error:', err);
        return reject(err);
      } else if (!response || !response.statusCode || response.statusCode < 200 || response.statusCode > 299)  {
        logger.error(fn, 'response not 2XX:', response);
        return reject(response);
      }

      return resolve(response);
    });
  });
};

module.exports = httpRequest;
