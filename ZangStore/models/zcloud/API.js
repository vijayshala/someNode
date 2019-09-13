const ns = '[zcloud][API]';

import logger from 'applogger';
import request from 'request'
import async from 'async';
import utils from '../../common/Utils';
import config from '../../config';
import esErr from '../../modules/errors';

const ZCloudAccountID = config.ZCloudAccountID;
const ZCloudAccountToken = config.ZCloudAccountToken;
const ZCloudHost = config.ZCloudHost;

const retryInterval = 30000;

exports.addPhoneNumber = (req, phoneNumber, xMLUrl = '', xMlMethod = 'GET', subscriptionId, cb)  =>  {
    var func = ns + '[addPhoneNumber]';

    logger.info(req.requestId, func, 'Buy phone number ', phoneNumber);
    
    let options = {
        method: 'POST',
        url: `https://${ZCloudHost}/v2/Accounts/${ZCloudAccountID}/IncomingPhoneNumbers.json`,
        auth: {
            user: ZCloudAccountID,
            pass: ZCloudAccountToken
        },
        json: true,
        form: {
            PhoneNumber: phoneNumber,
            FriendlyName: 'IPOffice_' + subscriptionId + '_' + config.environment,
            VoiceUrl: xMLUrl,
            VoiceMethod: xMlMethod
        }
    };

    logger.info(req.requestId, func, 'request ', options);

    async.retry({
        times: 3,
        interval: 500
    }, (callback)   =>  {
        request(options, (err, httpResponse, body)   =>{
            if (err || !httpResponse || httpResponse.statusCode != 200)    {
                logger.error(req.requestId, func, 'Bought phone number failed', JSON.stringify(httpResponse));
                return callback(new esErr.ESErrors('addPhoneNumber_fail', 'Bought phone number failed'));
            }
            logger.info(req.requestId, func, 'Bought phone number', httpResponse);
            callback(err, body);
        });
    },
    (err, result)   =>  {
        cb(err, result);
    });
};

exports.deletePhoneNumber = (req, sid, cb)  =>  {
    var func = ns + '[deletePhoneNumber]';
    logger.info(req.requestId, func, 'delete phone number ', sid);

    async.retry({
        times: 3,
        interval: retryInterval
    },
    (callback)  =>  {
        let options = {
            method: 'DELETE',
            url: `https://${ZCloudHost}/v2/Accounts/${ZCloudAccountID}/IncomingPhoneNumbers/${sid}.json`,
            auth: {
                user: ZCloudAccountID,
                pass: ZCloudAccountToken
            }
        };
    
        logger.info(func, 'options:', options);
    
        request(options, (err, httpResponse, body)   =>{
            if (err || !httpResponse || httpResponse.statusCode != 200)    {
                logger.error(req.requestId, func, 'Delete phone number failed', JSON.stringify(httpResponse));
                return callback(new esErr.ESErrors('deletePhoneNumber_fail', 'Bought phone number failed'));
            }
            logger.info(req.requestId, func, 'Delete phone number', httpResponse);
            callback(err, body);
        });
    },
    (err, result)   =>  {
        cb(err, result);
    });
};

exports.addPhoneNumberAny = (req, areaCode = '', xMLUrl = '', xMlMethod = 'GET', subscriptionId, cb)  =>  {
    var func = ns +  '[addPhoneNumberAny]';
    logger.info(req.requestId, func, 'Buy phone number, areacode:', areaCode);
    let options = {
        method: 'POST',
        url: `https://${ZCloudHost}/v2/Accounts/${ZCloudAccountID}/IncomingPhoneNumbers.json`,
        auth: {
            user: ZCloudAccountID,
            pass: ZCloudAccountToken
        },
        json: true,
        form: {
            AreaCode: areaCode,
            FriendlyName: 'IPOffice_' + subscriptionId + '_' + config.environment,
            VoiceUrl: xMLUrl,
            VoiceMethod: xMlMethod
        }
    };
    request(options, (err, httpResponse, body)   =>{
        if (err || !httpResponse || httpResponse.statusCode != 200)    {
            logger.error(req.requestId, func, 'Bought phone number failed', JSON.stringify(httpResponse));
            return cb(new esErr.ESErrors('addPhoneNumberAny_fail', 'Bought phone number failed'));
        }
        logger.info(req.requestId, func, 'Bought phone number', httpResponse);
        cb(err, body);
    });
};

