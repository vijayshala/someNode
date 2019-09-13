/**
 * Module dependencies.
 */
var ns = '[www]';
var app = require('../app');
var debug = require('debug')('zangstore:server');
var http = require('http');
var logger = require('applogger');
var config = require('../config/');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(config.port);
app.set('port', port);

/**
 * Create HTTP server.
 */
// var server = http.createServer((req, res) => {
//   console.log(`=============== [middleware-tracking][${req.headers['x-cloud-trace-context']}][start] "${req.method} ${req.protocol}://${req.headers.host} | ${req.hostname}/${req.url}" from ${req.headers['x-forwarded-for'] || req.connection.remoteAddress} with headers:`, JSON.stringify(req.headers));
//   app(req, res);
// });
var server = http.createServer(app);
app._server = server;

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ?
    'Pipe ' + port :
    'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(ns, bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(ns, bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ?
    'pipe ' + addr :
    'port ' + addr.port;
  //debug('Listening on ' + bind);
  logger.info(ns, 'Listening on port: ' + port);
}

process.on('uncaughtException', function (err) {
  logger.error(ns, 'There happen uncaught error', err.stack);
  server.close(function () {
    logger.info(ns, 'The server is closed now, the process will shutdown after 1 minutes!');
  });
  setTimeout(function () {
    process.exit(1);
  }, 60000);
});

process.on('SIGTERM', function () {
  logger.info(ns, 'The process get stop signal, try to close server and don\'t access any http request!')
  server.close(function () {
    logger.info(ns, 'The server is closed now, the process will shutdown after 1 minutes!');
  });
});
