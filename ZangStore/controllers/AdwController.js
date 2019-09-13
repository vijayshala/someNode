import logger from 'applogger';
import AdwModel from '../models/AdwModel'

const { OrderBackend } = require('../server/order/order.backend');
const { PurchasedPlanBackend } = require('../server/purchased-plan/purchased-plan.backend');
const { UserBackend } = require('../server/user/user.backend');
const { PartnerBackend } = require('../server/partner/partner.backend');
const { PartnerAgentBackend } = require('../server/partner/partner-agent.backend');
const { ProductBackend } = require('../server/product/product.backend');
const { PartnerCustomerBackend } = require('../server/partner/partner-customer.backend');
const { PartnerOrderBackend } = require('../server/partner/partner-order.backend');

const { CartSchema } = require('../server/cart/cart.model')
const { IPOfficeSubscriptionTrackSchema } = require('../server/ip-office/models/ipoffice-subscription-track.model');
const { OfferSchema } = require('../server/offer/offer.model')
const { ProcessLogSchema } = require('../server/process-log/process-log.model')
const { PurchasedPlanSchema } = require('../server/purchased-plan/purchased-plan.model')
const { SalesModelSchema } = require('../server/salesmodel/salesmodel.model')
const BillingAccountSchema = require('../server/billingaccount/billingaccount.model')
const LegalDocSchema = require('../schemas/LegalDocSchema') 
const PartnerConnectionSchema = require('../schemas/PartnerConnectionSchema')
const PartnerInvitationSchema = require('../schemas/PartnerInvitationSchema')
const QuoteSchema = require('../server/quote/quote.model')
const rateLongDistanceSchema = require('../schemas/longDistanceRateSchema'); 
const TaxGatewaySchema = require('../schemas/TaxGatewaySchema'); 
const {OrderSchema} = require('../server/order/order.model');
const {UserSchema} = require('../server/user/user.model')
const PartnerSchema = require('../schemas/PartnerSchema')
const PartnerAgentSchema = require('../schemas/PartnerAgentSchema');
const { ProductSchema } = require('../server/product/product.model')
const PartnerCustomerSchema = require('../schemas/PartnerCustomerSchema')
const PartnerOrderSchema = require('../schemas/PartnerOrderSchema')
const TransactionSchema = require('../server/transaction/transaction.model')


import TransactionBackend from '../server/transaction/transaction.backend';
const { GCSFileOper } = require('../modules/remoteFileUtility');
import taskqueue from '../modules/taskqueue';
import FTPS from 'ftps';
import util from 'util';
import esErr from '../modules/errors';

var fs = require('fs');


import json2csv from 'json2csv'
import { resolve } from '../../node_modules/uri-js';
import { CreateCharge } from '../server/billing/Charge';
import csvdumper from  '../modules/csvdumper';
import mongoose from 'mongoose';

const uuidv4 = require('uuid/v4');

const config = require('../config');

const Storage = require('@google-cloud/storage');

const bucketTime = dateFormat(new Date());

var ObjectId = require('mongodb').ObjectID;



const ns = '[AdwController]'


const AdwController = {}

function dateFormat(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
    return '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
}

const uploadToGcs_gcs = (csvFileName, csvData, req) => {
    const fn = '[uploadToGcs] ';
    csvFileName = bucketTime + '/' + csvFileName;

    let randomFileName = 'temp/' + uuidv4();

    let remoteFile = new GCSFileOper(config.ADW_GCS_BUCKET, config.ADW_GCS_CRED);

    const fw = remoteFile.createWriteStream(randomFileName, {
        metadata: {
            contentType: 'text/csv',
        },
        resumable: false
    });

    fw.on('drain', (err) => {
        if (!err) {
            err = new Error('write stream drained prematurely');
        }
        logger.error(req.requestId, ns, fn, 'write stream drain', err);
    });
    fw.on('close', (err) => {
        if (!err) {
            err = new Error('write stream closed prematurely');
        }
        logger.error(req.requestId, ns, fn, 'write stream close', err);
    });
    fw.on('error', (err) => {
        logger.error(req.requestId, ns, fn, 'write stream error', err);
    });
    fw.on('finish', (err) => {
        // move temporary file to target file
        logger.info(req.requestId, ns, fn, 'write temp file finish, try move to', csvFileName);
        remoteFile.moveFile(randomFileName, csvFileName, (err, destinationFile, apiResponse) => {
            if (err) {
                logger.error(req.requestId, ns, fn, 'failed on move temp file', err);
            } else {
                logger.info(req.requestId, ns, fn, 'file moved successfully');
            }
        });
    });

    fw.write(csvData);
    fw.end();
}

const createFolderName = ()=>{
  var curtm = (new Date()).toISOString();
  return curtm.replace(/T/g,'').replace(/-/g, '').replace(/:/g, '').substr(0, 12)
}

async function createSavetoTempFile (){
    var curtm = createFolderName();
    await util.promisify(fs.mkdir)('/tmp/' + curtm);
    async function saveToTempFile(csvFileName, csvData, req){ 
        let fullcsvFileName = '/tmp/' + curtm + '/' + csvFileName;
        let writer = fs.createWriteStream(fullcsvFileName)
        writer.write(csvData);

        return new Promise((resolve, reject)=>{
            writer.end(()=>{
                logger.info(req.requestId, ns, `Finish writing to the file ${fullcsvFileName}`);
                return resolve();
            });
        })
    }
    return {saveToTmpFile: saveToTempFile, curtm: curtm};
}
function objectIdWithTimestamp(timestamp) {
    // Convert string date to Date object (otherwise assume timestamp is a date)
    if (typeof (timestamp) == 'string') {
        timestamp = new Date(timestamp);
    }

    // Convert date object to hex seconds since Unix epoch
    var hexSeconds = Math.floor(timestamp / 1000).toString(16);

    // Create an ObjectId with that hex timestamp
    var constructedObjectId = ObjectId(hexSeconds + "0000000000000000");

    return constructedObjectId
}

async function dumpToGcs(req, curtm){
    let funcName = '[dumpToGcs] '
    let remoteFile = new GCSFileOper(config.ADWGCSConfig.bucket, config.ADWGCSConfig.credential);
    let folder = '/tmp/' + curtm
    return new Promise((resolve, reject)=>{
        fs.readdir(folder, async (err, items)=>{
            if (err){
                logger.warn(req.requestId, `${funcName} There is error when list file in the dir ${folder}`, err.message, err.stack);
                return resolve(false);
            }
            await new Promise((resolve, reject)=>{
                logger.info(req.requestId, `${funcName} Remove files under folder ${config.ADWGCSConfig.adwfolder}`)
                remoteFile.clearFolder(req, config.ADWGCSConfig.adwfolder, (err)=>{
                    return resolve()
                })
            });
            let success_upload = true
            for (let fileItem of items){
                let fileName = folder + '/' + fileItem;
                let remoteFileName = config.ADWGCSConfig.adwfolder + fileItem;
                let wfs = remoteFile.createWriteStream(remoteFileName, {
                    metadata: {
                        contentType: 'text/csv',
                    },
                    resumable: false
                });
                try{
                    await new Promise((resolve, reject)=>{
                        let rfs = fs.createReadStream(fileName);
                        rfs.pipe(wfs);
                        let uploadSuccess = true
                        rfs.on('error', (err)=>{
                            logger.warn(req.requestId, `${funcName} Failed to upload the file ${fileName} to remote file ${remoteFileName}`, err.message, err.stack);
                            uploadSuccess = False;
                        })
                        rfs.on('close', ()=>{
                            wfs.end();
                            if (uploadSuccess){
                                logger.info(req.requestId, `${funcName} Successful to upload the file ${fileName} to remote file ${remoteFileName}`)
                                return resolve()
                            }       
                            else{                            
                                return resolve()               
                            }
                        })
                    })
                }
                catch(err){
                    logger.warn(req.requestId, `${funcName} Failed to upload the file ${fileName} to gcs ${remoteFileName}`)
                    success_upload = false;
                    break
                }
            }
            if (success_upload){
                return resolve(true);
            }
            else{
                return resolve(false);
            }
        })
    })
}

