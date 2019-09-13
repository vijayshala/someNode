const ns = '[cart.utils]';
const logger = require('applogger');

const triggerCartSummaryTask = (req, data) => {
    const fn = `${ns}[triggerCartSummaryTask]`;

    const taskqueue = require('../../modules/taskqueue');

    logger.info(fn, 'Trigger a task to send cart summary email');
    let region = req.region || 'US';
    data.region = region;
    taskqueue.launchDefer(req, 'CART_SUMMARY_EMAIL', data, {
        defferOption: true,
        backoff_seconds: 300,
        attempts: 2
    });
}

module.exports = {
    triggerCartSummaryTask,
};