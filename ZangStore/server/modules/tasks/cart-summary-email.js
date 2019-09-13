const ns = '[global][tasks][cart-summary-email]';
const logger = require('applogger');
const util = require('util');
const fs = require('fs');

const handler = (src, data, cb) => {
  const fn = `[${src.requestId}]${ns}[processEvent]`;
  const Utils = require('../../../common/Utils');
  const U = require('../../modules/utils');
  const constants = require('../../../config/constants');
  const localizerUtil = require('../../../localizer/localizerUtil');
  const _ = require('lodash');

  logger.info(fn, 'started, data:', data);

  const cartId = data.cartId;

  const options = {
    requestId: src.requestId
  };

  let cart, user, html, newPdf, localizer, userId, userInfo;

  U.P()
  .then(async() =>  {
      const { CartBackend } = require('../../cart/cart.backend');
      const { UserBackend } = require('../../user/user.backend');

      cart = await CartBackend.findOneById(cartId, options);

      userId = cart && cart.created && cart.created.by;
      user = await UserBackend.findOneById(userId, options);

      userInfo = UserBackend.getBasicUserInfo(user, options);

      localizer = localizerUtil(userInfo.language);

      logger.info(fn, 'cart and user found');
  })
  .then(async()  =>{
    const currencyFormatter = require('currency-formatter');
    const { generateSubscriptionIdentifier } = require('../cart-salesmodel-rules/utils');
    const { template } = require('../email/templates/cart-summary');

    const compiled = _.template(template, {
        imports: {
          currency: (val) => currencyFormatter.format(val, { code: cart.currency }),
          generateSubscriptionIdentifier: generateSubscriptionIdentifier,
          L: localizer,
          LV: (val) =>
            (val && val.resource) ?
            localizer.get(val.resource) :
            ((val && val.text) ? val.text : ''),
        },
    });

    html = compiled({
        cart,
        hasOneTimeCharge: false,
        hasProvisioning: false,
        withExtraInfo: false, // FIXME
        details: { extraInfo: [] }, // FIXME
        supportEmail: constants.SUPPORT_EMAILS.CLOUD_CS, // FIXME
        region: data.region.toUpperCase()
    });

    logger.info(fn, 'html generated');
  })
  .then(async()    =>  {
    const pdf = require('html-pdf');
    const { masterTemplate } = require('../email/templates/master-template');

    const pdfOptions = {
        format: 'Letter',
        orientation: 'portrait',
        border: {
            top: '0in',
            right: '0in',
            bottom: '0in',
            left: '0in'
        },
        type: 'pdf',
        timeout: 100000        
    };
    try{
       fs.statSync('/usr/bin/phantomjs');
       pdfOptions['phantomPath'] = '/usr/bin/phantomjs';
    }
    catch(err){}

    try{
        await new Promise((resolve, reject)   =>  {
            pdf.create(masterTemplate(html), pdfOptions).toBuffer((err, buffer) =>    {
                if (err) return reject(err);
    
                newPdf = buffer;
                resolve();
            });
        });
        logger.info(fn, 'pdf generated to buffer');
    } catch(err)    {
        logger.error(fn, 'failed to generate pdf', err);
    }
  })
  .then(async() =>  {
    const sendgrid = require('../email/sendgrid');
    
    const setup = {
        requestId: options.requestId,
        toEmail: userInfo.username,
        files: [{
            name: `${localizer.get('CART_SUMMARY')}.pdf`,
            buffer: newPdf.toString('base64')
        }],
        subject: localizer.get('CART_SUMMARY'),
        summary: html,
        year: new Date().getUTCFullYear(),
        region: data.region.toUpperCase(),
        language: userInfo.language
    };

    await sendgrid.sendGenericEmail(setup);

    logger.info(fn, 'email sent');
  })
  .then(() => {
    logger.info(fn, 'completed');
    cb();
  })
  .catch((err) => {
    logger.error(fn, 'Error:', err);
    cb(err);
  })
};

module.exports = handler;