exports.getPhoneNumber = (req, phoneNumber, cb)  =>  {
    var func = ns +  '[getPhoneNumber]';
    logger.info(req.requestId, func, 'Get phone number ', phoneNumber);
    let options = {
        method: 'GET',
        url: `https://${ZCloudHost}/v2/Accounts/${ZCloudAccountID}/IncomingPhoneNumbers.json`,
        auth: {
            user: ZCloudAccountID,
            pass: ZCloudAccountToken
        },
        json: true,
        qs: {
            Contains: phoneNumber
        }
    };
    request(options, (err, httpResponse, body)   =>{
        if (err || !httpResponse || httpResponse.statusCode != 200 || !body.incoming_phone_numbers || body.incoming_phone_numbers.length <= 0) {
            logger.error(req.requestId, func, 'Got phone number failed', JSON.stringify(httpResponse));
            return cb(new esErr.ESErrors('getPhoneNumber_fail', 'Got phone number failed'));
        }
        logger.info(req.requestId, func, 'Got phone number', httpResponse);
        cb(err, body.incoming_phone_numbers[0]);
    });
};

exports.getPhoneNumberBySubscriptionId = (req, subscriptionId, cb)  =>  {
    var func = ns +  '[getPhoneNumberBySubscriptionId]';
    logger.info(req.requestId, func, 'Get subscriptionId ', subscriptionId);
    let options = {
        method: 'GET',
        url: `https://${ZCloudHost}/v2/Accounts/${ZCloudAccountID}/IncomingPhoneNumbers.json`,
        auth: {
            user: ZCloudAccountID,
            pass: ZCloudAccountToken
        },
        json: true,
        qs: {
            FriendlyName: 'IPOffice_' + subscriptionId + '_' + config.environment,
        }
    };
    request(options, (err, httpResponse, body)   =>{
        if (err || !httpResponse || httpResponse.statusCode != 200 || !body.incoming_phone_numbers || body.incoming_phone_numbers.length <= 0) {
            logger.error(req.requestId, func, 'Got phone number failed', JSON.stringify(httpResponse));
            return cb(new esErr.ESErrors('getPhoneNumberBySubscriptionId_fail', 'Got phone number failed'));
        }
        logger.info(req.requestId, func, 'Got phone number', httpResponse);
        cb(err, body.incoming_phone_numbers[0]);
    });
};

exports.updatePhoneNumberBySid = (req, phoneSid, applicationSID, xmlUrl = '', xmlMethod = 'GET', cb)    =>  {
    var func = ns +  '[updatePhoneNumberBySid]';

    let formData;
    if (applicationSID) {
        formData = {
            VoiceApplicationSid: applicationSID
        };
    }
    else    {
        formData = {
            VoiceUrl: xmlUrl,
            VoiceMethod: xmlMethod
        };
    }

    async.retry({
        times: 3,
        interval: retryInterval
    },
    (callback)  =>  {
        let options = {
            method: 'POST',
            url: `https://${ZCloudHost}/v2/Accounts/${ZCloudAccountID}/IncomingPhoneNumbers/${phoneSid}.json`,
            auth: {
                user: ZCloudAccountID,
                pass: ZCloudAccountToken
            },
            json: true,
            form: formData
        };
    
        logger.info(func, 'options:', options);
    
        request(options, (err, httpResponse, body)   =>{
            if (err || !httpResponse || httpResponse.statusCode != 200)    {
                logger.error(req.requestId, func, 'Updated phone number failed', JSON.stringify(httpResponse));
                return callback(new esErr.ESErrors('updatePhoneNumber_fail', 'Updated phone number failed'));
            }
            logger.info(req.requestId, func, 'Updated phone number', httpResponse);
            callback(err, body);
        });
    },
    (err, result)   =>  {
        cb(err, result);
    });
};

