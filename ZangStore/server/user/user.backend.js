const ns = '[user.backend]';
const logger = require('applogger');
const { setUserLangauges } = require('../modules/zang-accounts');
const { DbBase } = require('../modules/db/index');
const { UserSchema } = require('./user.model');
const config = require('../../config');

class UserBackend extends DbBase {
  async setUserLanguages(user, options) {
    const fn = `[${options && options.requestId}]${ns}[setUserLanguages]`;
    let { languages } = options;
    logger.info(fn, options.data);
    const oldUser = await this.findOneById(user._id, options) || {};
    logger.info(fn, 'got oldUser', oldUser && oldUser.accountId);
    let updateUser = { ...oldUser, account: { ...(oldUser.account || {}), languages } };
    let savedUser = await this.findOneAndUpdate({
      '_id': user._id,
    }, updateUser, options);
    if (savedUser && savedUser.toObject) {
      // convert to plain object
      savedUser = savedUser.toObject();
    }
    let account = await setUserLangauges(options.requestId, oldUser.accountId, languages);
    logger.info(fn, 'after updating gaccount', account.id);
    return savedUser;
  }


  getBasicUserInfo(user, options) {
    const fn = `[${options && options.requestId}]${ns}[getBasicUserInfo]`;

    const userBasic = {
      userId: user._id,
      accountId: user.accountId,
      username: user.account.username,
      timezone: user.account.timezone,
      firstName: user.account.name.givenname,
      lastName: user.account.name.familyname,
      language: user.account.languages[0].code,
      pictureURL: config.urls.identityProviderStorageURL + user.account.picturefile 
    }

    return userBasic;
  }
  // export async function updateUserBillingInfo(req, userBillingInfo) {
  //   return await UserSchema.findOneAndUpdate({
  //     _id: req.userInfo.userId
  //   }, {
  //     $set: userBillingInfo
  //   }, {
  //     new: true
  //   });
  // }


  // export async function getViewrBillingInfo(req, res) {
  //   let fn = `[${req.requestId}]${ns}[getViewrBillingInfo]`
  //   let user = await UserSchema.findOne({
  //     _id: req.userInfo.userId
  //   })

  //   res.locals.userInfo.accountInformation = user.accountInformation ?
  //     user.accountInformation : {}
  //   res.locals.userInfo.billingInformation = user.billingInformation ?
  //     user.billingInformation : {}
  //   res.locals.userInfo.shippingInformation = user.shippingInformation ?
  //     user.shippingInformation : {}
  //   return {
  //     accountInformation: user.accountInformation ?
  //       user.accountInformation : {},
  //     billingInformation: user.billingInformation ?
  //       user.billingInformation : {},
  //     shippingInformation: user.shippingInformation ?
  //       user.shippingInformation : {}
  //   }
  // }

  async getUserBillingInformation(userId, options) {
    const fn = `[${options.requestId}]${ns}[getUserBillingInformation]`;

    const user = await this.findOneById(userId, options);

    const contact = {
      allowToContact: (user.accountInformation && user.accountInformation.allowToContact) !== false && (user.accountInformation && user.accountInformation.allowToContact) !== 'false',
      firstName: (user.accountInformation && user.accountInformation.firstName) || (user.account && user.account.name && user.account.name.givenname) || '',
      lastName: (user.accountInformation && user.accountInformation.lastName) || (user.account && user.account.name && user.account.name.familyname) || '',
      phone: (user.accountInformation && user.accountInformation.phoneNumber) || '',
      email: (user.accountInformation && user.accountInformation.emailAddress) || (user.account && user.account.username) || '',
    };
    const company = {
      nid: (user.accountInformation && user.accountInformation.companyId) || '',
      name: (user.accountInformation && user.accountInformation.companyName) || '',
      domain: (user.accountInformation && user.accountInformation.companyDomain) || '',
      industry: (user.accountInformation && user.accountInformation.industryType) || '',
      vatNumber: (user.accountInformation && user.accountInformation.vatNumber) || '',
      isIncorporated: (user.accountInformation && user.accountInformation.isIncorporated) || '',
    };
    const billingAddress = {
      address1: (user.billingInformation && user.billingInformation.billingAddress) || '',
      address2: '',
      city: (user.billingInformation && user.billingInformation.billingCity) || '',
      state: (user.billingInformation && user.billingInformation.billingStateProvince) || '',
      zip: (user.billingInformation && user.billingInformation.billingPostalCode) || '',
      country: (user.billingInformation && user.billingInformation.billingCountry) || '',
      billingCountryISO: (user.billingInformation && user.billingInformation.billingCountryISO) || '',
      billingStateProvinceISO: (user.billingInformation && user.billingInformation.billingStateProvinceISO) || '',
    };
    const shippingAddress = {
      address1: (user.shippingInformation && user.shippingInformation.shippingAddress) || '',
      address2: '',
      city: (user.shippingInformation && user.shippingInformation.shippingCity) || '',
      state: (user.shippingInformation && user.shippingInformation.shippingStateProvince) || '',
      zip: (user.shippingInformation && user.shippingInformation.shippingPostalCode) || '',
      country: (user.shippingInformation && user.shippingInformation.shippingCountry) || '',
      shippingCountryISO: (user.shippingInformation && user.shippingInformation.shippingCountryISO) || '',
      shippingStateProvinceISO: (user.shippingInformation && user.shippingInformation.shippingStateProvinceISO) || '',
    };

    const billingInfo = {
      contact,
      company,
      billingAddress,
      shippingAddress,
      paymentGateways: user.paymentGateways
    };

    logger.info(fn, 'user billing information', billingInfo);

    return billingInfo;
  }
}

let backend = new UserBackend(UserSchema, {});

module.exports = {
  UserBackend: backend,
};
