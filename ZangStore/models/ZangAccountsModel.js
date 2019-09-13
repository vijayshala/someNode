const ns = '[ZangAccountsModel]'

import logger from 'applogger'
import _ from 'lodash'
import async from 'async'
import HttpRequest, { asyncHttpRequest } from '../modules/httprequest'

import config from '../config/'
import constants from '../config/constants'

function getAuthHeader(req) {
  return req ? 'jwt ' + req.cookies[constants.AUTH_TOKEN] : 'api_key ' + config.ACCOUNTS_API_KEY
}

exports.asyncGetCompaniesByRelation = async function (req, userId, relation) {
  let functionName = "[asyncGetCompaniesByRelation]"
  logger.info(req.requestId, ns + functionName)

  let requestOptions = {
    method: 'GET',
    url: config.urls.identityProviderApiURL + '/users/' + userId + '/companies/' + relation,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAuthHeader()
    }
  }
  
  let res = { data: [] };
  try {
    let { response, data } = await asyncHttpRequest(req.requestId, ns + functionName, requestOptions);
    if(response.statusCode !== 200 && response.statusCode !== 201){
      // throw Error({ error: response.statusCode })
      data=res;
    }
    return data;
  }
  catch(err) {
    logger.error(functionName, err);
  }
  return res;
}

exports.GetCompaniesByRelation = function (req, userId, relation, callback) {
  let functionName = "[GetCompaniesByRelation]"
  logger.info(req.requestId, ns + functionName)
  let requestOptions = {
    method: 'GET',
    url: config.urls.identityProviderApiURL + '/users/' + userId + '/companies/' + relation,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAuthHeader()
    }
  }

  HttpRequest(req.requestId, ns + functionName, requestOptions, (err, response, data) => {
    if(err){
      logger.error(req.requestId, ns, JSON.stringify(err))
      callback(err)
    } else {
      if(response.statusCode !== 200 && response.statusCode !== 201){
        callback(response.statusCode)
      } else {
        callback(null, data)
      }
    }
  })
}

exports.GetCompanyInfo = function (req, companyId,  callback) {
  let functionName = "[GetCompanyInfo]"
  logger.info(req.requestId, ns + functionName)

  let requestOptions = {
    method: 'GET',
    url: config.urls.identityProviderApiURL + '/companies/' + companyId,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAuthHeader()
    }
  }

  HttpRequest(req.requestId, ns + functionName, requestOptions, (err, response, data) => {
    if(err){
      callback(err)
    } else {
      if(response.statusCode !== 200 && response.statusCode !== 201){
        callback(response.statusCode)
      } else {
        callback(null, data)
      }
    }
  })
}

exports.GetCompanyLicenses = function (req, companyId, callback) {
  let functionName = "[GetCompanyLicenses]"
  logger.info(req.requestId, ns + functionName)

  let requestOptions = {
    method: 'GET',
    url: config.urls.identityProviderApiURL + '/companies/' + companyId + '/licenses',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAuthHeader()
    }
  }

  HttpRequest(req.requestId, ns + functionName, requestOptions, (err, response, data) => {
    if(err){
      callback(err)
    } else {
      if(response.statusCode !== 200 && response.statusCode !== 201){
        callback(response.statusCode)
      } else {
        callback(null, data)
      }
    }
  })
};

exports.CreateUpdateActiveLicense = function (req, license, callback) {
  let functionName = "[CreateUpdateLicense]"
  logger.info(req.requestId, ns + functionName)
  let parent_type = license.parent_type === "company" ? "companies" : "users"
  let requestOptions = {
    method: 'POST',
    url: config.urls.identityProviderApiURL + '/' + parent_type + '/' + license.parentid + '/licenses/activelicense',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAuthHeader()
    },
    body: JSON.stringify(license)
  }

  HttpRequest(req.requestId, ns + functionName, requestOptions, (err, response, data) => {
    if(err){
      callback(err)
    } else {
      if(response.statusCode !== 200 && response.statusCode !== 201){
        callback(response.statusCode)
      } else {
        callback(null, data)
      }
    }
  })

}