exports.updatePhoneNumber = (req, phoneNumber, applicationSID, xMLUrl = '', xMlMethod = 'GET', subscriptionId, cb)  =>  {
    var func = ns +  '[updatePhoneNumber]';
    logger.info(req.requestId, func, 'Update phone number ', phoneNumber);

    var update = (phoneID) =>  {
        let formData;
        if (applicationSID) {
            formData = {
                VoiceApplicationSid: applicationSID
            };
        }
        else    {
            formData = {
                VoiceUrl: xMLUrl,
                VoiceMethod: xMlMethod
            };
        }
        
        async.retry({
            times: 3,
            interval: retryInterval
        },
        (callback)  =>  {
            let options = {
                method: 'POST',
                url: `https://${ZCloudHost}/v2/Accounts/${ZCloudAccountID}/IncomingPhoneNumbers/${phoneID}.json`,
                auth: {
                    user: ZCloudAccountID,
                    pass: ZCloudAccountToken
                },
                json: true,
                form: formData
            };
        
            request(options, (err, httpResponse, body)   =>{
                if (err || !httpResponse || httpResponse.statusCode != 200)    {
                    logger.error(req.requestId, func, 'Updated phone number failed', JSON.stringify(httpResponse));
                    return callback(new esErr.ESErrors('updatePhoneNumber_fail', 'Updated phone number failed'));
                }
                logger.info(req.requestId, func, 'Updated phone number', httpResponse);
                callback(err, body);
            });
        },
        (err, result)   =>  {
            cb(err, result);
        });
    };

    if (subscriptionId) {
        exports.getPhoneNumberBySubscriptionId(req, subscriptionId, (err, resp)  =>  {
            if (err || !resp.sid || resp.sid == '')    {
                return cb(err);
            }
            update(resp.sid);
        });
    }
    else    {
        exports.getPhoneNumber(req, phoneNumber, (err, resp) =>  {
            if (err || !resp.sid || resp.sid == '')    {
                return cb(err);
            }
            update(resp.sid);
        });
    }
};

exports.mapSIPtoACL = (req, aCLId, domainSID, cb)    =>  {
    var func = ns +  '[mapSIPtoACL]';
    async.retry({
        times: 3,
        interval: retryInterval
    },
    (callback)  =>  {
        let options = {
            method: 'POST',
            url: `https://${ZCloudHost}/v2/Accounts/${ZCloudAccountID}/SIP/Domains/${domainSID}/IpAccessControlListMappings.json`,
            auth: {
                user: ZCloudAccountID,
                pass: ZCloudAccountToken
            },
            json: true,
            form: {
                IpAccessControlListSid: aCLId
            }
        };

        logger.info(req.requestId, func, 'Map SIP domain to ACL ', options);

        request(options, (err, httpResponse, body)   =>{
            if (err || !httpResponse || httpResponse.statusCode != 200)    {
                logger.error(req.requestId, func, 'Mapped SIP domain to ACL failed', JSON.stringify(httpResponse));
                return callback(new esErr.ESErrors('mapSIPtoACL_fail', 'Mapped SIP domain to ACL failed'));
            }
            logger.info(req.requestId, func, 'Mapped SIP domain to ACL', httpResponse);
            callback(err, body);
        });
    },
    (err, result)   =>  {
        cb(err, result);
    });
};

exports.addIPtoACL = (req, ipAddress, subscriptionId, ipACLID, cb) =>  {
    var func = ns +  '[addIPtoACL]';
    async.retry({
        times: 3,
        interval: retryInterval
    },
    (callback)  =>  {
        let options = {
            method: 'POST',
            url: `https://${ZCloudHost}/v2/Accounts/${ZCloudAccountID}/SIP/IpAccessControlLists/${ipACLID}/IpAddresses.json`,
            auth: {
                user: ZCloudAccountID,
                pass: ZCloudAccountToken
            },
            json: true,
            form: {
                FriendlyName: 'IPOffice_' + subscriptionId + '_' + config.environment,
                IpAddress: ipAddress
            }
        };
    
        logger.info(req.requestId, func, 'Add IP to ACL ', options);
    
        request(options, (err, httpResponse, body)   => {
            if (err || !httpResponse || httpResponse.statusCode != 200)    {
                logger.error(req.requestId, func, 'Added IP to ACL failed', JSON.stringify(httpResponse));
                return callback(new esErr.ESErrors('addIPtoACL_fail', 'Added IP to ACL failed'));
            }
            logger.info(req.requestId, func, 'Added IP to ACL', httpResponse);
            callback(err, body);
        });
    },
    (err, result)   =>  {
        cb(err, result);
    });
};

