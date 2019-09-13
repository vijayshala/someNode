/**
 * Return empty promise
 *
 * @return {Promise}
 */
const P = () => {
  const p = new Promise((resolve) => {
    resolve();
  });

  return p;
};

/**
 * Return promise which throws an error
 *
 * @return {Promise}
 */
const PE = (err) => {
  const p = new Promise((resolve, reject) => {
    reject(err);
  });

  return p;
};

/**
 * Sleep for ms milleseconds
 * @param  {Number} ms
 * @return {Promise}]
 */
const sleep = (ms) => {
  let p = new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });

  return p;
};

/**
 * Convert a blocking function to non-blocking
 *
 * Example:
 * // convert the function
 * const asyncLog = nonBlockify((...args) => {
 *   console.log(...args);
 * });
 *
 * // then later can use it in for-loop
 * for (let i of biga) {
 *   await asyncLog('>>', 1);
 * }
 *
 * @param  {Function} func
 * @return {Function}
 */
const nonBlockify = (func) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      try {
        const result = func(...args);
        setImmediate(() => {
          resolve(result);
        });
      } catch (err) {
        setImmediate(() => {
          reject(err);
        });
      }
    })
  };
};

const formatUSPhone = (str) => {
  var phoneTest = new RegExp(/^((\+1)|1)? ?\(?(\d{3})\)?[ .-]?(\d{3})[ .-]?(\d{4})( ?(ext\.? ?|x)(\d*))?$/);

  var results = phoneTest.exec(str);
  if (results !== null && results.length > 8) {
    return [
      '+1(',
      results[3],
      ') ',
      results[4],
      '-',
      results[5],
      (typeof results[8] !== 'undefined' ? ' x' + results[8] : ''),
    ].join('');
  }

  return str;
}

const triggerProvisionFailedEmail = (req, data) => {
  const fn = `[${req.requestId}]triggerProvisionFailedEmail]`;
  const taskqueue = require('../../../modules/taskqueue');

  data = Object.assign({
    baseUrl: req.baseUrl,
    region: req.region,
  }, data);

  taskqueue.launchDefer(req, 'PROVISIONING_FAILED_EMAIL', data, {
    defferOption: true,
    attempts: 3,
    delay: 10
  });
};

module.exports = {
  P,
  PE,

  sleep,
  nonBlockify,

  formatUSPhone,

  triggerProvisionFailedEmail,
};
