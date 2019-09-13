const ns = '[kazoo.backend]';

const logger = require('../../../modules/logger');
const { KazooRequest, CheckKazooRequestApi } = require('../utils');
const { KAZOO_USER_TYPES } = require('../constants');
const config = require('../../../config');

export async function CreateAccount(data, options) {
    const fn = `[${options.requestId}]${ns}[CreateAccount]`;

    let payload = {
        data: {
            ...data,
            realm: '',  //TODO: data.domain,
            ui_restrictions: {
                my_account: {
                    user: {
                        show_tab: true
                    }
                },
                account: {
                    show_tab: false
                },
                billing: {
                    show_tab: false
                },
                balance: {
                    show_tab: false,
                    show_credit: false,
                    show_minutes: false
                },
                service_plan: {
                    show_tab: false
                },
                transactions: {
                    show_tab: false
                },
                inbound: {
                    show_tab: false
                },
                outbound: {
                    show_tab: false
                },
                twoway: {
                    show_tab: false
                },
                errorTracker: {
                    show_tab: false
                },
            },

        }
    };

    const reqOptions = {
        method: 'PUT',
        url: `/v2/accounts/${config.kazoo_de.accountId}`,
        body: payload,
        json: true
    };

    logger.info(fn, 'request:', reqOptions);

    const result = await KazooRequest(reqOptions, options);

    logger.info(fn, 'response:', result);
    //When create device we need get realm from options
    options.realm = result.data.realm;
    return result;
}

export async function UpdateAccount(accountId, data, options) {
    const fn = `[${options.requestId}]${ns}[UpdateAccount]`;

    let payload = {
        data: {
            ...data
        }
    };

    const reqOptions = {
        method: 'PATCH',
        url: `/v2/accounts/${accountId}`,
        json: true,
        body: payload
    };

    logger.info(fn, 'request:', reqOptions);

    const result = await KazooRequest(reqOptions, options);

    logger.info(fn, 'response:', result);

    return result;
}

export async function DeleteAccount(accountId, options) {
    const fn = `[${options.requestId}]${ns}[DeleteAccount]`;

    const reqOptions = {
        method: 'DELETE',
        url: `/v2/accounts/${accountId}`,
        json: true
    };

    logger.info(fn, 'request:', reqOptions);

    const result = await KazooRequest(reqOptions, options);

    logger.info(fn, 'response:', result);

    return result;
}

export async function CreateAccountLimits(accountId, data, options) {
    const fn = `[${options.requestId}]${ns}[CreateAccountLimits]`;

    let payload = {
        data: {
            ...data,
            id: 'limits',
        }
    };

    const reqOptions = {
        method: 'POST',
        url: `/v2/accounts/${accountId}/limits`,
        json: true,
        body: payload
    };

    logger.info(fn, 'request:', reqOptions);

    const result = await KazooRequest(reqOptions, options);

    logger.info(fn, 'response:', result);

    return result;
}

export async function CreateCallFlow(accountId, data, options) {
    const fn = `[${options.requestId}]${ns}[CreateCallFlow]`;

    let payload = {
        data: {
            ...data,
        }
    };

    const reqOptions = {
        method: 'PUT',
        url: `/v2/accounts/${accountId}/callflows`,
        json: true,
        body: payload
    };

    logger.info(fn, 'request:', reqOptions);

    const result = await KazooRequest(reqOptions, options);

    logger.info(fn, 'response:', result);

    return result;
}

export async function UpdateCallFlow(accountId, callflowId, data, options) {
    const fn = `[${options.requestId}]${ns}[UpdateCallFlow]`;

    let payload = {
        data: {
            ...data,
        }
    };

    const reqOptions = {
        method: 'POST',
        url: `/v2/accounts/${accountId}/callflows/${callflowId}`,
        json: true,
        body: payload
    };

    logger.info(fn, 'request:', reqOptions);

    const result = await KazooRequest(reqOptions, options);

    logger.info(fn, 'response:', result);

    return result;
}

export async function CreateAccountTemporalRules(accountId, data, options) {
    const fn = `[${options.requestId}]${ns}[CreateAccountTemporalRules]`;

    let payload = {
        data: {
            ...data,
        }
    };

    const reqOptions = {
        method: 'PUT',
        url: `/v2/accounts/${accountId}/temporal_rules`,
        json: true,
        body: payload
    };

    logger.info(fn, 'request:', reqOptions);

    const result = await KazooRequest(reqOptions, options);

    logger.info(fn, 'response:', result);

    return result;
}