exports.createApplication = (req, subscriptionId, xmlUrl = '', xmlMethod = 'GET', cb)   =>  {
    var func = ns +  '[createApplication]';

    async.retry({
        times: 3,
        interval: retryInterval
    },
    (callback)  =>  {
        let options = {
            method: 'POST',
            url: `https://${ZCloudHost}/v2/Accounts/${ZCloudAccountID}/Applications.json`,
            auth: {
                user: ZCloudAccountID,
                pass: ZCloudAccountToken
            },
            json: true,
            form: {
                FriendlyName: 'IPOffice_' + subscriptionId + '_' + config.environment,
                VoiceUrl: xmlUrl,
                VoiceMethod: xmlMethod
            }
        };
    
        logger.info(req.requestId, func, 'create Application ', options);
    
        request(options, (err, httpResponse, body)   =>{
            if (err || !httpResponse || httpResponse.statusCode != 200)    {
                logger.error(req.requestId, func, 'created Application failed', JSON.stringify(httpResponse));
                return callback(new esErr.ESErrors('createApplication_fail', 'created Application failed'));
            }
            logger.info(req.requestId, func, 'created Application success', httpResponse, 'body:', body);
            callback(err, body);
        });
    },
    (err, result)   =>  {
        cb(err, result);
    });
};

exports.deleteApplication = (req, applicationSID, cb)   =>  {
    var func = ns +  '[deleteApplication]';
    
    async.retry({
        times: 3,
        interval: retryInterval
    },
    (callback)  =>  {
        let options = {
            method: 'DELETE',
            url: `https://${ZCloudHost}/v2/Accounts/${ZCloudAccountID}/Applications/${applicationSID}.json`,
            auth: {
                user: ZCloudAccountID,
                pass: ZCloudAccountToken
            },
            json: true
        };
    
        logger.info(req.requestId, func, 'delete Application ', options);
    
        request(options, (err, httpResponse, body)   =>{
            if (err || !httpResponse || httpResponse.statusCode != 200)    {
                logger.error(req.requestId, func, 'deleted Application failed', JSON.stringify(httpResponse));
                return callback(new esErr.ESErrors('deleteApplication_fail', 'deleted Application failed'));
            }
            logger.info(req.requestId, func, 'deleted Application success', httpResponse, 'body:', body);
            callback(err, body);
        });
    },
    (err, result)   =>  {
        cb(err, result);
    });
};

exports.createACLIP = (req, subscriptionId, cb)  => {
    var func = ns +  '[createACLIP]';
    async.retry({
        times: 3,
        interval: retryInterval
    },
    (callback)  =>  {
        let options = {
            method: 'POST',
            url: `https://${ZCloudHost}/v2/Accounts/${ZCloudAccountID}/SIP/IpAccessControlLists.json`,
            auth: {
                user: ZCloudAccountID,
                pass: ZCloudAccountToken
            },
            json: true,
            form: {
                FriendlyName: 'IPOffice_' + subscriptionId + '_' + config.environment,
            }
        };
    
        logger.info(req.requestId, func, 'create IP ACL ', options);
    
        request(options, (err, httpResponse, body)   =>{
            if (err || !httpResponse || httpResponse.statusCode != 200)    {
                logger.error(req.requestId, func, 'created IP ACL failed', JSON.stringify(httpResponse));
                return callback(new esErr.ESErrors('createACLIP_fail', 'created IP ACL failed'));
            }
            logger.info(req.requestId, func, 'created IP ACL', httpResponse, 'body:', body);
            callback(err, body);
        });
    },
    (err, result)   =>  {
        cb(err, result);
    });
};