exports.GetActiveLicense = function (req, parentType, parentId, productType, callback) {
  let functionName = "[GetActiveLicense]"
  logger.info(req.requestId, ns + functionName)

  let requestOptions = {
    method: 'GET',
    url: config.urls.identityProviderApiURL + '/' + parentType + '/' + parentId + '/licenses/activelicense?product_type=' + productType,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAuthHeader()
    }
  }

  HttpRequest(req.requestId, ns + functionName, requestOptions, (err, response, data) => {
    if(err){
      callback(err)
    } else {
      if(response.statusCode !== 200 && response.statusCode !== 201){
        callback(response.statusCode)
      } else {
        callback(null, data)
      }
    }
  })

}

exports.asyncCreateCompany = async function (req, userId, company) {
  return new Promise((resolve, reject)=> {
    exports.CreateCompany(req, userId, company, (newCompanyErr, newCompanyRes) => {
      resolve({newCompanyErr, newCompanyRes})
    })
  })
}

exports.CreateCompany = function (req, userId, company, callback) {
  let functionName = "[CreateCompany]"
  logger.info(req.requestId, ns + functionName)
  let requestOptions = {
    method: 'PUT',
    url: config.urls.identityProviderApiURL + '/users/' + userId + '/companies',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAuthHeader()
    },
    body: JSON.stringify(company)
  }

  HttpRequest(req.requestId, ns + functionName, requestOptions, (err, response, data) => {
    if(err){
      callback(err)
    } else {
      if(response.statusCode !== 200 && response.statusCode !== 201){
        callback(response.statusCode)
      } else {
        callback(null, data)
      }
    }
  })
}


exports.asyncCreateCompanyDomain= async function (req, companyId, domain,) {
  return new Promise((resolve, reject)=> {
    exports.CreateCompanyDomain(req, userId, company, (newDomainErr, newDomainRes) => {
      resolve({newDomainErr, newDomainRes})
    })
  })
}
exports.CreateCompanyDomain = function (req, companyId, domain, callback) {
  let functionName = "[CreateCompanyDomain]"
  logger.info(req.requestId, ns + functionName)

  let requestOptions = {
    method: 'POST',
    url: config.urls.identityProviderApiURL + '/companies/' + companyId + '/unverifieddomains',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAuthHeader()
    },
    body: JSON.stringify(domain)
  }

  HttpRequest(req.requestId, ns + functionName, requestOptions, (err, response, data) => {
    if(err){
      callback(err)
    } else {
      if(response.statusCode !== 200){
        callback(response.statusCode)
      } else {
        callback(null, data)
      }
    }
  })
}

exports.asyncCheckDomain = async function (req, data) {
  let functionName = "[CheckDomain]"
  logger.info(req.requestId, ns + functionName)

  let requestOptions = {
    method: 'POST',
    url: config.urls.identityProviderApiURL + '/companies/checkdomain',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAuthHeader()
    },
    body: JSON.stringify(data)
  }
  
  try {
    let { response, data } = await asyncHttpRequest(req.requestId, ns + functionName, requestOptions);
    if(response.statusCode !== 200){
      return false;
    }
    return true;
  }
  catch(err) {
    logger.error(functionName, err);    
  }
  return false;
}

exports.CheckDomain = function (req, data, callback) {
  let functionName = "[CheckDomain]"
  logger.info(req.requestId, ns + functionName)

  let requestOptions = {
    method: 'POST',
    url: config.urls.identityProviderApiURL + '/companies/checkdomain',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAuthHeader()
    },
    body: JSON.stringify(data)
  }

  HttpRequest(req.requestId, ns + functionName, requestOptions, (err, response) => {
    if(response.statusCode === 200){
      callback(null)
    } else {
      callback(response.statusCode)
    }
  })
}