async function dumpToFtp(req, curtm){
    let funcName = '[dumpToFtp] ';
    let ftpOpt = {
        host: config.ADWConfig.host,
        port: config.ADWConfig.port,
        protocol: 'ftps',
        username: config.ADWConfig.username,
        password: config.ADWConfig.password,
        additionalLftpCommands: 'set ftp:ssl-force true; set ssl:verify-certificate false',        
    };
    let folder = '/tmp/' + curtm;
    return new Promise((resolve, reject)=>{
        let ftps = new FTPS(ftpOpt);
        fs.readdir(folder, async (err, items)=>{
            if (err){
                logger.warn(req.requestId, `${funcName} There is error when list file in the dir ${folder}`, err.message, err.stack);
                return resolve(false);
            }
            
            
            ftps.raw('mrm ' + config.ADWConfig.path_two + '/*');
            let removefilesop = await new Promise((resolve, reject)=>{
                ftps.exec((err, res)=>{
                    if (err){
                        logger.warn(req.requestId, `${funcName} When remove files from remote ADW folder, error happend`, err.message, err.stack);
                        return resolve(false);
                    }
                    if (res.error){
                        logger.warn(req.requestId, `${funcName} When remove files from remote ADW folder, error happend`, res.error);
                        return resolve(false);
                    }
                    else{
                        logger.info(req.requestId, `${funcName} Remove files from remote ADW folder successfully, wait for 5 seconds to upload files!`)
                        return resolve(true)
                    }
                })
            });
            if (!resolve){
                return reject('Remove file failed!');
            }
            setTimeout(async ()=>{
                let ftps = new FTPS(ftpOpt);
                ftps.cd(config.ADWConfig.path_two);
                for (let fileItem of items){
                    let fileName = folder + '/' + fileItem;
                    logger.info(req.requestId, `${funcName} will upload the file ${fileName} to remote file ${fileItem}`)
                    ftps.put(fileName, fileItem);
                }

                ftps.cd(config.ADWConfig.path);
                ftps.raw('mkdir -p -f ' + curtm);           
                
                for (let fileItem of items){
                    let fileName = folder + '/' + fileItem;
                    logger.info(req.requestId, `${funcName} will upload the file ${fileName} to archive remote file ${curtm+'/'+fileItem}`)
                    ftps.put(fileName, curtm+'/'+fileItem);
                }
                
                try{
                    await new Promise((resolve, reject)=>{
                        ftps.exec((err, res)=>{
                            if (err){
                                logger.warn(req.requestId, `${funcName} When upload files to remote folder error happens`, err.message, err.stack);
                                return reject(err);
                            }
                            if (res.error){
                                logger.warn(req.requestId, `${funcName} When upload files to remote folder error happens`, res.error);
                                return reject(res.error);
                            }
                            else{                            
                                logger.info(req.requestId, `${funcName} upload files to remote folder successfully`)
                                return resolve(true);
                            }
                        })
                    })
                }

                
                catch(err){
                    logger.info(req.requestId, `${funcName} Because upload files failed, remove the remote folder ${curtm}`);
                    await new Promise((resolve, reject)=>{
                        ftps.cd(config.ADWConfig.path);
                        ftps.raw('mdel ' + 'curtm/*')
                        ftps.rmdir(curtm).exec((err)=>{
                            if (err){
                                logger.warn(req.requestId, `${funcName} When remove folder ${curtm} error happens`, err.message, err.stack);
                                return resolve(false);
                            }
                            else{
                                logger.info(req.requestId, `${funcName} Remove the folder ${curtm} successfully`)
                                return resolve(true);
                            }
                        })
                        ;
                    });
                    return reject(err);
                }
                return resolve(true);
            }, 5000);
        })
    });
}

async function removeTempFolder(req, curtm){
    let funcName = '[removeTempFilder] ';
    let folder = '/tmp/'+curtm;
    let files = await util.promisify(fs.readdir)(folder);
    for (let fileItem of files){        
        try{
            await util.promisify(fs.unlink)(folder + '/' + fileItem)
        }
        catch(err){
            logger.error(req.requestId, `${funcName} Remove the file ${folder + '/' + fileItem} failed`, err.message, err.stack);
        }
    }
    await util.promisify(fs.rmdir)(folder);
    logger.info(req.requestId, `${funcName} Remove the file ${folder} finished`)
}