exports.deleteACLIP = (req, aclIPId, cb)  => {
    var func = ns +  '[deleteACLIP]';
    let options = {
        method: 'DELETE',
        url: `https://${ZCloudHost}/v2/Accounts/${ZCloudAccountID}/SIP/IpAccessControlLists/${aclIPId}.json`,
        auth: {
            user: ZCloudAccountID,
            pass: ZCloudAccountToken
        },
        json: true
    };

    logger.info(req.requestId, func, 'delete IP ACL ', options);

    request(options, (err, httpResponse, body)   =>{
        if (err || !httpResponse || httpResponse.statusCode != 200 || httpResponse.statusCode != 204) {
            logger.error(req.requestId, func, 'deleted IP ACL failed', JSON.stringify(httpResponse));
            return cb(new esErr.ESErrors('deleteACLIP_fail', 'deleted IP ACL failed'));
        }
        logger.info(req.requestId, func, 'deleted IP ACL', httpResponse, 'body:', body);
        cb(err, body);
    });
};

exports.createSIPDomain = (req, subscriptionId, xmlUrl = '', xmlMethod = 'GET', cb) =>  {
    var func = ns +  '[createSIPDomain]';

    async.retry({
        times: 3,
        interval: retryInterval
    },
    (callback)  =>  {
        let uid = utils.generateRandomString(5);
        let sipDomain = `ipoffice-${subscriptionId}-${config.environment}-${uid}`;

        let options = {
            method: 'POST',
            url: `https://${ZCloudHost}/v2/Accounts/${ZCloudAccountID}/SIP/Domains.json`,
            auth: {
                user: ZCloudAccountID,
                pass: ZCloudAccountToken
            },
            json: true,
            form: {
                DomainName: sipDomain,
                FriendlyName: 'IPOffice_' + subscriptionId + '_' + config.environment,
                VoiceUrl: xmlUrl,
                VoiceMethod: xmlMethod
            }
        };

        logger.info(req.requestId, func, 'create SIP domain', options);

        request(options, (err, httpResponse, body)    =>  {
            if (!err && httpResponse && httpResponse.statusCode == 400 && (body.code == 62007 || body.message == "Domain name is not available. Please pick another name")) {
                logger.info(req.requestId, func, 'Domain unavailable, try again');
                return callback(new esErr.ESErrors('createSIPDomain_unavailable', 'domain unavailable'));
            }
            if (err || !httpResponse || httpResponse.statusCode != 200)    {
                logger.error(req.requestId, func, 'created SIP domain failed', JSON.stringify(httpResponse));
                return callback(new esErr.ESErrors('createSIPDomain_fail', 'created SIP domain failed'));
            }
            logger.info(req.requestId, func, 'created SIP domain', httpResponse);
            callback(err, body);
        });
    },
    (err, result)   =>  {
        if (err)    {
            logger.error(req.requestId, func, 'created SIP domain failed');
            return cb(new esErr.ESErrors('created SIP domain failed'));
        }
        cb(err, result);
    });
};

exports.updateSIPDomain = (req, domainSid, xmlUrl = '', xmlMethod = 'GET', cb) =>  {
    var func = ns +  '[updateSIPDomain]';
    async.retry({
        times: 3,
        interval: retryInterval
    },
    (callback)  =>  {
        let options = {
            method: 'POST',
            url: `https://${ZCloudHost}/v2/Accounts/${ZCloudAccountID}/SIP/Domains/${domainSid}.json`,
            auth: {
                user: ZCloudAccountID,
                pass: ZCloudAccountToken
            },
            json: true,
            form: {
                VoiceUrl: xmlUrl,
                VoiceMethod: xmlMethod
            }
        };
    
        logger.info(req.requestId, func, 'update SIP domain:options', options);
    
        request(options, (err, httpResponse, body)    =>  {
            if (err || !httpResponse || httpResponse.statusCode != 200)    {
                logger.error(req.requestId, func, 'updated SIP domain failed', JSON.stringify(httpResponse));
                return callback(new esErr.ESErrors('updateSIPDomain_fail', 'updated SIP domain failed'));
            }
            logger.info(req.requestId, func, 'updated SIP domain', httpResponse);
            callback(err, body);
        });
    },
    (err, result)   =>  {
        cb(err, result);
    });
};

