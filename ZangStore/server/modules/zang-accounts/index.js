const ns = '[zang-accounts]';
const logger = require('applogger');

const config = require('../../../config');

const http = require('../http');
const { ThirdPartyAPIError } = require('../error');

const getApiAuthHeader = () => {
  return 'api_key ' + config.ACCOUNTS_API_KEY;
}

const checkDomain = async(requestId, domain) => {
  const fn = `[${requestId}]${ns}[CheckDomain]`;
  logger.info(fn, 'start');

  let options = {
    method: 'POST',
    url: config.urls.identityProviderApiURL + '/companies/checkdomain',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getApiAuthHeader(),
    },
    body: JSON.stringify({ domain }),
  };

  try {
    let { response } = await http(fn, options);
    return response.statusCode === 200;
  } catch (err) {
    logger.error(fn, 'error:', err);
  }

  return false;
};

const getCompaniesByRelation = async(requestId, userId, relation) => {
  const fn = `[${requestId}]${ns}[getCompaniesByRelation]`;
  logger.info(fn, 'start');

  let options = {
    method: 'GET',
    url: config.urls.identityProviderApiURL + '/users/' + userId + '/companies/' + relation,
    headers: {
      'Content-Type': 'application/json',
      Authorization: getApiAuthHeader(),
    },
  };

  try {
    let { response, body } = await http(fn, options);
    if (response.statusCode === 200 || response.statusCode === 201) {
      return (body && body.data) || [];
    }
  } catch (err) {
    logger.error(fn, 'error:', err);
  }

  return [];
};

const getActiveLicenses = async(requestId, parentType, parentId, product) => {
  const fn = `[${requestId}]${ns}[getActiveLicenses]`;
  logger.info(fn, 'start');

  const parent_type = parentType === 'company' ? 'companies' : 'users';

  let options = {
    method: 'GET',
    url: `${config.urls.identityProviderApiURL}/${parent_type}/${parentId}/licenses/activelicense`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: getApiAuthHeader(),
    },
    qs: {
      product_type: product
    }
  };

  try {
    let { response, body } = await http(fn, options);
    if (response.statusCode === 200 || response.statusCode === 201) {
      return (body && body.data) || [];
    }
  } catch (err) {
    logger.error(fn, 'error:', err);
  }

  return [];
};

const createUpdateActiveLicense = async(requestId, license) => {
  const fn = `[${requestId}]${ns}[createUpdateActiveLicense]`;
  logger.info(fn, 'start');

  const parent_type = license.parent_type === 'company' ? 'companies' : 'users';

  let options = {
    method: 'POST',
    url: config.urls.identityProviderApiURL + '/' + parent_type + '/' + license.parentid + '/licenses/activelicense',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getApiAuthHeader(),
    },
    body: JSON.stringify(license),
  };

  try {
    let { response, body } = await http(fn, options);
    if (response.statusCode === 200 || response.statusCode === 201) {
      return body;
    } else {
      throw new ThirdPartyAPIError('Zang Accounts response failed.');
    }
  } catch (err) {
    logger.error(fn, 'error:', err);
    throw err;
  }
};

const createCompany = async(requestId, accountId, name) => {
  const fn = `[${requestId}]${ns}[createCompany]`;
  logger.info(fn, 'start');

  const company = {
    id: '',
    name,
    settings: {
      auth: {
        default_auth_type: 0
      }
    },
    domains: []
  };

  const options = {
    method: 'PUT',
    url: config.urls.identityProviderApiURL + '/users/' + accountId + '/companies',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getApiAuthHeader(),
    },
    body: JSON.stringify(company),
  };

  try {
    const { response, body } = await http(fn, options);
    if (response.statusCode === 200 || response.statusCode === 201) {
      return body;
    } else {
      throw new ThirdPartyAPIError('Zang Accounts response failed.');
    }
  } catch (err) {
    logger.error(fn, 'error:', err);
    throw err;
  }
};

const createCompanyDomain = async(requestId, companyId, domain, email) => {
  const fn = `[${requestId}]${ns}[createCompanyDomain]`;
  logger.info(fn, 'start');

  const data = {
    domain: domain,
    email: email,
    from_product_name: 'zangoffice', // FIXME
  };

  const options = {
    method: 'POST',
    url: config.urls.identityProviderApiURL + '/companies/' + companyId + '/unverifieddomains',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getApiAuthHeader(),
    },
    body: JSON.stringify(data),
  };

  try {
    const { response, body } = await http(fn, options);
    if (response.statusCode === 200) {
      return body;
    } else {
      throw new ThirdPartyAPIError('Zang Accounts response failed.');
    }
  } catch (err) {
    logger.error(fn, 'error:', err);
    throw err;
  }
};

const readUserInfo = async(requestId, userId) => {
  const fn = `[${requestId}]${ns}[readUserLangauge]`;
  logger.info(fn, 'start');
  const options = {
    method: 'GET',
    url: config.urls.identityProviderApiURL + '/users/' + userId + '',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getApiAuthHeader(),
    },
  };

  try {
    const { response, body } = await http(fn, options);
    if (response.statusCode === 200 || response.statusCode === 201) {
      return body;
    } else {
      throw new ThirdPartyAPIError('Zang Accounts response failed.');
    }
  } catch (err) {
    logger.error(fn, 'error:', err);
    throw err;
  }
};

const setUserLangauges = async(requestId, userId, languages=[]) => {
  const fn = `[${requestId}]${ns}[setUserLangauges]`;
  logger.info(fn, 'start');
  if (!userId || !languages.length) {
    throw new ThirdPartyAPIError(`invalid-params userId=${userId}, languages=${languages}`);
  }

  var userInfo = await readUserInfo(requestId, userId);
  userInfo.languages = languages;

  const options = {
    method: 'POST',
    url: config.urls.identityProviderApiURL + '/users/' + userId,
    headers: {
      'Content-Type': 'application/json',
      Authorization: getApiAuthHeader(),
    },
    body: JSON.stringify(userInfo),
  };

  try {
    const { response, body } = await http(fn, options);
    if (response.statusCode === 200 || response.statusCode === 201) {
      return body;
    } else {
      throw new ThirdPartyAPIError('Zang Accounts response failed.');
    }
  } catch (err) {
    logger.error(fn, 'error:', err);
    throw err;
  }
};

module.exports = {
  checkDomain,
  getCompaniesByRelation,
  getActiveLicenses,
  createUpdateActiveLicense,
  createCompany,
  createCompanyDomain,
  readUserInfo,
  setUserLangauges,
};
