const ns = '[event.hooks.update-user-info]';
const logger = require('applogger');

const processEvent = function(context, next) {
  const fn = `[${context.requestId}]${ns}[processEvent]`;
  const { BadRequestError } = require('../../error');
  const U = require('../../utils');
  const { UserBackend } = require('../../../user/user.backend');
  const order = context.order;
  const userId = context.user && (context.user._id || context.user.userId);

  logger.info(fn, 'started', 'order id=', order && order._id);
  if (!order) {
    return next(new BadRequestError('Cannot find order payload'));
  }

  const options = {
    requestId: context.requestId,
  };

  U.P()
    .then(async() => {
      const update = {
        accountInformation: {
          emailAddress: order.contact.email,
          phoneNumber: order.contact.phone,
          lastName: order.contact.lastName,
          firstName: order.contact.firstName,
          allowToContact: order.contact.allowToContact,

          companyDomain: order.company.domain,
          companyId: order.company.nid,
          companyName: order.company.name,
          industryType: order.company.industry,
          vatNumber: order.company.vatNumber,
          isIncorporated: order.company.isIncorporated,
        },
        shippingInformation: {
          shippingPostalCode: order.shippingAddress.zip || '',
          shippingStateProvince: order.shippingAddress.state || '',
          shippingStateProvinceISO: order.shippingAddress.stateISO || '',
          shippingCity: order.shippingAddress.city || '',
          shippingCountry: order.shippingAddress.country || '',
          shippingCountryISO: order.shippingAddress.countryISO || '',
          shippingAddress: order.shippingAddress.address1 || '',
        },
        billingInformation: {
          billingPostalCode: order.billingAddress.zip || '',
          billingStateProvince: order.billingAddress.state || '',
          billingStateProvinceISO: order.billingAddress.stateISO || '',
          billingCity: order.billingAddress.city || '',
          billingCountry: order.billingAddress.country || '',
          billingCountryISO: order.billingAddress.countryISO || '',
          billingAddress: order.billingAddress.address1 || '',
        },
      };

      const result = await UserBackend.findOneAndUpdate({ _id: userId }, {
        $set: update,
      }, options);

      logger.info(fn, 'update user info done');
    })
    .then(() => {
      next();
    })
    .catch(async(err) => {
      logger.error(fn, 'Error:', err);
      next(err);
    });
};

module.exports = processEvent;