exports.deleteSIPDomain = (req, domainSid, cb) =>  {
    var func = ns +  '[deleteSIPDomain]';

    async.retry({
        times: 3,
        interval: retryInterval
    },
    (callback)  =>  {
        let options = {
            method: 'DELETE',
            url: `https://${ZCloudHost}/v2/Accounts/${ZCloudAccountID}/SIP/Domains/${domainSid}.json`,
            auth: {
                user: ZCloudAccountID,
                pass: ZCloudAccountToken
            },
            json: true
        };
    
        logger.info(req.requestId, func, 'delete SIP domain');
    
        request(options, (err, httpResponse, body)    =>  {
            if (err || !httpResponse || httpResponse.statusCode != 200) {
                logger.error(req.requestId, func, 'deleted SIP domain failed', JSON.stringify(httpResponse));
                return callback(new esErr.ESErrors('deleteSIPDomain_fail', 'deleted SIP domain failed'));
            }
            logger.info(req.requestId, func, 'deleted SIP domain', httpResponse);
            callback(err, body);
        });
    },
    (err, result)   =>  {
        cb(err, result);
    });
};

exports.findAvailablePhones = (req, country, type, areaCode, size, cb)  =>  {
    var func = ns +  '[findAvailablePhones]';
    let options = {
        method: 'GET',
        url: `https://${ZCloudHost}/v2/Accounts/${ZCloudAccountID}/AvailablePhoneNumbers/${country}/${type}.json`,
        auth: {
            user: ZCloudAccountID,
            pass: ZCloudAccountToken
        },
        json: true,
        qs: {
            PageSize: size,
            AreaCode: areaCode
        }
    };

    logger.info(req.requestId, func, 'Query phone numbers ', options);

    request(options, (err, httpResponse, body)    =>  {
        if (err || !httpResponse || httpResponse.statusCode != 200 || !body || !body.available_phone_numbers) {
            logger.error(req.requestId, func, 'Query available phone numbers failed', JSON.stringify(httpResponse));
            return cb(new esErr.ESErrors('findAvailablePhones_fail', 'Query available phone numbers failed'));
        }
        logger.info(req.requestId, func, 'Queried available phone numbers', httpResponse);
        cb(err, body);
    });
};


exports.checkNumberAvailability = (req, phoneNumber, country, type, cb)  =>  {
    var func = ns +  '[checkNumberAvailability]';
    let options = {
        method: 'GET',
        url: `https://${ZCloudHost}/v2/Accounts/${ZCloudAccountID}/AvailablePhoneNumbers/${country}/${type}.json`,
        auth: {
            user: ZCloudAccountID,
            pass: ZCloudAccountToken
        },
        json: true,
        qs: {
            Contains: phoneNumber,
            pageSize: 500
        }
    };

    logger.info(req.requestId, func, 'Query phone numbers ', options);

    request(options, (err, httpResponse, body)    =>  {
        if (err || !httpResponse || httpResponse.statusCode != 200 || !body || !body.available_phone_numbers) {
            logger.error(req.requestId, func, 'Query available phone numbers failed', JSON.stringify(httpResponse));
            return cb(new esErr.ESErrors('checkNumberAvailability_fail', 'Query available phone numbers failed'));
        }
        logger.info(req.requestId, func, 'Queried available phone numbers', httpResponse);
        cb(err, body);
    });
};