// AdwController.getAll = async (req, res) => {
async function dumptoADW_async(req, data){
    logger.info(req.requestId, ns, '[index]')

    // 24 hours + 1 minute
    // we want to query everything from the last 24 hours + 1 minute
    const MINUTES = 1441

    let query = {}

    var {saveToTmpFile, curtm} = await createSavetoTempFile();
    /*---------------- GET ALL ORDERS AND NORMALIZE IT ---------- */
    /*     if (((new Date()).getDate()) != 1) {
            query = { 'updated.on': { $gte: new Date(new Date().getTime() - 60 * MINUTES * 1000).toISOString() } };
        } */

    let orders = await OrderBackend.find(query, {
        requestId: req.requestId,
        localizer: req.localizer,
        populate: [],
        sort: {
            _id: -1
        }
    });

    let csvFileName = `orders.csv`;
    let csvData = "";
    let newOrders = [];
    let newOrderSubscriptions = [];
    let newSubscriptionTaxs = [];
    let newOrderItems = [];
    let fields = [];

    orders.forEach(order => {
        let newOrder = {}
        try {
            newOrder._id = order._id;
            newOrder.created_by = order.created.by;
            newOrder.created_on = order.created.on;
            newOrder.updated_by = (order.updated) ? order.updated.by : null;
            newOrder.updated_on = (order.updated) ?order.updated.on : null;
            newOrder.currency = order.currency;
            newOrder.partner = order.partner;
            newOrder.partner_agent = order.partnerAgent;
            newOrder.plan_type = order.items[0].identifier;
            newOrder.plan_amount = order.items[0].quantity;
            newOrder.onetime_subtotal = order.onetime.subTotal;
            newOrder.onetime_discount = order.onetime.discount;
            newOrder.onetime_tax = order.onetime.tax;
            newOrder.onetime_shipping = order.onetime.shipping;
            newOrder.onetime_total = order.onetime.total;
            newOrder.contact_email = order.contact.email;
            newOrder.contact_phone = order.contact.phone;
            newOrder.contact_first_name = order.contact.firstName;
            newOrder.contact_last_name = order.contact.lastName;
            newOrder.company_name = order.company.name;
            newOrder.company_domain = order.company.domain;
            newOrder.company_industry = order.company.industry;
            newOrder.billing_address_zip = order.billingAddress.zip;
            newOrder.billing_address_city = order.billingAddress.city;
            newOrder.billing_address_country = order.billingAddress.country;
            newOrder.billing_address_address1 = order.billingAddress.address1;
            newOrder.billing_state = order.billingAddress.state;
            newOrder.status = order.status || '';
            newOrder.region = order.region || '';
            newOrders.push(newOrder);

            order.subscriptions.forEach(subscription => {
                try {
                    let newOrderSubscription = {};
                    newOrderSubscription._id = uuidv4();
                    newOrderSubscription.order_id = order._id;
                    newOrderSubscription.billing_intervals = subscription.billingInterval;
                    newOrderSubscription.billing_period = subscription.billingPeriod;
                    newOrderSubscription.contract_length = subscription.contractLength;
                    newOrderSubscription.contract_period = subscription.contractPeriod;
                    newOrderSubscription.subtotal = subscription.subTotal;
                    newOrderSubscription.discount = subscription.discount;
                    newOrderSubscription.tax = subscription.tax;
                    newOrderSubscription.shipping = subscription.shipping;
                    newOrderSubscription.total = subscription.total;

                    newOrderSubscriptions.push(newOrderSubscription);


                    subscription.taxDetails.forEach(tax => {
                        try {
                            let newSubscriptionTax = {};
                            newSubscriptionTax._id = uuidv4();
                            newSubscriptionTax.order_contract = newOrderSubscription._id;
                            newSubscriptionTax.title = tax.title.text;
                            newSubscriptionTax.amount = tax.amount;

                            newSubscriptionTaxs.push(newSubscriptionTax);

                        } catch (error) {
                            logger.error("[AdwController] faulty subscription.taxDetail. order id: ", order._id);
                        }
                    })
                } catch (error) {
                    logger.error("[AdwController] faulty subscription ", subscription)
                }
            })

            order.items.forEach(item => {
                try {
                    let newOrderItem = {};

                    newOrderItem._id = uuidv4();
                    newOrderItem.order_id = order._id;
                    newOrderItem.title = item.title.text;
                    newOrderItem.quantity = item.quantity;
                    newOrderItem.price = item.price;
                    newOrderItem.identifier = item.identifier || '';
                    newOrderItem.level = item.level;
                    newOrderItem.salesModelItem_identifier = (item.salesModelItem && item.salesModelItem.identifier)?item.salesModelItem.identifier:'';
                    newOrderItems.push(newOrderItem);

                } catch (error) {
                    logger.error("[AdwController] faulty order.item. item: ", item);
                }
            })

        } catch (error) {
            logger.error("faulty order", order._id, error.mssage, error.stack.split("\n"))
        }
    })


    if (newOrders.length > 0) {
        fields = Object.keys(newOrders[0]);
        csvData = json2csv({
            data: newOrders,
            fields: fields,
            fieldNames: fields
        })
        await saveToTmpFile(csvFileName, csvData, req);
    } else {
        csvData = "No export data";
    }

    //res.attachment(csvFileName);
    //res.write(csvData);

    csvFileName = `order_contract_normalized.csv`;
    csvData = "";


    if (newOrderSubscriptions.length > 0) {
        fields = Object.keys(newOrderSubscriptions[0]);
        csvData = json2csv({
            data: newOrderSubscriptions,
            fields: fields,
            fieldNames: fields
        })
        await saveToTmpFile(csvFileName, csvData, req);
    } else {
        csvData = "No export data";
    }

    //res.attachment(csvFileName);
    //res.write(csvData);

    csvFileName = `order_contract_tax_normalized.csv`;
    csvData = "";


    if (newSubscriptionTaxs.length > 0) {
        fields = Object.keys(newSubscriptionTaxs[0]);
        csvData = json2csv({
            data: newSubscriptionTaxs,
            fields: fields,
            fieldNames: fields
        })
        await saveToTmpFile(csvFileName, csvData, req);
    } else {
        csvData = "No export data";
    }

    //res.attachment(csvFileName);
    //res.write(csvData);

    csvFileName = `order_items_normalized.csv`;
    csvData = "";


    if (newOrderItems.length > 0) {
        fields = Object.keys(newOrderItems[0]);
        csvData = json2csv({
            data: newOrderItems,
            fields: fields,
            fieldNames: fields
        })
        await saveToTmpFile(csvFileName, csvData, req);
    } else {
        csvData = "No export data";
    }

    //res.attachment(csvFileName);
    //res.write(csvData);

    /*----------- GET ALL ORDERS AND NORMALIZE IT END -------- */

    /*----------- GET ALL PURCHASED PLANS AND NORMALIZE IT -------- */


    let purchasedPlans = await PurchasedPlanBackend.find(query, {
        requestId: req.requestId,
        localizer: req.localizer,
        populate: [],
        sort: {
            _id: -1
        }
    });


    let newPurchasedPlans = [];
    let newPurchasedPlanItems = [];
    let newPurchasedPlanSubscriptions = [];

    purchasedPlans.forEach(purchasedPlan => {

        purchasedPlan.orderIds.forEach(order => {
            try {
                let newPurchasedPlan = {};
                newPurchasedPlan._id = purchasedPlan._id;
                newPurchasedPlan.order_id = order;
                newPurchasedPlan.partner = purchasedPlan.partner
                newPurchasedPlan.partner_agent = purchasedPlan.partnerAgent
                newPurchasedPlan.created_by = purchasedPlan.created.by
                newPurchasedPlan.created_on = purchasedPlan.created.on
                newPurchasedPlan.updated_on = purchasedPlan.updated_on
                newPurchasedPlan.onetime_subtotal = purchasedPlan.onetime.subTotal
                newPurchasedPlan.onetime_discount = purchasedPlan.onetime.discount
                newPurchasedPlan.onetime_tax = purchasedPlan.onetime.tax
                newPurchasedPlan.onetime_shipping = purchasedPlan.onetime.shipping
                newPurchasedPlan.onetime_total = purchasedPlan.onetime.total
                newPurchasedPlan.status = purchasedPlan.status
                newPurchasedPlan.region = purchasedPlan.region || '';

                purchasedPlan.items.forEach(item => {
                    try {
                        let newPurchasedPlanItem = {}
                        newPurchasedPlanItem._id = item._id;
                        newPurchasedPlanItem.contract_id = purchasedPlan._id;
                        newPurchasedPlanItem.quantity = item.quantity;
                        newPurchasedPlanItem.title = item.title.text;
                        newPurchasedPlanItem.price = item.price;

                        newPurchasedPlanItems.push(newPurchasedPlanItem);
                    } catch(error) {

                    }
                })

                purchasedPlan.subscriptions.forEach(subscription => {
                    try {
                        let newPurchasedPlanSubscription = {};

                        newPurchasedPlanSubscription._id = subscription._id
                        newPurchasedPlanSubscription.contract_id = purchasedPlan._id;
                        newPurchasedPlanSubscription.status = subscription.status
                        newPurchasedPlanSubscription.billing_period = subscription.billingPeriod
                        newPurchasedPlanSubscription.billing_interval = subscription.billingInterval
                        newPurchasedPlanSubscription.contract_period = subscription.contractPeriod
                        newPurchasedPlanSubscription.contract_length = subscription.contractLength
                        newPurchasedPlanSubscription.subtotal = subscription.subTotal
                        newPurchasedPlanSubscription.discount = subscription.discount
                        newPurchasedPlanSubscription.tax = subscription.tax
                        newPurchasedPlanSubscription.shipping = subscription.shipping
                        newPurchasedPlanSubscription.total = subscription.total
                        newPurchasedPlanSubscription.payment_on = (subscription.payment && subscription.payment.on)?subscription.payment.on:null;
                        newPurchasedPlanSubscription.payment_next = (subscription.payment && subscription.payment.next)?subscription.payment.next:null;
                        newPurchasedPlanSubscriptions.push(newPurchasedPlanSubscription)
                        newPurchasedPlanSubscriptions.status = subscription.status || ''
                    } catch(error) {

                    }
                })


                newPurchasedPlans.push(newPurchasedPlan);
            } catch (error) {
                logger.error("faulty purchasedplan ", purchasedPlan._id);
            }
        })
    })

    csvFileName = `contracts.csv`;
    csvData = "";


    if (newPurchasedPlans.length > 0) {
        fields = Object.keys(newPurchasedPlans[0]);
        csvData = json2csv({
            data: newPurchasedPlans,
            fields: fields,
            fieldNames: fields
        })
        await saveToTmpFile(csvFileName, csvData, req);
    } else {
        csvData = "No export data";
    }

    csvFileName = `contract_items.csv`;
    csvData = "";


    if (newPurchasedPlanItems.length > 0) {
        fields = Object.keys(newPurchasedPlanItems[0]);
        csvData = json2csv({
            data: newPurchasedPlanItems,
            fields: fields,
            fieldNames: fields
        })
        await saveToTmpFile(csvFileName, csvData, req);
    } else {
        csvData = "No export data";
    }

    csvFileName = `contract_plans.csv`;
    csvData = "";


    if (newPurchasedPlanSubscriptions.length > 0) {
        fields = Object.keys(newPurchasedPlanSubscriptions[0]);
        csvData = json2csv({
            data: newPurchasedPlanSubscriptions,
            fields: fields,
            fieldNames: fields
        })
        await saveToTmpFile(csvFileName, csvData, req);
    } else {
        csvData = "No export data";
    }

    //res.attachment(csvFileName);
    //res.write(csvData);
    /*----------- GET ALL PURCHASED PLANS AND NORMALIZE IT END -------- */

    /*----------- GET ALL USERS -------- */



    let users = await UserBackend.find(query, {
        requestId: req.requestId,
        localizer: req.localizer,
        populate: [],
        sort: {
            _id: -1
        }
    });


    let newUsers = [];

    users.forEach(user => {
        try {
            let newUser = {};

            newUser._id = user._id;
            newUser.access_level = user.accessLevel;
            newUser.display_name = user.account.displayname;
            let primaryEmail = '';
            for (var i = 0; i < user.account.emails.length; i++) {
                let email = user.account.emails[i];
                if (email.primary) {
                    primaryEmail = email.value;
                }
            }
            newUser.email = primaryEmail;
            let primaryNumber = '';
            for (var i = 0; i < user.account.phone_numbers.length; i++) {
                let number = user.account.phone_numbers[i];
                if (number.primary) {
                    primaryNumber = number.value;
                }
            }
            newUser.phone_number = primaryNumber;

            newUsers.push(newUser);
        } catch (error) {
            logger.error("faulty user ", user._id);
        }
    })

    csvFileName = `users.csv`;
    csvData = "";


    if (newUsers.length > 0) {
        fields = Object.keys(newUsers[0]);
        csvData = json2csv({
            data: newUsers,
            fields: fields,
            fieldNames: fields
        })
        await saveToTmpFile(csvFileName, csvData, req);
    } else {
        csvData = "No export data";
    }

    //res.attachment(csvFileName);
    //res.write(csvData);
    /*----------- GET ALL USERS ENDS -------- */

    //res.attachment(csvFileName);
    //res.write(csvData);
    /*----------- GET ALL PURCHASED PLANS AND NORMALIZE IT END -------- */

    /*----------- GET ALL PARTNERS -------- */



    let partners = await PartnerBackend.find(query, {
        requestId: req.requestId,
        localizer: req.localizer,
        populate: [],
        sort: {
            _id: -1
        }
    });


    let newPartners = [];

    partners.forEach(partner => {
        try {
            let newPartner = {};

            newPartner._id = partner._id;
            newPartner.updated_by = (partner.updated) ? partner.updated.by: null;
            newPartner.updated_on = (partner.updated) ? partner.updated.on: null;
            newPartner.created_by = partner.created.by;
            newPartner.created_on = partner.created.on;
            newPartner.status_changed_by = (partner.statusChanged) ? partner.statusChanged.by : null;
            newPartner.status_changed_on = (partner.statusChanged) ? partner.statusChanged.on : null;
            newPartner.status = partner.status;
            newPartner.utility_email = partner.fields.utilityEmail;
            newPartner.company_name = partner.fields.companyName;
            newPartner.company_address = partner.fields.companyAddress;
            newPartner.company_country = partner.fields.companyCountry;
            newPartner.company_city = partner.fields.companyCity;
            newPartner.company_state_province = partner.fields.companyStateProvince;
            newPartner.company_zip_postal_code = partner.fields.companyZipPostalCode;
            newPartner.company_website = partner.fields.companyWebsite;
            newPartner.company_phone_number = partner.fields.companyPhoneNumber;
            newPartner.copy_company_address = partner.fields.copyCompanyAddress;
            newPartner.operational_address = partner.fields.operationalAddress;
            newPartner.operational_country = partner.fields.operationalCountry;
            newPartner.operational_city = partner.fields.operationalCity;
            newPartner.operational_state_province = partner.fields.operationalStateProvince;
            newPartner.operational_zip_postal_code = partner.fields.operationalZipPostalCode;
            newPartner.avaya_partner_id = partner.fields.avayaPartnerId;
            newPartner.parent = partner.parent;
            newPartner.type = partner.type;

            newPartners.push(newPartner);
        } catch (error) {
            logger.error("faulty partner ", partner._id, error.message, error.stack.split('\n'));
        }
    })

    csvFileName = `partners.csv`;
    csvData = "";


    if (newPartners.length > 0) {
        fields = Object.keys(newPartners[0]);
        csvData = json2csv({
            data: newPartners,
            fields: fields,
            fieldNames: fields
        })
        await saveToTmpFile(csvFileName, csvData, req);
    } else {
        csvData = "No export data";
    }

    //res.attachment(csvFileName);
    //res.write(csvData);
    /*----------- GET ALL PARTNERS ENDS -------- */

    /*----------- GET ALL PARTNER AGENTS AGENTS -------- */



    let partnerAgents = await PartnerAgentBackend.find(query, {
        requestId: req.requestId,
        localizer: req.localizer,
        populate: [],
        sort: {
            _id: -1
        }
    });


    let newPartnerAgents = [];

    partnerAgents.forEach(partnerAgent => {
        try {
            let newPartnerAgent = {};

            newPartnerAgent._id = partnerAgent._id;
            newPartnerAgent.user = partnerAgent.user
            newPartnerAgent.created_on = partnerAgent.created;
            newPartnerAgent.partner = partnerAgent.partner;
            newPartnerAgent.active = partnerAgent.active;
            newPartnerAgent.access_level = partnerAgent.accessLevel;
            newPartnerAgent.code = partnerAgent.code;
            newPartnerAgents.push(newPartnerAgent);
        } catch (error) {
            logger.error("faulty partner agent ", partnerAgent._id);
        }
    })

    csvFileName = `partner_agents.csv`;
    csvData = "";


    if (newPartnerAgents.length > 0) {
        fields = Object.keys(newPartnerAgents[0]);
        csvData = json2csv({
            data: newPartnerAgents,
            fields: fields,
            fieldNames: fields
        })
        await saveToTmpFile(csvFileName, csvData, req);
    } else {
        csvData = "No export data";
    }

    //res.attachment(csvFileName);
    //res.write(csvData);
    /*----------- GET ALL PARTNER AGENTS ENDS -------- */

    /*----------- GET ALL PRODUCTS ------------------- */




    let products = await ProductBackend.find(query, {
        requestId: req.requestId,
        localizer: req.localizer,
        populate: [],
        sort: {
            _id: -1
        }
    });



    let newProducts = [];

    products.forEach(product => {
        try {
            let newProduct = {};

            newProduct._id = product._id;
            newProduct.type = product.type;
            newProduct.status = product.status;
            newProduct.title = product.title.text;

            newProducts.push(newProduct);
        } catch (error) {
            logger.error("faulty product ", product._id);
        }
    })

    csvFileName = `products.csv`;
    csvData = "";


    if (newProducts.length > 0) {
        fields = Object.keys(newProducts[0]);
        csvData = json2csv({
            data: newProducts,
            fields: fields,
            fieldNames: fields
        })
        await saveToTmpFile(csvFileName, csvData, req);
    } else {
        csvData = "No export data";
    }

    //res.attachment(csvFileName);
    //res.write(csvData);

    /*------------ GET ALL PRODUCT ENDS ------------ */

    /*----------- GET ALL PARTER CUSTOMER ------------------- */




    let partnerCustomers = await PartnerCustomerBackend.find(query, {
        requestId: req.requestId,
        localizer: req.localizer,
        populate: [],
        sort: {
            _id: -1
        }
    });



    let newPartnerCustomers = [];

    partnerCustomers.forEach(partnerCustomer => {
        try {
            let newPartnerCustomer = {};

            newPartnerCustomer._id = partnerCustomer._id;
            newPartnerCustomer.partner_id = partnerCustomer.partner;
            newPartnerCustomer.agent_id = partnerCustomer.agent;
            newPartnerCustomer.parent_partner_id = partnerCustomer.parentPartner;
            newPartnerCustomer.customer_id = partnerCustomer.customer;
            newPartnerCustomer.created_on = partnerCustomer.created;

            newPartnerCustomers.push(newPartnerCustomer);
        } catch (error) {
            logger.error("faulty partner customer ", partnerCustomer._id);
        }
    })

    csvFileName = `partner_customer.csv`;
    csvData = "";


    if (newPartnerCustomers.length > 0) {
        fields = Object.keys(newPartnerCustomers[0]);
        csvData = json2csv({
            data: newPartnerCustomers,
            fields: fields,
            fieldNames: fields
        })
        await saveToTmpFile(csvFileName, csvData, req);
    } else {
        csvData = "No export data";
    }

    //res.attachment(csvFileName);
    //res.write(csvData);

    /*------------ GET ALL PARTNER CUSTOMER ENDS ------------ */

    /*----------- GET ALL PARTER CUSTOMER ------------------- */




    let partnerOrders = await PartnerOrderBackend.find(query, {
        requestId: req.requestId,
        localizer: req.localizer,
        populate: [],
        sort: {
            _id: -1
        }
    });


    let newPartnerOrders = [];

    partnerOrders.forEach(partnerOrder => {
        try {
            let newPartnerOrder = {};

            newPartnerOrder._id = partnerOrder._id;
            newPartnerOrder.order_id = partnerOrder.order;
            newPartnerOrder.customer_id = partnerOrder.customer;
            newPartnerOrder.agent_id = partnerOrder.agent;
            newPartnerOrder.parent_partner_id = partnerOrder.parentPartner;
            newPartnerOrder.created_on = partnerOrder.created;

            //logger.info(newPartnerORder)

            newPartnerOrders.push(newPartnerOrder);
        } catch (error) {
            logger.info("faulty partner Ooder ", partnerOrder._id);
        }
    })

    csvFileName = `partner_order.csv`;
    csvData = "";


    if (newPartnerOrders.length > 0) {
        fields = Object.keys(newPartnerOrders[0]);
        csvData = json2csv({
            data: newPartnerOrders,
            fields: fields,
            fieldNames: fields
        })
        await saveToTmpFile(csvFileName, csvData, req);
    } else {
        csvData = "No export data";
    }

    //res.attachment(csvFileName);
    //res.write(csvData);



    /*------------ GET ALL PARTNER CUSTOMER ENDS ------------ */

    /*----------- GET ALL PARTER CUSTOMER ------------------- */




    let transactions = await TransactionBackend.find(query, {
        requestId: req.requestId,
        localizer: req.localizer,
        populate: [],
        sort: {
            _id: -1
        }
    });



    let newTransactions = [];

    transactions.forEach(transaction => {
        try {
            let newTransaction = {};

            newTransaction._id = transaction._id;
            newTransaction.reference_id = transaction.refObject;
            if(transaction.refObjectType == 'purchasedplan.subscriptions'){
                newTransaction.reference_to = 'contract_plans'
            }
            else if(transaction.refObjectType == 'order') {
                newTransaction.reference_to = 'orders'
            }
            else {
                newTransaction.reference_to = 'unknown'
            }
            newTransaction.amount = transaction.amount;
            newTransaction.currency = transaction.currency;
            newTransaction.status = transaction.status;
            
            newTransaction.amount = transaction.amount;
            newTransaction.created_by = transaction.created.by
            newTransaction.created_on = transaction.created.on
            newTransaction.tax = transaction.tax.amount

            //logger.info(newPartnerORder)

            newTransactions.push(newTransaction);
        } catch (error) {
            logger.info("faulty transaction ", transaction._id);
        }
    })

    csvFileName = `transaction.csv`;
    csvData = "";


    if (newTransactions.length > 0) {
        fields = Object.keys(newTransactions[0]);
        csvData = json2csv({
            data: newTransactions,
            fields: fields,
            fieldNames: fields
        })
        await saveToTmpFile(csvFileName, csvData, req);
    } else {
        csvData = "No export data";
    }

    let dumptoftpResult = await dumpToGcs(req, curtm);
    await removeTempFolder(req, curtm);
    if (!dumptoftpResult){
        throw new esErr.ESErrors(esErr.TaskqueueRetry);
    }
}