export async function CreateAccountMenu(accountId, data, options) {
    const fn = `[${options.requestId}]${ns}[CreateAccountMenu]`;

    let payload = {
        data: {
            ...data,
        }
    };

    const reqOptions = {
        method: 'PUT',
        url: `/v2/accounts/${accountId}/menus`,
        json: true,
        body: payload
    };

    logger.info(fn, 'request:', reqOptions);

    const result = await KazooRequest(reqOptions, options);

    logger.info(fn, 'response:', result);

    return result;
}

export async function UpdateAccountMenu(accountId, menuId, data, options) {
    const fn = `[${options.requestId}]${ns}[UpdateAccountMenu]`;

    let payload = {
        data: {
            ...data,
        }
    };

    const reqOptions = {
        method: 'POST',
        url: `/v2/accounts/${accountId}/menus/${menuId}`,
        json: true,
        body: payload
    };

    logger.info(fn, 'request:', reqOptions);

    const result = await KazooRequest(reqOptions, options);

    logger.info(fn, 'response:', result);

    return result;
}

export async function GetAppStore(accountId, options) {
    const fn = `[${options.requestId}]${ns}[GetAppStore]`;

    const reqOptions = {
        method: 'GET',
        url: `/v2/accounts/${accountId}/apps_store`,
        json: true
    };

    logger.info(fn, 'request:', reqOptions);

    const result = await KazooRequest(reqOptions, options);

    logger.info(fn, 'response:', result);

    return result;
}

export async function ConfigureApp(accountId, appId, data, options) {
    const fn = `[${options.requestId}]${ns}[ConfigureApp]`;

    let payload = {
        data: {
            ...data,
        },
    }

    const reqOptions = {
        method: 'PUT',
        url: `/v2/accounts/${accountId}/apps_store/${appId}`,
        json: true,
        body: payload
    };

    logger.info(fn, 'request:', reqOptions);

    const result = await KazooRequest(reqOptions, options);

    logger.info(fn, 'response:', result);

    return result;
}

export async function CreateServicePlan(accountId, data, options) {
    const fn = `[${options.requestId}]${ns}[CreateServicePlan]`;

    let payload = {
        data: {
            ...data,
        }
    };

    const reqOptions = {
        method: 'PUT',
        url: `/v2/accounts/${accountId}/service_plans`,
        json: true,
        body: payload
    };

    logger.info(fn, 'request:', reqOptions);

    const result = await KazooRequest(reqOptions, options);

    logger.info(fn, 'response:', result);

    return result;
}

export async function BindServicePlan(accountId, servicePlanId, data, options) {
    const fn = `[${options.requestId}]${ns}[BindServicePlan]`;
    logger.info(fn, 'started..........');
    let payload = {
        data: {}
    }

    let url = `/v2/accounts/${accountId}/services/${servicePlanId}`;

    const testreqOptions = {
        method: 'POST',
        url: `/v2/garbageurlnwkjdnkjqnkdkdnkjn`,
        json: true,
        body: payload
    };

    const testresult = await CheckKazooRequestApi(testreqOptions, options);
    logger.info(fn, 'Api Version Result:', testresult);
    // check API version
    let apiVersion = testresult && testresult.body && testresult.body.version.split(".");
    const versionNumber = Number(apiVersion[0] + '.' + apiVersion[1]) || 0;
    logger.info(fn, 'versionNumber: ', versionNumber, 'API version: ', testresult && testresult.body && testresult.body.version);
    // roll back to the old 4.2 api is version number is less than 4.3
     if (versionNumber < 4.3 && versionNumber > 0) {
        logger.info(fn, 'Using API Version: 4.2');
        payload = {
            data: {
                ...data
            }
        }
        url = `/v2/accounts/${accountId}/service_plans/${servicePlanId}`;
    }


    logger.info(fn, 'payload:', payload);
    const reqOptions = {
        method: 'POST',
        url: url,
        json: true,
        body: payload
    };

    logger.info(fn, 'request:', reqOptions);

    const result = await KazooRequest(reqOptions, options);

    logger.info(fn, 'response:', result);

    return result;
}

export async function GetServicePlans(accountId, options) {
    const fn = `[${options.requestId}]${ns}[GetServicePlans]`;

    const reqOptions = {
        method: 'GET',
        url: `/v2/accounts/${accountId}/service_plans/available`,
        json: true
    };

    logger.info(fn, 'request:', reqOptions);

    const result = await KazooRequest(reqOptions, options);

    logger.info(fn, 'response:', result);

    return result;
}

