var ns = '[app]';

import express from 'express';
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var logger = require('applogger');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config/');
var constants = require('./config/constants') 
var Tuning = require('./common/Tuning');
var domain = require('domain');
var cors = require('cors');
var ExpressValidator = require('express-validator');
var mongodbAvaliable = false;


import {productionViews, buildViews} from './server/viewsPath'
//var expressLogger = require('express-logger');

import RequestIdMiddleware from './middlewares/RequestIdMiddleware'
import AuthenticationMiddleware from './middlewares/AuthenticationMiddleware'
import PermissionMiddleware from './middlewares/PermissionMiddleware'
import RegionMiddleware from './middlewares/RegionMiddleware'
import ConfigMiddleware from './middlewares/ConfigMiddleware'
import CartMiddleware from './middlewares/CartMiddleware'
import PartnerMiddleware from './middlewares/PartnerMiddleware'
import LocalizerMiddleware from './middlewares/LocalizerMiddleware'
import taskqueue from './modules/taskqueue';
import session from 'express-session';
import connectmongo from 'connect-mongo';

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception: ', err);
});
process.on('unhandledRejection', (reason, p) => {
  logger.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

const MongoStore = connectmongo(session);

var winstonStream = {
  write: function (message, encoding) {
    if (message.startsWith('31 ')) {
      logger.warn(message.substr(3));
    }
    else if (message.startsWith('36 ') || message.startsWith('32 ')) {
      logger.info(message.substr(3));
    }
    else {
      logger.warn(message.substr(3));
    }
  }
};

var applyMiddlewareUnless = (path, middleware)  =>  {
  return (req, res, next) =>  {
    if (req.path.match(path))  {
      return next();
    } else  {
      return middleware(req, res, next);
    }
  }
}

function serverAvaliale() {
  return mongodbAvaliable;
}

var app = express();

app.enable('trust proxy');


app.use('/health', function (req, res, next) {
  if (serverAvaliale()) {
		/* The example about how to launch a task.
		taskqueue.launchDefer(req,
				'tester',
				{},
				{defferOption: true,
         backoff_seconds: 10,
         attempts: 3,
         eta: "2016-10-19T22:58:00"
    });*/
    res.send('ok');
  }
  else {
    res.status(502).send('fail');
  }
});
// app.use((req, res, next) => {
//   console.log(`[middleware-tracking][${req.headers['x-cloud-trace-context']}] after /health`);
//   next();
// });

function requireHTTPS(req, res, next) {
  if (req.protocol == 'http' && req.url.indexOf('health') < 0 && req.headers.host.indexOf(':') < 0) {
    //FYI this should work for local development as well.
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
}
app.use(require('express-naked-redirect')());

// require('express-naked-redirect') caused bug if req.hostname is undefined  
// const subdomainParser = function() {
//   const parseDomain = require('parse-domain');
//   const parsedDomain = {};

//   return {
//     get: function(hostname) {
//       // Cache, Touch
//       if (parsedDomain[hostname] == undefined) {
//         try {
//           var ps = parseDomain(hostname);
//           parsedDomain[hostname] = [ps.subdomain, ps.domain + '.' + ps.tld];
//         } catch (e) {
//           parsedDomain[hostname] = [null, null];
//         }
//       }
//       return parsedDomain[hostname];
//     }
//   }
// }();
// app.use((req, res, next) => { //Transfer root domain to www subdomain
//   const hostname = req.headers.host || req.hostname;
//   if (!hostname) {
//     console.log(ns, 'cannot find hostname');
//     return next();
//   }

//   const domain = subdomainParser.get(hostname);
//   const status = 302;
//   const sub = 'www';

//   if (domain[0] == '') {
//     res.redirect(status, req.protocol + '://' + sub + '.' + domain[1] + req.url);
//     return;
//   }

//   next();
// });
// app.use((req, res, next) => {
//   console.log(`[middleware-tracking][${req.headers['x-cloud-trace-context']}] after express-naked-redirect`);
//   next();
// });
app.use(requireHTTPS);
// app.use((req, res, next) => {
//   console.log(`[middleware-tracking][${req.headers['x-cloud-trace-context']}] after requireHTTPS`);
//   next();
// });
app.use((req, res, next) => {
  var d = domain.create();
  d.add(req);
  d.add(res);
  d.on('error', function (err) {
    //Shutdown server gracefully

    if (app._server) {
      logger.info(ns, 'Happen uncaught error. The server is closed now, the process will shutdown after 1 minutes!');
      app._server.close(function () {
      });
      delete app._server;
      setTimeout(function () {
        process.exit(1)
      }, 60000);
      next(err);
    }
  });
  d.run(next);
})
// view engine setup
//req.app.get('appPath').replace('/build', '') +
var env = process.env.NODE_ENV || 'development';
let viewPath = path.join(__dirname, 'views');
if (env == 'development') {
  viewPath = path.join(__dirname.replace('build', 'src'), 'views');
  logger.info(ns, 'development viewPath:', viewPath);
  app.set('views', [
    viewPath,
    // ...buildViews
  ]);
}
else {
  logger.info(ns, 'production: viewPath:', viewPath);
  app.set('views', [
    viewPath,
    // ...productionViews
  ]);
}

app.set('view engine', 'jade');
// app.use((req, res, next) => {
//   console.log(`[middleware-tracking][${req.headers['x-cloud-trace-context']}] after view engine`);
//   next();
// });

//app.use(expressLogger({path: "./logs/logs.log"}));






// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
morgan.token('id', function getId(req) {
  return req.requestId;
});
morgan.format('store-onServer', function developmentFormatLine(tokens, req, res) {
  //get the status code if response written
  var status = res._header
    ? res.statusCode
    : undefined

  // get status color
  var color = status >= 500 ? 31 // red
    : status >= 400 ? 33 // yellow
      : status >= 300 ? 36 // cyan
        : status >= 200 ? 32 // green
          : 0 // no color

  // get colored function
  var fn = developmentFormatLine[color]

  if (!fn) {
    // compile
    fn = developmentFormatLine[color] = morgan.compile(color.toString() + ' reqId :id remote-addr :method :url status :status :remote-addr :remote-user ' +
      ':response-time ms :res[content-length] :referrer :user-agent')
  }

  return fn(tokens, req, res);
});


app.use(morgan('store-onServer', { stream: winstonStream }));
// app.use((req, res, next) => {
//   console.log(`[middleware-tracking][${req.headers['x-cloud-trace-context']}] after morgan`);
//   next();
// });
app.use(applyMiddlewareUnless('/api/webhook/billing/', function (req, res, next) {
  var jsonParser = bodyParser.json({limit:'1MB'});
  jsonParser(req, res, (err) => {
    if (err) {
      return res.status(400).json({ "code": "invalid_json_data", "message": "The data in body is not json" });
    }

    return next();
  });
}));
app.use(applyMiddlewareUnless('/api/webhook/billing/', bodyParser.urlencoded({ extended: false })));
app.use(ExpressValidator({
  errorFormatter: function (param, msg, value) {
    var namespace = param.split('.');
    var root = namespace.shift();
    var formParam = root;
    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }

    return {
      param: formParam,
      msg: msg,
      value: value
    }
  }
}));
app.use(cookieParser());
app.use(RequestIdMiddleware);
// app.use((req, res, next) => {
//   console.log(`[middleware-tracking][${req.headers['x-cloud-trace-context']}] after RequestIdMiddleware`);
//   next();
// });

var cache = "development" !== process.env.NODE_ENV;
app.use(express.static(path.join(__dirname, 'public'), {
  maxage: cache ? 604800000 : 0, //1 week
  etag: false,
  lastModified: false
}));

app.use(express.static(path.join(__dirname, 'public_nocache'), {
  maxage: 0
}));

app.get("/public_nocache/*", (req, res, next) => {
  //Ray: if the static file is not found
  //We intercept in this middle ware so we don't go to general
  // viewable Page Not Found
  //if static file is not found we will get here
  logger.warn(ns, req.originalUrl, 'not-found');
  res.status(404).send('NOT_FOUND');
});

// app.use((req, res, next) => {
//   console.log(`[middleware-tracking][${req.headers['x-cloud-trace-context']}] after static`);
//   next();
// });




//connect to mongoose
//mongoose.Promise = global.Promise;
mongoose.connect(config.mongo.uri, config.mongo.options);

mongoose.connection.on('connected', function () {
  logger.info(ns, 'Mongo DB connected.')
  logger.info(ns, 'Environment:' + config.environment + '.')
  mongodbAvaliable = true;
});

mongoose.connection.on('error', function (err) {
  logger.error(ns, 'Mongo DB error:' + err);
  mongoose.disconnect();
});

mongoose.connection.on('disconnected', function () {
  logger.warn(ns, 'Mongo DB disconnected. Reconnecting in ' + config.mongo.secondsToReconnect + ' seconds');
  mongodbAvaliable = false;
  setTimeout(function () {
    mongoose.connect(config.mongo.uri, config.mongo.oprions);
  }, config.mongo.secondsToReconnect * 1000)
});


// register product engine tasks
const productEnginesRegister = require('./server/modules/product-engines/register-tasks');
productEnginesRegister(taskqueue);

//enable cors
app.use(cors(constants.CORS_CFG))

//middlewares
app.use(session({
  secret: config.sessionSecret,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  resave: false,
  saveUninitialized: false,
  name: 'id',
  cookie: {
    path: '/',
    httpOnly: true,
    secure: config.environment != 'development' ? true : false,
    maxAge: 1000 * 60 * 60 * 24 //1 day
  }
}));

app.use(ConfigMiddleware);
app.use(applyMiddlewareUnless('/api/webhook/billing/', AuthenticationMiddleware));

app.use(PermissionMiddleware);
app.use(RegionMiddleware);
app.use(LocalizerMiddleware);
app.use(CartMiddleware);
app.use(PartnerMiddleware);

//routing
require('./api/routes')(app);
require('./routes')(app);

//Ray: we need to detect regioned-base vs not-regioned-based routes
// since we use req.params.region to set the viewer's current region (USER_REGION)
// so this middleware has to be last item 
// as we are tagging routeRootName to 'region' in regionHandler


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const { NotFoundError } = require('./server/modules/error');

  next(new NotFoundError());
});

app.use(function (err, req, res, next) {
  const status = (err && err.httpStatus) || 500;
  const code = (err && err.code) || (err && err.name) || 'uncaught error';
  const message = (err && err.message) || 'Uncaught error happened!';
  const stack = (err && err.stack && JSON.stringify(err.stack)) || null;
  const details = (err && err.details && JSON.stringify(err.details)) || null;
  logger.warn(`reqId: ${req.requestId} Uncaught error happend: status=${status}, code=${code}, message=${message}, details=${details}, stack=${stack}`);

  res.status(status);

  if (req.originalUrl.indexOf('/api') === 0 || req.originalUrl.indexOf('/clientapi') === 0) {
    res.headers = { 'Content-Type': "application/json" };
    res.json({
      error: {
        code,
        message,
        details: err && err.details,
      }
    });
  } else {
    res.render('error', {
      message,
      error: {
        code,
      }
    });
  }
});

module.exports = app;