function dumptoADWDefer(req, data, cb){
    dumptoADW_async(req, data).then(() =>{
      process.nextTick(() => {
        return cb();
      })
    })
    .catch((err) =>{
      process.nextTick(() => {
        return cb(err);
      })
    });
  }


taskqueue.registerDeferHandle('dumptoADWDefer', dumptoADWDefer)

async function tocsvfile(){
    let Schema = mongoose.Schema;
    let filename = CartSchema.collection.collectionName;
    let dumpPromises = [];

    CartSchema.schema.plugin(csvdumper, {file: filename, mixed_unkown_property:{
        'items.salesModel.subscription': {'billingPeriod': String, 'billingInterval': Number, 'contractPeriod': String, contractLength: Number},
        'items.salesModel.helper': {'number': String},
        'items.salesModelItem.helper': {'number': String},
        'items.attribute.helper': {'number': String},
        'items.references': {'sku': String, licenseType: String},
        //'payment.metadata': {purchasedPlan: {billingAddress: {country: String, contry2: [String]}}}
        'payment.metadata': {"customerId": String, "sourceId": String, "paymentType": String, "paymentId": String, 
                             "creditCard": {"brand": String, "last4": String, "expMonth": Number, "expYear": Number, "holderName": "String"},
                             "IBANAuthorization": Boolean, "IBAN": String, "billingSent": Boolean,
                             "purchaseOrder": {"status": String, "refNumber": String, "_id": String, 
                                               "updated": {"on": Date, "by": String}, "created": {"on": Date, "by": String},
                                               "billingAddress": {"zip": String, "country": String, "state": String, "city": String, "address1": String},
                                               "company": {"isIncorporated": Boolean, "name": String},
                                               "contact": {"phone": String, "email": String, "lastName": String, "firstName": String}}

        }
    }});
    let CartModel = CartSchema.compile(CartSchema.modelName, CartSchema.schema, CartSchema.collection.name, CartSchema.db, mongoose);    
    dumpPromises.push(new Promise((resolve, reject)=>{
        CartModel.find({}).stream().pipe(CartModel.csvReadStream2('/tmp/testdir/', CartSchema.collection.name)).on('finish', function(){
            return resolve();
        })
    }));


    IPOfficeSubscriptionTrackSchema.schema.plugin(csvdumper, {file: IPOfficeSubscriptionTrackSchema.collection.collectionName,
        mixed_unkown_property: {
            'settingxml_creation_meta.extraData':{
                'user': {'language': String, 'lastName': String, firstName: String, username: String, _id: String},
                'existingNumber': String, 
                'isDidExisting': Boolean, 
                'phoneNumberSid': String, 
                'phoneNumber': String, 
                'isContainer': Boolean, 
                'IPODefaultUserPassword': String, 
                'contractId': String,
                'sipCred': {
                  'password': String,
                  'username': String,
                  'sid': String
                },
                'sipCredList': String,
                'sipDomain': String,
                'sipDomainSid': String,
                'subscriptionId': Number,
                'users': [new Schema({
                    'device': String,
                    'pin': String,
                    'password': String,
                    'ext': Number,
                    'name': String,
                    'type': String
                })],
                'firstOSSPoll': Date
            }
        }})
    let IPOfficeSubscriptionTrackModel = IPOfficeSubscriptionTrackSchema.compile(IPOfficeSubscriptionTrackSchema.modelName, IPOfficeSubscriptionTrackSchema.schema, IPOfficeSubscriptionTrackSchema.collection.name, IPOfficeSubscriptionTrackSchema.db, mongoose);
    dumpPromises.push(new Promise((resolve, reject)=>{
        IPOfficeSubscriptionTrackModel.find({}).stream().pipe(IPOfficeSubscriptionTrackModel.csvReadStream2('/tmp/testdir/', IPOfficeSubscriptionTrackModel.collection.name)).on('finish', function(){
            return resolve();
        })
    }));

    OfferSchema.schema.plugin(csvdumper, {file: OfferSchema.collection.collectionName});
    let OfferModel = OfferSchema.compile(OfferSchema.modelName, OfferSchema.schema, OfferSchema.collection.name, OfferSchema.db, mongoose)
    dumpPromises.push(new Promise((resolve, reject)=>{
        OfferModel.find({}).stream().pipe(OfferModel.csvReadStream2('/tmp/testdir/', OfferModel.collection.name)).on('finish', function(){
            return resolve();
        })
    }));
    
    ProcessLogSchema.schema.plugin(csvdumper, {file: ProcessLogSchema.collection.collectionName, 
        mixed_unkown_property: {'debug': {'confirmationNumber': String}}})
    let ProcessLogModel = ProcessLogSchema.compile(ProcessLogSchema.modelName, ProcessLogSchema.schema, ProcessLogSchema.collection.name, ProcessLogSchema.db, mongoose)
    dumpPromises.push(new Promise((resolve, reject)=>{
        ProcessLogModel.find({}).stream().pipe(ProcessLogModel.csvReadStream2('/tmp/testdir/', ProcessLogModel.collection.name)).on('finish', function(){
            return resolve();
        })
    }));
    
    PurchasedPlanSchema.schema.plugin(csvdumper, {file: PurchasedPlanSchema.collection.collectionName,
        mixed_unkown_property: {
            'metadata': {'legacyOrderId': String, 'legacyContractId': String, 'legacy': Boolean},
            'items.salesModel.subscription': {'billingPeriod': String, 'billingInterval': Number, 'contractPeriod': String, contractLength: Number},
            'items.salesModel.helper': {'number': String},
            'items.salesModelItem.helper': {'number': String},
            'items.attribute.helper': {'number': String},
            'items.references': {'sku': String, licenseType: String},
            'items.metadata': {'sipDomain': {'sid':String, 'domain': String}, 
                               'sipCredList': {'sid': String}, 
                               'sipCred': {'sid':String, 'username': String, 'password':String},
                               'tempPhoneNumber': {'sid': String, 'phone_number': String},
                               'phoneNumber': {'sid': String, 'phone_number': String},                               
                               'ipaclSID': String, 'applicationSID': String, 'IPO_HostName': String, 'IPO_IPAddress': String},
            'onetime.taxItems': {},
            'subscriptions.taxItems': {},
            'payment.metadata': {"customerId": String, "sourceId": String, "paymentType": String, "paymentId": String, 
                             "creditCard": {"brand": String, "last4": String, "expMonth": Number, "expYear": Number, "holderName": "String"},
                             "IBANAuthorization": Boolean, "IBAN": String, "billingSent": Boolean,
                             "purchaseOrder": {"status": String, "refNumber": String, "_id": String, 
                                               "updated": {"on": Date, "by": String}, "created": {"on": Date, "by": String},
                                               "billingAddress": {"zip": String, "country": String, "state": String, "city": String, "address1": String},
                                               "company": {"isIncorporated": Boolean, "name": String},
                                               "contact": {"phone": String, "email": String, "lastName": String, "firstName": String}}},
            'onetime.payment.metadata': {},
            'subscriptions.payment.metadata': {"subscriptionId": String}
        },
        null_undefined_maps: {
            'items.metadata.phoneNumber.phone_number': 'null_undefined_get_from_parent'}        
    })
    let PurchasedPlanModel = PurchasedPlanSchema.compile(PurchasedPlanSchema.modelName, PurchasedPlanSchema.schema, PurchasedPlanSchema.collection.name, PurchasedPlanSchema.db, mongoose)    

    dumpPromises.push(new Promise((resolve, reject)=>{
        PurchasedPlanModel.find({}).stream().pipe(PurchasedPlanModel.csvReadStream2('/tmp/testdir/', PurchasedPlanModel.collection.name)).on('finish', function(){
            return resolve();
        })
    }));
    

    
    SalesModelSchema.schema.plugin(csvdumper, {file: SalesModelSchema.collection.collectionName,
        'mixed_unkown_property': {
            'descriptions.resource': String,
            'helper': {},
            'references': {'sku': String, licenseType: String},
            'rules.parameters.value': String,
            'items.descriptions.resource': String,                 
            'items.helper': {},
            'items.references': {'sku': String, licenseType: String},
            'items.rules.parameters.value': String,
            'items.attributes.descriptions.resource': String,
            'items.attributes.helper': {},
            'items.attributes.references': {'sku': String, licenseType: String},            
            'items.attributes.rules.parameters.value': String,
        }});
    let SalesModelModel = OfferSchema.compile(SalesModelSchema.modelName, SalesModelSchema.schema, SalesModelSchema.collection.name, SalesModelSchema.db, mongoose)
    dumpPromises.push(new Promise((resolve, reject)=>{
        SalesModelModel.find({}).stream().pipe(SalesModelModel.csvReadStream2('/tmp/testdir/', SalesModelModel.collection.name)).on('finish', function(){
            return resolve();
        })
    }));

    
    BillingAccountSchema.schema.plugin(csvdumper, {file: BillingAccountSchema.collection.collectionName,
        'mixed_unkown_property':{
            'paymentGateways.STRIPE': {'customerId': String},
            'paymentGateways.STRIPE_CA': {},
    }});
    let BillingAccountModel = OfferSchema.compile(BillingAccountSchema.modelName, BillingAccountSchema.schema, BillingAccountSchema.collection.name, BillingAccountSchema.db, mongoose)
    dumpPromises.push(new Promise((resolve, reject)=>{
        BillingAccountModel.find({}).stream().pipe(BillingAccountModel.csvReadStream2('/tmp/testdir/', BillingAccountModel.collection.name)).on('finish', function(){
            return resolve();
        })
    }));


    LegalDocSchema.schema.plugin(csvdumper, {file: LegalDocSchema.collection.collectionName,
        'mixed_unkown_property':{
            'paymentGateways.STRIPE': {'customerId': String},
            'paymentGateways.STRIPE_CA': {},
    }});
    let LegalDocModel = OfferSchema.compile(LegalDocSchema.modelName, LegalDocSchema.schema, LegalDocSchema.collection.name, LegalDocSchema.db, mongoose)
    dumpPromises.push(new Promise((resolve, reject)=>{
        LegalDocModel.find({}).stream().pipe(LegalDocModel.csvReadStream2('/tmp/testdir/', LegalDocModel.collection.name)).on('finish', function(){
            return resolve();
        })
    }));


    PartnerConnectionSchema.schema.plugin(csvdumper, {file: PartnerConnectionSchema.collection.collectionName});
    let PartnerConnectionModel = OfferSchema.compile(PartnerConnectionSchema.modelName, PartnerConnectionSchema.schema, PartnerConnectionSchema.collection.name, PartnerConnectionSchema.db, mongoose)
    dumpPromises.push(new Promise((resolve, reject)=>{
        PartnerConnectionModel.find({}).stream().pipe(PartnerConnectionModel.csvReadStream2('/tmp/testdir/', PartnerConnectionModel.collection.name)).on('finish', function(){
            return resolve();
        })
    }));

    
    PartnerInvitationSchema.schema.plugin(csvdumper, {file: PartnerInvitationSchema.collection.collectionName});
    let PartnerInvitationModel = OfferSchema.compile(PartnerInvitationSchema.modelName, PartnerInvitationSchema.schema, PartnerInvitationSchema.collection.name, PartnerInvitationSchema.db, mongoose)
    dumpPromises.push(new Promise((resolve, reject)=>{
        PartnerInvitationModel.find({}).stream().pipe(PartnerInvitationModel.csvReadStream2('/tmp/testdir/', PartnerInvitationModel.collection.name)).on('finish', function(){
            return resolve();
        })
    }));

    QuoteSchema.schema.plugin(csvdumper, {file: QuoteSchema.collection.collectionName,
        mixed_unkown_property: {
            'metadata': {'legacyOrderId': String, 'legacyContractId': String, 'legacy': Boolean},
            'items.salesModel.subscription': {'billingPeriod': String, 'billingInterval': Number, 'contractPeriod': String, contractLength: Number},
            'items.salesModel.helper': {'number': String},
            'items.salesModelItem.helper': {'number': String},
            'items.attribute.helper': {'number': String},
            'items.references': {'sku': String, licenseType: String},            
            'onetime.taxItems': {},
            'subscriptions.taxItems': {},
            'onetime.payment.metadata': {},
            'subscriptions.payment.metadata': {"subscriptionId": String}
        }      
    })
    let QuoteModel = QuoteSchema.compile(QuoteSchema.modelName, QuoteSchema.schema, QuoteSchema.collection.name, QuoteSchema.db, mongoose)    
    dumpPromises.push(new Promise((resolve, reject)=>{
        QuoteModel.find({}).stream().pipe(QuoteModel.csvReadStream2('/tmp/testdir/', QuoteModel.collection.name)).on('finish', function(){
            return resolve();
        })
    }));


    rateLongDistanceSchema.schema.plugin(csvdumper, {file: rateLongDistanceSchema.collection.collectionName});
    let rateLongDistanceModel = OfferSchema.compile(rateLongDistanceSchema.modelName, rateLongDistanceSchema.schema, rateLongDistanceSchema.collection.name, rateLongDistanceSchema.db, mongoose)
    dumpPromises.push(new Promise((resolve, reject)=>{
        rateLongDistanceModel.find({}).stream().pipe(rateLongDistanceModel.csvReadStream2('/tmp/testdir/', rateLongDistanceModel.collection.name)).on('finish', function(){
            return resolve();
        })
    }));

    
    TaxGatewaySchema.schema.plugin(csvdumper, {file: TaxGatewaySchema.collection.collectionName,
        mixed_unkown_property: {
            'metadata': {}
        }      
    })
    let TaxGatewayModel = TaxGatewaySchema.compile(TaxGatewaySchema.modelName, TaxGatewaySchema.schema, TaxGatewaySchema.collection.name, TaxGatewaySchema.db, mongoose)    
    dumpPromises.push(new Promise((resolve, reject)=>{
        TaxGatewayModel.find({}).stream().pipe(TaxGatewayModel.csvReadStream2('/tmp/testdir/', TaxGatewayModel.collection.name)).on('finish', function(){
            return resolve();
        })
    }));


    OrderSchema.schema.plugin(csvdumper, {file: OrderSchema.collection.collectionName,
        mixed_unkown_property: {
            'metadata': {'legacyOrderId': String, 'legacyContractId': String, 'legacy': Boolean},
            'items.salesModel.subscription': {'billingPeriod': String, 'billingInterval': Number, 'contractPeriod': String, contractLength: Number},
            'items.salesModel.helper': {'number': String},
            'items.salesModelItem.helper': {'number': String},
            'items.attribute.helper': {'number': String},
            'items.references': {'sku': String, licenseType: String},            
            'onetime.taxItems': {},
            'subscriptions.taxItems': {},
            'payment.metadata': {"customerId": String, "sourceId": String, "paymentType": String, "paymentId": String, 
                             "creditCard": {"brand": String, "last4": String, "expMonth": Number, "expYear": Number, "holderName": "String"},
                             "IBANAuthorization": Boolean, "IBAN": String, "billingSent": Boolean,
                             "purchaseOrder": {"status": String, "refNumber": String, "_id": String, 
                                               "updated": {"on": Date, "by": String}, "created": {"on": Date, "by": String},
                                               "billingAddress": {"zip": String, "country": String, "state": String, "city": String, "address1": String},
                                               "company": {"isIncorporated": Boolean, "name": String},
                                               "contact": {"phone": String, "email": String, "lastName": String, "firstName": String}}},
            'onetime.payment.metadata': {"paymentId": String},
            'subscriptions.payment.metadata': {}
        }      
    })
    let OrderModel = OrderSchema.compile(OrderSchema.modelName, OrderSchema.schema, OrderSchema.collection.name, OrderSchema.db, mongoose)    

    dumpPromises.push(new Promise((resolve, reject)=>{
        OrderModel.find({}).stream().pipe(OrderModel.csvReadStream2('/tmp/testdir/', OrderModel.collection.name)).on('finish', function(){
            return resolve();
        })
    }));

    UserSchema.schema.plugin(csvdumper, {file: UserSchema.collection.collectionName,
        mixed_unkown_property: {
            "account.phone_numbers._id": String,
            "account.emails._id": String,
            "account.languages._id": String,
            "account.relation_graphs._id": String,
            'accountInformation':{'isIncorporated':Boolean, 'vatNumber': String, 'industryType': String, 'allowToContact': Boolean,
                                'firstName': String, 'lastName': String, 'phoneNumber':String, 'emailAddress':String, 
                                'companyName': String, 'companyId': String, 'companyDomain': String},
            'billingInformation': {'billingAddress': String, 'billingCountryISO': String, 'billingCountry': String, 'billingCity': String, 
                                  'billingStateProvinceISO': String, 'billingStateProvince': String, 'billingPostalCode': String},
            'shippingInformation': {'shippingAddress': String, 'shippingCountryISO': String, 'shippingCountry': String,
                                    'shippingCity': String, 'shippingStateProvinceISO': String, 'shippingStateProvince': String, 'shippingPostalCode': String},
            'paymentGateways': {}
        },
        ignore_property:['account.security_token']
    })
    let UserModel = UserSchema.compile(UserSchema.modelName, UserSchema.schema, UserSchema.collection.name, UserSchema.db, mongoose)    

    dumpPromises.push(new Promise((resolve, reject)=>{
        UserModel.find({}).stream().pipe(UserModel.csvReadStream2('/tmp/testdir/', UserModel.collection.name)).on('finish', function(){
            return resolve();
        })
    }));

    
    PartnerSchema.schema.plugin(csvdumper, {file: PartnerSchema.collection.collectionName,
        mixed_unkown_property: {
            'metadata': {'regionMaster': String}
        }      
    })
    let PartnerModel = PartnerSchema.compile(PartnerSchema.modelName, PartnerSchema.schema, PartnerSchema.collection.name, PartnerSchema.db, mongoose)    
    dumpPromises.push(new Promise((resolve, reject)=>{
        PartnerModel.find({}).stream().pipe(PartnerModel.csvReadStream2('/tmp/testdir/', PartnerModel.collection.name)).on('finish', function(){
            return resolve();
        })
    }));

    PartnerAgentSchema.schema.plugin(csvdumper, {file: PartnerAgentSchema.collection.collectionName});
    let PartnerAgentModel = PartnerAgentSchema.compile(PartnerAgentSchema.modelName, PartnerAgentSchema.schema, PartnerAgentSchema.collection.name, PartnerAgentSchema.db, mongoose)    
    dumpPromises.push(new Promise((resolve, reject)=>{
        PartnerAgentModel.find({}).stream().pipe(PartnerAgentModel.csvReadStream2('/tmp/testdir/', PartnerAgentModel.collection.name)).on('finish', function(){
            return resolve();
        })
    }));

    ProductSchema.schema.plugin(csvdumper, {file: ProductSchema.collection.collectionName, 
      'mixed_unkown_property': {'descriptions.resource': {},
                                'attributes.helper': {}}
    });
    let ProductModel = ProductSchema.compile(ProductSchema.modelName, ProductSchema.schema, ProductSchema.collection.name, ProductSchema.db, mongoose)    
    dumpPromises.push(new Promise((resolve, reject)=>{
        ProductModel.find({}).stream().pipe(ProductModel.csvReadStream2('/tmp/testdir/', ProductModel.collection.name)).on('finish', function(){
            return resolve();
        })
    }));


    
    PartnerCustomerSchema.schema.plugin(csvdumper, {file: PartnerCustomerSchema.collection.collectionName});
    let PartnerCustomerModel = PartnerCustomerSchema.compile(PartnerCustomerSchema.modelName, PartnerCustomerSchema.schema, PartnerCustomerSchema.collection.name, PartnerCustomerSchema.db, mongoose)    
    dumpPromises.push(new Promise((resolve, reject)=>{
        PartnerCustomerModel.find({}).stream().pipe(PartnerCustomerModel.csvReadStream2('/tmp/testdir/', PartnerCustomerModel.collection.name)).on('finish', function(){
            return resolve();
        })
    }));

    
    PartnerOrderSchema.schema.plugin(csvdumper, {file: PartnerOrderSchema.collection.collectionName});
    let PartnerOrderModel = PartnerCustomerSchema.compile(PartnerOrderSchema.modelName, PartnerOrderSchema.schema, PartnerOrderSchema.collection.name, PartnerOrderSchema.db, mongoose)    
    dumpPromises.push(new Promise((resolve, reject)=>{
        PartnerOrderModel.find({}).stream().pipe(PartnerOrderModel.csvReadStream2('/tmp/testdir/', PartnerOrderModel.collection.name)).on('finish', function(){
            return resolve();
        })
    }));

    
    TransactionSchema.schema.plugin(csvdumper, {file: TransactionSchema.collection.collectionName,
        'mixed_unkown_property': {
            'payment.metadata': {'subscriptionId': String, 'invoiceId': String, 'customerId': String, 'sourceId': String, 'paymentType': String, 'paymentId': String, 'sourceId': String,
                                 "creditCard": {"brand": String, "last4": String, "expMonth": Number, "expYear": Number, "holderName": "String"},
                                 'periodEnd': Number, 'periodStart': Number},
            'tax.metadata': {'commit':Boolean, 'documentCode': String}
    }
    });
    let TransactionModel = PartnerCustomerSchema.compile(TransactionSchema.modelName, TransactionSchema.schema, TransactionSchema.collection.name, TransactionSchema.db, mongoose)    
    dumpPromises.push(new Promise((resolve, reject)=>{
        TransactionModel.find({}).stream().pipe(TransactionModel.csvReadStream2('/tmp/testdir/', TransactionModel.collection.name)).on('finish', function(){
            return resolve();
        })
    }));

    await Promise.all(dumpPromises);
    console.log("=========>>>1111")
}

//To get the csvfile please uncomment the following line!!
//And point the production database connections
// tocsvfile();
