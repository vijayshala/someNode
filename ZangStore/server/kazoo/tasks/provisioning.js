const ns = '[kazoo][tasks][provisioning]';
const logger = require('applogger');

const handler = (src, data, cb) => {
    const fn = `[${src.requestId}]${ns}[processEvent]`;
    const U = require('../../modules/utils');
    const config = require('../../../config');
    const { PRODUCT_ENGINE_NAME, PROVISION_STATUS_RUNNING, PROVISION_STATUS_COMPLETED, PROVISION_STATUS_FAILED } = require('../constants');
    const { PurchasedPlanBackend } = require('../../purchased-plan/purchased-plan.backend');
    const { OrderBackend } = require('../../order/order.backend');
    const { PartnerBackend } = require('../../partner/partner-agent.backend');
    const { UserBackend } = require('../../user/user.backend');

    logger.info(fn, 'started, data:', data);

    const options = {
        requestId: src.requestId,
        baseUrl: data.baseUrl
    };

    let apps = [], purchasedPlan, progress = {}, kazooItemIndex, updates = {}, userInfo, kazooItem;

    U.P()
        .then(async () => {
            const { cartHasProductsOf } = require('../../modules/cart-salesmodel-rules/utils');
            purchasedPlan = await PurchasedPlanBackend.findOne({
                _id: data.purchasedPlanId
            }, options);

            if (!purchasedPlan) {
                logger.warn(fn, 'purchased-plan not found');
                throw new Error('END_TASK');
            }

            const kazooItemIndexes = purchasedPlan && cartHasProductsOf(purchasedPlan, PRODUCT_ENGINE_NAME);

            if (purchasedPlan && !kazooItemIndexes) {
                logger.warn(fn, `No "${PRODUCT_ENGINE_NAME}" product found in purchased plan, skipped`);
                throw new Error('END_TASK');
            }

            kazooItemIndex = kazooItemIndexes[0];
            logger.info(fn, 'kazooItemIndex=', kazooItemIndex);
            kazooItem = purchasedPlan.items[kazooItemIndex];
            logger.info(fn, 'kazooItem=', kazooItem && kazooItem.identifier);

            let updates = {};
            updates[`items.${kazooItemIndex}.metadata.provisionStatus`] = PROVISION_STATUS_RUNNING;

            purchasedPlan = await PurchasedPlanBackend.findOneAndUpdate({
                _id: data.purchasedPlanId,
                'items.metadata.provisionStatus': {
                    $nin: [PROVISION_STATUS_RUNNING, PROVISION_STATUS_COMPLETED]
                }
            }, {
                    $set: updates
                }, options);

            if (!purchasedPlan) {
                logger.warn(fn, 'purchased-plan not found');
                throw new Error('END_TASK');
            }

            progress = kazooItem && kazooItem.metadata && kazooItem.metadata.kazoo || {};

            const userId = purchasedPlan && purchasedPlan.created && purchasedPlan.created.by;

            const user = await UserBackend.findOneById(userId, options);

            userInfo = UserBackend.getBasicUserInfo(user, options);

            logger.info(fn, 'got provisioning progress', progress);
        })
        .then(async () => {
            if (progress.account_id) {
                return;
            }
            const { CreateAccount } = require('../models/kazoo.backend');
            const Utils = require('../../../common/Utils');

            const kazooLang = ['en-US', 'de-DE'].indexOf(userInfo.language) > -1 ? userInfo.language : 'de-DE';

            const data = {
                name: `${purchasedPlan && purchasedPlan.company && purchasedPlan.company.name}_${Utils.generateRandomString(4)}`,
                timezone: 'Europe/Berlin',
                language: kazooLang,
                call_restriction: {
                    germany_international: {
                        action: 'inherit'
                    },
                    germany_premium: {
                        action: 'deny'
                    },
                    germany_special: {
                        action: 'deny'
                    },
                    germany_government: {
                        action: 'inherit'
                    },
                    germany_social: {
                        action: 'inherit'
                    },
                    germany_emergency: {
                        action: 'inherit' //DO NOT DISABLE THIS UNDER ANY CIRCUMSTANCE!!!
                    },
                    unknown: {
                        action: 'inherit'
                    },
                    germany_mobile: {
                        action: 'inherit'
                    }
                },
                number_features: {
                    e911_enabled: false,
                    cnam_enabled: false
                }
            };

            const result = await CreateAccount(data, options);

            progress.account_id = result.data.id;
            progress.account = result.data;

            updates[`items.${kazooItemIndex}.metadata.kazoo.account_id`] = progress.account_id;
            updates[`items.${kazooItemIndex}.metadata.kazoo.account`] = progress.account;
        })
        .then(async () => {
            logger.info(fn, 'provisioning success');

            purchasedPlan = await PurchasedPlanBackend.findOneAndUpdate({
                _id: purchasedPlan._id
            }, {
                    $set: updates,
                }, { ...options, new: true });

            updates = {};

            logger.info(fn, 'provisioning status updated');
        })
        .then(async () => {
            const kazooIdSent = kazooItem.metadata && kazooItem.metadata.kazooIdSent;
            if (kazooIdSent) {
                return;
            }
            const { SendOrderPayload } = require('../../billing/gsmb/gsmb.backend');

            await SendOrderPayload(purchasedPlan, options);

            updates[`items.${kazooItemIndex}.metadata.kazooIdSent`] = true;
        })
        .then(async () => {
            logger.info(fn, 'Started Binding Service Plan');
            if (progress.servicePlan) {
                return;
            }


            logger.info(fn, 'Account super admin:', progress.superduper_admin===true);
            //throw new Error('Cannot bind service plan, account super admin');
            

            const { KAZOO_DEFAULT_SERVICE_PLAN } = require('../constants');
            const { BindServicePlan, GetServicePlans } = require('../models/kazoo.backend');

            // const servicePlans = await GetServicePlans(progress.account_id, options);

            // progress.servicePlans = servicePlans.data || [];

            // let servicePlanId;
            // for (let servicePlan of progress.servicePlans)   {
            //     if (servicePlan.name === KAZOO_DEFAULT_SERVICE_PLAN)  {
            //         servicePlanId = servicePlan.id;
            //         break;
            //     }
            // }

            // if (!servicePlanId) {
            //     logger.error(fn, 'service plan not found', progress.servicePlans);
            //     throw new Error('Service plan not found.');
            // }

            const data = {
                id: KAZOO_DEFAULT_SERVICE_PLAN
            };
            logger.info(fn, 'Started Binding Service Plan - is admin');
            const servicePlan = await BindServicePlan(progress.account_id, KAZOO_DEFAULT_SERVICE_PLAN, data, { ...options, apiKey: config.kazoo_de.masterApiKey });

            progress.servicePlan = servicePlan && servicePlan.data;

            updates[`items.${kazooItemIndex}.metadata.kazoo.servicePlan`] = progress.servicePlan;

            logger.info(fn, 'binded service plan', progress.servicePlan);
        })
        .then(async () => {
            if (progress.limits) {
                return;
            }
            const { CreateAccountLimits } = require('../models/kazoo.backend');

            const data = {
                allow_prepay: true,
                inbound_trunks: 10,
                outbound_trunks: 10,
                twoway_trunks: 10,
            };

            const limits = await CreateAccountLimits(progress.account_id, data, options);

            progress.limits = limits && limits.data;

            updates[`items.${kazooItemIndex}.metadata.kazoo.limits`] = !!progress.limits;

            logger.info(fn, 'created account limits', progress.limits);
        })
        // .then(async()  =>  {
        //     if (progress.noMatchCallFlow)    {
        //         return;
        //     }
        //     const { CreateCallFlow } = require('../models/kazoo.backend');

        //     let data = {
        //         flow: {
        //             data: {},
        //             children: {},
        //             module: 'offnet'
        //         },
        //         numbers: ['no_match']
        //     };

        //     const callFlow = await CreateCallFlow(progress.account_id, data, options);

        //     progress.noMatchCallFlow = callFlow && callFlow.data;

        //     updates[`items.${kazooItemIndex}.metadata.kazoo.noMatchCallFlow`] = !!progress.noMatchCallFlow;

        //     logger.info(fn, 'created no match call flow', progress.noMatchCallFlow);
        // })
        // .then(async()  =>  {
        //     if (progress.featureCallFlows)    {
        //         return;
        //     }
        //     const { CreateCallFlow } = require('../models/kazoo.backend');
        //     const { KAZOO_CALL_FLOW_FEATURE_CODES } = require('../constants');

        //     for (let featureCode of KAZOO_CALL_FLOW_FEATURE_CODES)  {
        //         let data = {};

        //         if(featureCode.hasOwnProperty('actionName')){
        //             data.flow =  {
        //                 children: {},
        //                 module: featureCode.moduleName,
        //                 data: {
        //                     action: featureCode.actionName,
        //                     ...featureCode.extraData
        //                 }
        //             };
        //         }

        //         if(featureCode.hasOwnProperty('pattern')){
        //             data.patterns = [featureCode.pattern];
        //         } else {
        //             data.numbers = [featureCode.callflowNumber];
        //         }

        //         try{
        //             await CreateCallFlow(progress.account_id, data, options);
        //         } catch(err)    {
        //             logger.warn(fn, 'failed to create callflow', JSON.stringify(err));
        //         }
        //     }

        //     progress.featureCallFlows = true;

        //     updates[`items.${kazooItemIndex}.metadata.kazoo.featureCallFlows`] = progress.featureCallFlows;

        //     logger.info(fn, 'created feature call flows', progress.featureCallFlows);
        // })
        // .then(async()   =>  {
        //     if (progress.mainConferenceCallFlow)    {
        //         return;
        //     }
        //     const { CreateCallFlow } = require('../models/kazoo.backend');

        //     let data = {
        //         contact_list: {
        //             exclude: false
        //         },
        //         numbers: ['undefinedconf'],
        //         name: 'MainConference',
        //         type: 'conference',
        //         flow: {
        //             children: {},
        //             data: {},
        //             module: 'conference'
        //         }
        //     };

        //     const callFlow = await CreateCallFlow(progress.account_id, data, options);

        //     progress.mainConferenceCallFlow = callFlow && callFlow.data;

        //     updates[`items.${kazooItemIndex}.metadata.kazoo.mainConferenceCallFlow`] = !!progress.mainConferenceCallFlow;

        //     logger.info(fn, 'created main conference call flow', progress.mainConferenceCallFlow);
        // })
        // .then(async()   =>  {
        //     if (progress.mainFaxCallflow)    {
        //         return;
        //     }
        //     const { CreateCallFlow } = require('../models/kazoo.backend');

        //     let data = {
        //         contact_list: {
        //             exclude: false
        //         },
        //         numbers: ['undefinedfaxing'],
        //         name: 'MainFaxing',
        //         type: 'faxing',
        //         flow: {
        //             children: {},
        //             data: {},
        //             module: 'faxbox'
        //         }
        //     };

        //     const callFlow = await CreateCallFlow(progress.account_id, data, options);

        //     progress.mainFaxCallflow = callFlow && callFlow.data;

        //     updates[`items.${kazooItemIndex}.metadata.kazoo.mainFaxCallflow`] = !!progress.mainFaxCallflow;

        //     logger.info(fn, 'created main fax call flow', progress.mainFaxCallflow);
        // })
        // .then(async()   =>  {
        //     if (progress.temporalRules)    {
        //         return;
        //     }
        //     const { CreateAccountTemporalRules } = require('../models/kazoo.backend');
        //     const { KAZOO_TEMPORAL_RULES_LABELS } = require('../constants');

        //     for (let label of KAZOO_TEMPORAL_RULES_LABELS)  {
        //         const data = {
        //             cycle: 'weekly',
        //             interval: 1,
        //             name: label,
        //             type: 'main_weekdays',
        //             time_window_start: 32400,   //9am
        //             time_window_stop: 61200, //5pm
        //             wdays: [label.substring(4).toLowerCase()]
        //         };

        //         try{
        //             await CreateAccountTemporalRules(progress.account_id, data, options);
        //         } catch(err)    {
        //             logger.warn(fn, 'failed to create temporal rule', JSON.stringify(err));
        //         }
        //     }

        //     progress.temporalRules = true;

        //     updates[`items.${kazooItemIndex}.metadata.kazoo.temporalRules`] = progress.temporalRules;

        //     logger.info(fn, 'created temporal rules', progress.temporalRules);
        // })
        .then(async () => {
            if (progress.configureApps) {
                return;
            }
            const { GetAppStore, ConfigureApp } = require('../models/kazoo.backend');
            const { KAZOO_PROVISION_APPS } = require('../constants');

            const appsresult = await GetAppStore(progress.account_id, options);

            for (let app of appsresult.data) {
                if (app.name === KAZOO_PROVISION_APPS.userportal) {
                    let data = {
                        allowed_users: 'all',
                        users: []
                    };

                    apps.push(app);

                    await ConfigureApp(progress.account_id, app.id, data, options);
                } else if (app.name === KAZOO_PROVISION_APPS.smartpbx) {
                    let data = {
                        allowed_users: 'admins',
                        users: []
                    };

                    apps.push(app);

                    await ConfigureApp(progress.account_id, app.id, data, options);
                }
            }

            progress.configureApps = apps;

            updates[`items.${kazooItemIndex}.metadata.kazoo.configureApps`] = !!progress.configureApps;

            logger.info(fn, 'configured apps', progress.configureApps);
        })
        // .then(async()   =>  {
        //     if (progress.menuCallFlows)    {
        //         return;
        //     }
        //     const { CreateCallFlow, CreateAccountMenu } = require('../models/kazoo.backend');
        //     const { KAZOO_CALL_FLOW_LABELS, KAZOO_MAIN_OPEN_HOURS } = require('../constants');
        //     const Utils = require('../../../common/Utils');


        //     for (let label of KAZOO_CALL_FLOW_LABELS)   {
        //         let data = {
        //             name: `${label}Menu`,
        //             record_pin: Utils.generateRandomString(4, "0123456789"),
        //             media: {
        //                 exit_media: true,
        //                 invalid_media: true,
        //                 transfer_media: true
        //             },
        //             retries: 3,
        //             max_extension_length: 4,
        //             type: 'main'
        //         };

        //         const menu = await CreateAccountMenu(progress.account_id, data, options);

        //         let menuCallFlowData = {
        //             contact_list: {
        //                 exclude: false
        //             },
        //             numbers: [menu.data.name],
        //             type: 'main',
        //             flow: {
        //                 children: {},
        //                 data: {
        //                     id : menu.data.id
        //                 },
        //                 module: 'menu'
        //             }
        //         };

        //         const menuCallFlow = await CreateCallFlow(progress.account_id, menuCallFlowData, options);

        //         let callFlowData = {
        //             contact_list: {
        //                 exclude: false
        //             },
        //             numbers: [label],
        //             type: 'main',
        //             flow: {
        //                 children: {},
        //                 data: {
        //                     id : menuCallFlow.data.id
        //                 },
        //                 module: 'callflow'
        //             }
        //         };

        //         const callFlow = await CreateCallFlow(progress.account_id, callFlowData, options);

        //         if (label === KAZOO_MAIN_OPEN_HOURS)  {
        //             progress.mainOpenHours = {...progress.mainOpenHours};
        //             progress.mainOpenHours.menu = menu && menu.data;
        //             progress.mainOpenHours.menuCallFlow = menuCallFlow && menuCallFlow.data;
        //             progress.mainOpenHours.callFlow = callFlow && callFlow.data;
        //             updates[`items.${kazooItemIndex}.metadata.kazoo.mainOpenHours.menu`] = progress.mainOpenHours.menu;
        //             updates[`items.${kazooItemIndex}.metadata.kazoo.mainOpenHours.menuCallFlow`] = progress.mainOpenHours.menuCallFlow;
        //             updates[`items.${kazooItemIndex}.metadata.kazoo.mainOpenHours.callFlow`] = progress.mainOpenHours.callFlow;
        //         }
        //     }

        //     progress.menuCallFlows = true;

        //     updates[`items.${kazooItemIndex}.metadata.kazoo.menuCallFlows`] = progress.menuCallFlows;

        //     logger.info(fn, 'created menu call flows', progress.menuCallFlows);
        // })
        .then(async () => {
            if (progress.users) {
                return;
            }
            const { CreateUserandConfigure } = require('../models/kazoo.backend');
            const { GetUsersFromPurchasedPlan } = require('../utils');

            /* TODO FIX ME 
            logger.info(fn, "getting order");

            const order = await OrderBackend.findOne({
                _id: purchasedPlan && purchasedPlan.orderIds && purchasedPlan.orderIds[0] || ''
            });

            logger.info(fn, "order: ", order);

            const partnerAgent = await PartnerBackend.findOne({
                _id:  order && order.partnerAgent
            })

            logger.info(fn, "partnerAgent: ", partnerAgent);

            const partnerAgentUser = await UserBackend.findOne({
                _id:  partnerAgent && partnerAgent.user
            })

            logger.info(fn, "partnerAgentUser: ", partnerAgentUser);
            */
            const users = await GetUsersFromPurchasedPlan(purchasedPlan, options);

            let usersCreated = [];
            for (let user of users) {
                // first user you create is yourself
                if (usersCreated.length == 0) {
                    const newUser = await CreateUserandConfigure(config.kazoo_de.masterAccountId, progress.account_id, { ...user, ...userInfo, permission: 'admin' }, options);
                    usersCreated.push(newUser);
                } else {
                    const newUser = await CreateUserandConfigure(config.kazoo_de.masterAccountId, progress.account_id, user, options);
                    usersCreated.push(newUser);
                }
            }

            // TODO:
            // Create the MSA/SA User as an admin in the Kazoo system
            // const newUser = await CreateUserandConfigure(config.kazoo_de.masterAccountId, progress.account_id, { ...partnerAgentUser, ...UserBackend.getBasicUserInfo(partnerAgentUser, options), permission: 'admin' }, options);
            // usersCreated.push(newUser);

            progress.users = usersCreated;
            updates[`items.${kazooItemIndex}.metadata.kazoo.users`] = !!progress.users;

            logger.info(fn, 'created and configured users', progress.users);
        })
        // .then(async()   =>  {
        //     if (!progress.phoneNumber || progress.mainNumberCallflow)   {
        //         return;
        //     }
        //     const { CreateCallFlow, UpdateAccount } = require('../models/kazoo.backend');
        //     const { KAZOO_MAIN_CALLFLOW } = require('../constants');

        //     const mainCallFlowId = _.get(progress, 'mainOpenHours.callFlow');

        //     const callFlowPayload = {
        //         contact_list: {
        //             exclude: false
        //         },
        //         numbers: ['0', progress.phoneNumber.id],
        //         name: KAZOO_MAIN_CALLFLOW,
        //         type: 'main',
        //         flow: {
        //             _:  {
        //                 children: {},
        //                 data: {
        //                     id: mainCallFlowId
        //                 },
        //                 module: 'callflow'
        //             }
        //         },
        //         data: {
        //             rules: []
        //         },
        //         module: 'temporal_route',
        //         patterns: []
        //     };

        //     const callFlow = await CreateCallFlow(progress.account_id, callFlowPayload, options);

        //     const data = {
        //         caller_id: {
        //             external: {
        //                 number: progress.phoneNumber.id
        //             },
        //             emergency: {
        //                 number: progress.phoneNumber.id
        //             }
        //         }
        //     };

        //     const updatedAccount = await UpdateAccount(progress.account_id, data, options);

        //     progress.mainNumberCallflow = callFlow && callFlow.data;
        //     progress.account = updatedAccount && updatedAccount.data;

        //     updates[`items.${kazooItemIndex}.metadata.kazoo.mainNumberCallflow`] = !!progress.mainNumberCallflow;
        //     updates[`items.${kazooItemIndex}.metadata.kazoo.account`] = progress.account;

        //     logger.info(fn, 'hooked up phone number', progress.menuCallFlows);
        // })
        // .then(async()   =>  {
        //     const { CreateMedia, UpdateAccountMenu, UpdateCallFlow } = require('../models/kazoo.backend');
        //     const { KAZOO_VIRTUAL_RECEPTIONIST_TEXT_MESSAGE, KAZOO_MAIN_OPEN_HOURS } = require('../constants');

        //     const mediaPayload = {
        //         streamable: true,
        //         name: `${KAZOO_MAIN_OPEN_HOURS}Menu`,
        //         type: 'virtual_receptionist',
        //         media_source: 'tts',
        //         description: '<Text to Speech>',
        //         tts: {
        //             voice: 'female/en-US',
        //             text: KAZOO_VIRTUAL_RECEPTIONIST_TEXT_MESSAGE
        //         }
        //     };

        //     const media = await CreateMedia(progress.account_id, mediaPayload, options);

        //     const menuId = _.get(progress, 'mainOpenHours.menu.id');

        //     const menuPayload = {
        //         name: `${KAZOO_MAIN_OPEN_HOURS}Menu`,
        //         record_pin: _.get(progress, 'mainOpenHours.menu.record_pin'),
        //         media: {
        //             exit_media: true,
        //             invalid_media: true,
        //             transfer_media: true,
        //             greeting: media && media.id
        //         },
        //         retries: 3,
        //         max_extension_length: 4,
        //         type: 'main',
        //         allow_record_from_offnet: false,
        //         hunt: true,
        //         id: menuId
        //     };

        //     const accountMenu = await UpdateAccountMenu(progress.account_id, menuId, menuPayload, options);

        //     const menuCallFlowId = _.get(progress, 'mainOpenHours.menuCallFlow.id');

        //     const callFlowMenuPayload = {
        //         contact_list: {
        //             exclude: false
        //         },
        //         numbers: [`${KAZOO_MAIN_OPEN_HOURS}Menu`],
        //         type: 'main',
        //         flow: {
        //             children: {
        //                 _: {
        //                     children: {},
        //                     module: 'callflow',
        //                     data: {
        //                         id: _.get(progress, 'users[0].callFlow.id')
        //                     }
        //                 }
        //             },
        //             data: {
        //                 id: _.get(progress, 'mainOpenHours.menu.id')
        //             },
        //             module: 'menu'
        //         },
        //         patterns: []
        //     };

        //     const callFlowMenu = await UpdateCallFlow(progress.account_id, menuCallFlowId, callFlowMenuPayload, options);

        //     const callFlowId = _.get(progress, 'mainOpenHours.callFlow.id');

        //     const callFlowPayload = {
        //         contact_list: {
        //             exclude: false
        //         },
        //         numbers: [KAZOO_MAIN_OPEN_HOURS],
        //         type: 'main',
        //         flow: {
        //             children: {},
        //             module: 'callflow',
        //             data: {
        //                 id: menuCallFlowId
        //             }
        //         },
        //         patterns: []
        //     };

        //     const callfow = await UpdateCallFlow(progress.account_id, callFlowId, callFlowPayload, options);

        //     progress.virtualReceptionist = true;

        //     updates[`items.${kazooItemIndex}.metadata.kazoo.virtualReceptionist`] = progress.virtualReceptionist;

        //     logger.info(fn, 'created virtual receptionist', progress.virtualReceptionist);
        // })
        .then(async () => {
            logger.info(fn, 'provisioning success');

            updates[`items.${kazooItemIndex}.metadata.provisionStatus`] = PROVISION_STATUS_COMPLETED;

            purchasedPlan = await PurchasedPlanBackend.findOneAndUpdate({
                _id: purchasedPlan._id
            }, {
                    $set: updates,
                }, options);

            logger.info(fn, 'provisioning status updated');
        })
        .then(() => {
            return cb();
        })
        .catch(async (err) => {
            logger.error(fn, 'error:', err);

            if (err && err.message == 'END_TASK') {
                logger.warn(fn, 'terminate task with no retry');
                return cb();
            }

            const { triggerProvisionFailedEmail } = require('../../modules/utils/index');

            updates[`items.${kazooItemIndex}.metadata.provisionStatus`] = PROVISION_STATUS_FAILED;

            await PurchasedPlanBackend.findOneAndUpdate({
                _id: purchasedPlan._id
            }, {
                    $set: updates,
                }, options);
            logger.info(fn, 'purchased plan provisioning status updated');

            triggerProvisionFailedEmail(options, {
                purchasedPlanId: purchasedPlan._id,
            });
            return cb(err);
        });
};

module.exports = handler;