export async function CreateServicePlanOverride(accountId, data, options) {
    const fn = `[${options.requestId}]${ns}[CreateServicePlanOverride]`;

    // let payload = {
    //     ...data,
    //     ...KAZOO_UI_METADATA
    // }

    let payload = {
        data: {
            ...data,
        }
    };

    const reqOptions = {
        method: 'POST',
        url: `/v2/accounts/${accountId}/service_plans/override`,
        json: true,
        body: payload
    };

    logger.info(fn, 'request:', reqOptions);

    const result = await KazooRequest(reqOptions, options);

    logger.info(fn, 'response:', result);

    return result;
}

export async function CreateUser(accountId, data, options) {
    const fn = `[${options.requestId}]${ns}[CreateUser]`;

    // let payload = {
    //     ...data,
    //     ...KAZOO_UI_METADATA
    // }
    let payload = {
        data: {
            ...data,
        }
    };

    const reqOptions = {
        method: 'PUT',
        url: `/v2/accounts/${accountId}/users`,
        json: true,
        body: payload
    };

    logger.info(fn, 'request:', reqOptions);

    const result = await KazooRequest(reqOptions, options);

    logger.info(fn, 'response:', result);

    return result;
}

export async function CreateVMBox(accountId, data, options) {
    const fn = `[${options.requestId}]${ns}[CreateVMBox]`;

    // let payload = {
    //     ...data,
    //     ...KAZOO_UI_METADATA
    // }
    let payload = {
        data: {
            ...data,
        }
    };

    const reqOptions = {
        method: 'PUT',
        url: `/v2/accounts/${accountId}/vmboxes`,
        json: true,
        body: payload
    };

    logger.info(fn, 'request:', reqOptions);

    const result = await KazooRequest(reqOptions, options);

    logger.info(fn, 'response:', result);

    return result;
}

export async function CreatUserDevice(accountId, data, options) {
    const fn = `[${options.requestId}]${ns}[CreatUserDevice]`;

    let payload = {
        data: {
            ...data,
        }
    };

    const reqOptions = {
        method: 'PUT',
        url: `/v2/accounts/${accountId}/devices`,
        json: true,
        body: payload
    };

    logger.info(fn, 'request:', reqOptions);

    const result = await KazooRequest(reqOptions, options);

    logger.info(fn, 'response:', result);

    return result;
}

async function GetServicePlanByName(accountId, servicePlans, name, options) {
    const fn = `[${options.requestId}]${ns}[GetServicePlanByName]`;

    if (!servicePlans) {
        servicePlans = await GetServicePlans(accountId, options);

        if (servicePlans && servicePlans.data) {
            servicePlans = servicePlans.data;
        }
    }

    for (let servicePlan of servicePlans) {
        if (servicePlan.name === name) {
            return servicePlan.id;
        }
    }

    logger.error(fn, 'service plan not found', servicePlans);
    throw new Error('Service plan not found.');
}

export async function CreateUserandConfigure(rootAccountId, accountId, inUser, options) {
    const fn = `[${options.requestId}]${ns}[CreateUserandConfigure]`;
    const Utils = require('../../../common/Utils');
    const { KAZOO_USER_TYPE_POWER } = require('../constants');

    const user = {
        ...{ firstName: `User ${inUser.ext}`, lastName: `User ${inUser.ext}` },
        ...inUser
    };

    let kazooUser, vmBox, callFlow;
    if (user.type) {
        const email = user.username || Utils.generateRandomEmail();

        let userData = {
            service: {
                plans: {}
            },
            caller_id: {
                internal: {
                    name: `${user.firstName} ${user.lastName}`,
                    number: user.ext.toString()
                }
            },
            accept_charges: true,
            presence_id: user.ext.toString(),
            priv_level: user.permission || 'user',
            feature_level: user.type,
            first_name: user.firstName,
            last_name: user.lastName,
            username: email,
            email: email,
            password: Utils.generateRandomString(8),
            vm_to_email_enabled: true,
            send_email_on_creation: true,
        };

        const userServicePlanId = user.servicePlan;
        userData.service.plans[userServicePlanId] = {
            account_id: rootAccountId,
            overrides: {}
        };

        kazooUser = await CreateUser(accountId, userData, options);

        if (user.type === KAZOO_USER_TYPE_POWER) {
            let vmBoxData = {
                mailbox: kazooUser.data.presence_id,
                name: `${user.firstName} ${user.lastName}`,
                owner_id: kazooUser.data.id
            };

            vmBox = await CreateVMBox(accountId, vmBoxData, options);
        }

        let callFlowData = {
            contact_list: {
                exclude: false
            },
            numbers: [kazooUser.data.presence_id],
            owner_id: kazooUser.data.id,
            type: 'mainUserCallflow',
            name: `${user.firstName} ${user.lastName} 's Callflow`,
            flow: {
                children: {
                    ...(vmBox ? {
                        _: {
                            children: {},
                            data: {
                                id: vmBox.data.id
                            },
                            module: 'voicemail'
                        }
                    } : {})
                },
                data: {
                    id: kazooUser.data.id,
                    can_call_self: false,
                    timeout: 20
                },
                module: 'user'
            }
        };

        callFlow = await CreateCallFlow(accountId, callFlowData, options);
    }

    let userDevice;
    if (user.device) {
        let deviceData = {
            ...(kazooUser ? { owner_id: kazooUser.data.id } : {}),
            device_type: 'sip_device',
            enabled: true,
            mac_address: '',
            name: user.device,
            sip: {
                method: 'password',
                password: Utils.generateRandomString(10),
                username: `kazoo_${Utils.generateRandomString(9, '0123456789')}`
            },
            suppress_unregister_notifications: false
        };

        userDevice = await CreatUserDevice(accountId, deviceData, options);
    }

    return {
        kazooUser: kazooUser && kazooUser.data,
        vmBox: vmBox && vmBox.data,
        callFlow: callFlow && callFlow.data,
        userDevice: userDevice && userDevice.data
    };
}

