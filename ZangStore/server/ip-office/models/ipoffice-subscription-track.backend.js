const ns = '[ipoffice-subscription-track.backend]';
const logger = require('applogger');

const { DbBase } = require('../../modules/db/index');
const IPOfficeSubscriptionTrackSchema = require('./ipoffice-subscription-track.model');

const {
  IPOFFICE_SETTINGXML_NOT_CREATIION,
  IPOFFICE_SETTINGXML_CREATIION,
  IPOFFICE_PROVISIONING_COMPLETE,
  IPOFFICE_PROVISIONING_FAILED,
} = require('../../../modules/constants');

class IPOfficeSubscriptionTrackBackend extends DbBase {
  async findAllOfCustomerSettingNotCreated(options) {
    const query = {
      'settingxml_creation_meta.status': IPOFFICE_SETTINGXML_NOT_CREATIION,
    };
    const selection = {
      'settingxml_creation_meta': 1,
      SubscriptionID: 1
    };

    options = { ...options, select: selection, sort: { _id: 1 } };

    return await this.find(query, options);
  }

  async existsCustomerSettingNotCreated(options) {
    const query = {
      'settingxml_creation_meta.status': IPOFFICE_SETTINGXML_NOT_CREATIION,
    };

    options = { ...options, select: { _id: 1 }, ignoreNotFoundError: true };

    const result = await this.findOne(query, options);

    return !!result;
  }

  async markCustomerSettingCreated(id, options) {
    return await this.findOneAndUpdate({ _id: id }, {
      '$set': { 'settingxml_creation_meta.status': IPOFFICE_SETTINGXML_CREATIION, },
    }, options);
  }

  async existsReadyToProvision(options) {
    const query = {
      'settingxml_creation_meta.status': IPOFFICE_SETTINGXML_CREATIION,
    };

    options = { ...options, select: { _id: 1 }, ignoreNotFoundError: true };

    const result = await this.findOne(query, options);

    return !!result;
  }

  async findAllOfReadyToProvision(options) {
    const query = {
      'settingxml_creation_meta.status': IPOFFICE_SETTINGXML_CREATIION,
    };
    const selection = {
      'settingxml_creation_meta': 1,
      SubscriptionID: 1
    };

    options = { ...options, select: selection, sort: { _id: 1 } };

    return await this.find(query, options);
  }

  async markProvisionFailed(id, options)  {
    return await this.findOneAndUpdate({ _id: id }, {
      '$set': { 'settingxml_creation_meta.status': IPOFFICE_PROVISIONING_FAILED, },
    }, options);
  }

  async markProvisioningCompleted(id, options) {
    return await this.findOneAndUpdate({ _id: id }, {
      '$set': { 'settingxml_creation_meta.status': IPOFFICE_PROVISIONING_COMPLETE, },
    }, options);
  }
}

let backend = new IPOfficeSubscriptionTrackBackend(IPOfficeSubscriptionTrackSchema.IPOfficeSubscriptionTrackSchema, {});

module.exports = {
  IPOfficeSubscriptionTrackBackend: backend,
};
