const ns = '[zang-spaces][utils]';
const logger = require('applogger');

const config = require('../../config');

export const triggerZangSpacesSuccessEmail = async(req, data) => {
    const fn = `[${req.requestId}]${ns}[triggerZangSpacesSuccessEmail]`;
    const { TaskHelper } = require('../modules/utils/task-helper');
    const taskqueue = require('../../modules/taskqueue');
    
    logger.info(fn, 'Trigger a task to send success email.');
    taskqueue.launchDefer(req, 'ZangSpacesSuccessEmail', data, {
        defferOption: true,
        backoff_seconds: 300,
        attempts: 3,
        delay: config.environment == 'production' ? 86400 : 10      //24 hours on prod
    });
}; 