export async function CreateMedia(accountId, data, options) {
    const fn = `[${options.requestId}]${ns}[CreateMedia]`;

    let payload = {
        data: {
            ...data,
        }
    };

    const reqOptions = {
        method: 'PUT',
        url: `/v2/accounts/${accountId}/media`,
        json: true,
        body: payload
    };

    logger.info(fn, 'request:', reqOptions);

    const result = await KazooRequest(reqOptions, options);

    logger.info(fn, 'response:', result);

    return result;
}

export async function FindPhoneNumber(accountId, data, options) {
    const fn = `[${options.requestId}]${ns}[FindPhoneNumber]`;

    const reqOptions = {
        method: 'GET',
        url: `/v2/accounts/${accountId}/phone_numbers`,
        json: true,
        qs: {
            ...data
            //prefix:
            //quantity:
            //offset:
        }
    };

    logger.info(fn, 'request:', reqOptions);

    const result = await KazooRequest(reqOptions, options);

    logger.info(fn, 'response:', result);

    return result;
}

export async function ReservePhoneNumber(accountId, phoneNumber, options) {
    const fn = `[${options.requestId}]${ns}[ReservePhoneNumber]`;

    const reqOptions = {
        method: 'PUT',
        url: `/v2/accounts/${accountId}/phone_numbers/${phoneNumber}/reserve`,
        json: true
    };

    logger.info(fn, 'request:', reqOptions);

    const result = await KazooRequest(reqOptions, options);

    logger.info(fn, 'response:', result);

    return result;
}

export async function BuyPhoneNumber(accountId, phoneNumber, options) {
    const fn = `[${options.requestId}]${ns}[ReservePhoneNumber]`;

    const reqOptions = {
        method: 'PUT',
        url: `/v2/accounts/${accountId}/phone_numbers/${phoneNumber}/activate`,
        json: true
    };

    logger.info(fn, 'request:', reqOptions);

    const result = await KazooRequest(reqOptions, options);

    logger.info(fn, 'response:', result);

    return result;
}



// Provisioning	Create Account with all needed settings, Create Users,  Create Devices, Service Plan
// ReadAccount	Account, Serviceplan, Users, Devices, Features
// ChangeAccount	Account
// DeleteAccount	Delete complete account with users,devices,….
// AssignNumber	Assign numbers to account, Create Callflows
// ReassignNumber	Assign another numbers to account, Modify Callflows, …
// CreateUser	Add new User, add device, feature
// ChangeUser	Change Usertyp, Change Features
// DeleteUser	Remove User, Remove devices, Features…
// CreateDevice	Add new device, assign numbers, 
// ChangeDevice	Change device, assign/remove user, numbers, features
// DeleteDevice	Delete device, remove user assignment
	
	
// TrialProvisioning	Provisioning + AssignNumber + …
// TrialConvert	ChangeUser, ReassignNumber
// TrialCancel	ReleaseNumbers, DeleteAccount
	
	
	
	
	
	
	
	
	
	
	
	
	