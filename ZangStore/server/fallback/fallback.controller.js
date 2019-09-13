const ns = '[order.controller]';
const logger = require('applogger');

const browserRedirect = async (req, res, next) => {
    const fn = `[${req.requestId}]${ns}[browserRedirect]`;

    logger.info(fn, 'browserRedirect');

    res.render('browserRedirect', {});

};


module.exports = {
    browserRedirect
};
