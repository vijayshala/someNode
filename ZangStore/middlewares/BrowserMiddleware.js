const ns = '[BrowserMiddleware]';
import logger from 'applogger';


module.exports = async (req, res, next) => {
    const fn = `[${req.requestId}]${ns}[Browser]`;
    logger.info(fn, req.requestId, 'Checking Browser...', req && req.headers);

    // if the user is visiting on internet explorer, redirect them
    if (req.headers && req.headers['user-agent'] && req.headers['user-agent'].length && (req.headers['user-agent'].indexOf("MSIE") >= 0 || req.headers['user-agent'].indexOf("Trident/") >= 0)) {
        logger.info(fn, req.requestId, 'Unsupported Browser Detected');
        // check to see if not found is in currentURL
        res.render('browserRedirect');
        return;
    }
    next();
};
