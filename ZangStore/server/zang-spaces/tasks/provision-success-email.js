const ns = '[zangs-spaces][tasks][provision-success-email]';
const logger = require('applogger');

const handler = (src, data, cb) => {
    const fn = `[${src.requestId}]${ns}[processEvent]`;
    const U = require('../../modules/utils');
  
    logger.info(fn, 'started, data:', data);

    U.P()
    .then(async() => {
        logger.info(fn, 'sending Spaces welcome email...');

        const sendgrid = require('../../modules/email/sendgrid');
        const emailConfig = {
            requestId: src.requestId,
            language: data.language,
            teamType: data.teamType,
            firstName: data.firstName,
            toEmail: data.toEmail,
            companyName: data.companyName,
            region: data.region,
            username: data.username
        };

        await sendgrid.sendZangSpacesWelcomeEmail(emailConfig);
        logger.info(fn, 'Spaces welcome email sent');
        cb();
    })
    .then(() =>  {
        cb();
    })
    .catch((err) => {
        logger.error(fn, 'Error:', err);
        cb(err);
    })
};

module.exports = handler;