exports.createCredentialList = (req, subscriptionId, cb)  =>  {
    const func = `[${req.requestId}]${ns}[createCredentialList]`;

    async.retry({
        times: 3,
        interval: retryInterval
    },
    (callback)  =>  {
        const options = {
            method: 'POST',
            url: `https://${ZCloudHost}/v2/Accounts/${ZCloudAccountID}/SIP/CredentialLists.json`,
            auth: {
                user: ZCloudAccountID,
                pass: ZCloudAccountToken
            },
            json: true,
            form: {
                FriendlyName: 'IPOffice_' + subscriptionId + '_' + config.environment
            }
        };
    
        logger.info(func, 'create credential list', options);
    
        request(options, (err, httpResponse, body)    =>  {
            if (err || !httpResponse || httpResponse.statusCode != 200)    {
                logger.error(func, 'created credential list failed', httpResponse);
                return callback(new esErr.ESErrors('createCredList_fail', 'created credential list failed'));
            }
            logger.info(func, 'created credential list', httpResponse, 'body:', body);
            callback(err, body);
        });
    },
    (err, result)   =>  {
        cb(err, result);
    });
};

exports.createCredential = (req, subscriptionId, CLSid, username, password, cb)  =>  {
    const func = `[${req.requestId}]${ns}[createCredential]`;

    async.retry({
        times: 3,
        interval: retryInterval
    },
    (callback)  =>  {
        const options = {
            method: 'POST',
            url: `https://${ZCloudHost}/v2/Accounts/${ZCloudAccountID}/SIP/CredentialLists/${CLSid}/Credentials.json`,
            auth: {
                user: ZCloudAccountID,
                pass: ZCloudAccountToken
            },
            json: true,
            form: {
                Username: username,
                Password: password
            }
        };
    
        logger.info(func, 'create credential', options);
    
        request(options, (err, httpResponse, body)  =>  {
            if (err || !httpResponse || httpResponse.statusCode != 200)    {
                logger.error(func, 'created credential failed', httpResponse);
                return callback(new esErr.ESErrors('createCred_fail', 'created credential failed'));
            }
            logger.info(func, 'created credential', httpResponse, 'body:', body);
            callback(err, body);
        });
    },
    (err, result)   =>  {
        cb(err, result);
    });
};

exports.mapCredentialList = (req, subscriptionId, sipSID, credListSID, cb)  =>  {
    const func = `[${req.requestId}]${ns}[mapCredentialList]`;

    async.retry({
        times: 3,
        interval: retryInterval
    },
    (callback)  =>  {
        const options = {
            method: 'POST',
            url: `https://${ZCloudHost}/v2/Accounts/${ZCloudAccountID}/SIP/Domains/${sipSID}/CredentialListMappings.json`,
            auth: {
                user: ZCloudAccountID,
                pass: ZCloudAccountToken
            },
            json: true,
            form: {
                CredentialListSid: credListSID
            }
        };
    
        logger.info(func, 'create credential list map', options);
    
        request(options, (err, httpResponse, body)  =>  {
            if (err || !httpResponse || httpResponse.statusCode != 200)    {
                logger.error(func, 'created credential list map failed', httpResponse);
                return callback(new esErr.ESErrors('createCredListMap_fail', 'created credential list map failed'));
            }
            logger.info(func, 'created credential list map', httpResponse, 'body:', body);
            callback(err, body);
        });
    },
    (err, result)   =>  {
        cb(err, result);
    });
};

exports.deleteCredentialList = (req, credListSID, cb)   =>  {
    const func = `[${req.requestId}]${ns}[deleteCredentialList]`;

    async.retry({
        times: 3,
        interval: retryInterval
    },
    (callback)  =>  {
        const options = {
            method: 'POST',
            url: `https://${ZCloudHost}/v2/Accounts/${ZCloudAccountID}/SIP/CredentialLists/${credListSID}.json`,
            auth: {
                user: ZCloudAccountID,
                pass: ZCloudAccountToken
            },
            json: true
        };
    
        logger.info(func, 'delete credential list', options);
    
        request(options, (err, httpResponse, body)  =>  {
            if (err || !httpResponse || httpResponse.statusCode != 200)    {
                logger.error(func, 'deleted credential list map failed', httpResponse);
                return callback(new esErr.ESErrors('deleteCredListMap_fail', 'deleted credential list failed'));
            }
            logger.info(func, 'deleted credential list', httpResponse, 'body:', body);
            callback(err, body);
        });
    },
    (err, result)   =>  {
        cb(err, result);
    });
};