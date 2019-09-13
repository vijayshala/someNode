'use strict';

var    winston = require('winston');
const traceOnError = true;

var logger = new winston.Logger({
        levels: { error: 0, warn: 1, sync: 2, info: 3, verbose: 4, debug: 5, silly: 6},
        level: "info",
        colors: { sync: 'cyan'},
        exitOnError: false,
        transports: [
            new winston.transports.Console({
                timestamp: true,
                colorize: true,
                prettyPrint: true
            })
        ]

    });

var os = require('os');

[
    'info',
    'debug',
    'warn',
    'error',
    'sync',
    'verbose',
    'silly'
].forEach(function (method) {
    exports[method] = function () {
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(method);
        var newArgs = [];
        args.forEach(function (arg) {
        	if (typeof arg === 'undefined') {
		            return;
		        } else if (typeof arg === 'string') {
		            newArgs.push(arg);
		        } else if (!!arg && !!arg.toJSON) {
		            newArgs.push(JSON.stringify(arg.toJSON()));
		        } else if (!!arg && !!arg.toString && arg.toString() !== '[object Object]') {                
		            newArgs.push(arg.toString());
		        } else {
		            newArgs.push(JSON.stringify(arg));
		        }
		        if (method === 'error' && arg.stack){
		          newArgs.push(JSON.stringify(arg.stack));
		        }
	        });
        logger.log.apply(logger, newArgs);
    };
});
