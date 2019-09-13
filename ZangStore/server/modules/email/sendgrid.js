const ns = '[sendgrid]';

const config = require('../../../config');
const templater = require('./templater');
const logger = require('applogger');
const constants = require('../../../config/constants');
const localizerUtil = require('../../../localizer/localizerUtil');

const sgMail = require('@sendgrid/mail');
const _ = require('lodash');

sgMail.setApiKey(config.sendgrid.apiKey);
sgMail.setSubstitutionWrappers('-', '-');

const defaultEmailLang = 'en-US';

let localizer;

exports.sendOrderEmail = async (setup) => {
    const fn = `[${setup.requestId}]${ns}[sendOrderEmail]`;

    if (!setup || !setup.requestId) {
        logger.warn(fn, 'no requestId');
        return;
    }

    logger.info(fn, JSON.stringify(setup));

    let theConfirmationNumber = config.environment !== 'production' ?
        "-[TEST]-" + setup.confirmationNumber : setup.confirmationNumber;


    let bcc = setup.noBCC ? '' : (templater.orderEmail.bcc || []).concat(setup.additionalBcc || []);

    if (Array.isArray(bcc)) {
        bcc = _.uniq(bcc);
        bcc = bcc.filter(email => Array.isArray(setup.email) ? setup.email.indexOf(email) == -1 : setup.email != email);
    }

    const msg = {
        to: setup.email,
        from: {
            email: templater.orderEmail.fromEmail,
            name: templater.orderEmail.fromName
        },
        bcc: bcc,
        categories: [templater.orderEmail.emailCategory],
        templateId: templater.orderEmail.templateId[setup.language] || templater.orderEmail.templateId[defaultEmailLang],
        substitutions: {
            productName: setup.productName,
            confirmationType: setup.confirmationType,
            confirmationNumber: theConfirmationNumber,
            firstName: setup.firstName,
            summary: setup.summary,
            year: new Date().getFullYear()
        }
    };

    logger.info(fn, JSON.stringify(msg));

    if (templater.orderEmail.send) {
        try {
            const result = await sgMail.send(msg);

            logger.info(fn, 'send result:', result);

            return result;
        } catch (err) {
            logger.error(fn, 'sendgrid error ', err);
        }
    }
}


exports.sendQuoteEmail = async function (setup) {
    const fn = `[${setup.requestId}]${ns}[sendQuoteEmail]`;

    if (!setup || !setup.requestId) {
        logger.warn(fn, 'no requestId');
        return;
    }

    logger.info(fn, JSON.stringify(setup));

    let bcc = setup.noBCC ? '' : (templater.quoteEmail.bcc || []).concat(setup.additionalBcc || []);

    if (Array.isArray(bcc)) {
        bcc = _.uniq(bcc);
        bcc = bcc.filter(email => Array.isArray(setup.email) ? setup.email.indexOf(email) == -1 : setup.email != email);
    }

    let theConfirmationNumber = config.environment !== 'production' ?
        "-[TEST]-" + setup.quoteNumber : setup.quoteNumber;

    const msg = {
        to: setup.email,
        bcc: bcc,
        from: {
            email: templater.quoteEmail.fromEmail,
            name: templater.quoteEmail.fromName
        },
        categories: [templater.quoteEmail.emailCategory],
        templateId: templater.quoteEmail.templateId[setup.language] || templater.quoteEmail.templateId[defaultEmailLang],
        substitutions: {
            productName: setup.productName,
            quoteNumber: theConfirmationNumber,
            firstName: setup.firstName,
            summary: setup.summary,
            viewQuoteLink: `${setup.baseUrl}/quotes/${setup.quoteId}`,
            year: new Date().getFullYear()
        }
    };

    logger.info(fn, JSON.stringify(msg));

    if (templater.quoteEmail.send) {
        try {
            const result = await sgMail.send(msg);

            logger.info(fn, 'send result:', result);

            return result;
        } catch (err) {
            logger.error(fn, 'sendgrid error ', err);
        }
    }
}

exports.sendDeviceProvisioningEmail = async function (setup) {
    const fn = `[${setup.requestId}]${ns}[sendDeviceProvisioningEmail]`;

    if (!setup || !setup.requestId) {
        logger.warn(fn, 'no requestId');
        return;
    }

    logger.info(fn, JSON.stringify(setup));

    let bcc = setup.noBCC ? '' : (templater.criEmail.bcc || []).concat(setup.additionalBcc || []);

    if (Array.isArray(bcc)) {
        bcc = _.uniq(bcc);
        bcc = bcc.filter(email => Array.isArray(setup.toEmail) ? setup.toEmail.indexOf(email) == -1 : setup.toEmail != email);
    }

    let theConfirmationNumber = config.environment !== 'production' ?
        "-[TEST]-" + setup.confirmationNumber : setup.confirmationNumber;

    const msg = {
        to: setup.toEmail,
        from: {
            email: templater.criEmail.fromEmail,
            name: templater.criEmail.fromName
        },
        bcc: bcc,
        categories: [templater.criEmail.emailCategory],
        attachments: setup.fileName && setup.fileBuffer ? [{
            filename: setup.fileName,
            content: setup.fileBuffer
        }] : [],
        templateId: templater.criEmail.templateId[defaultEmailLang],
        substitutions: {
            MSA: setup.MSA,
            partnerSupportEmail: constants.SUPPORT_EMAILS.CLOUD_SUPPORT,
            companyName: setup.companyName,
            confirmationNumber: theConfirmationNumber,
            shippingAddress: setup.shippingAddress,
            shippingCity: setup.shippingCity,
            shippingPostalCode: setup.shippingPostalCode,
            shippingStateProvince: setup.shippingStateProvince,
            shippingCountry: setup.shippingCountry,
            firstName: setup.firstName,
            lastName: setup.lastName,
            email: setup.email,
            phoneNumber: setup.phoneNumber,
            summary: setup.summary,
            notes: setup.notes,
            year: new Date().getFullYear()
        }
    };

    logger.info(fn, JSON.stringify(msg));

    if (templater.criEmail.send) {
        try {
            const result = await sgMail.send(msg);

            logger.info(fn, 'send result:', result);

            return result;
        } catch (err) {
            logger.error(fn, 'sendgrid error ', err);
        }
    }
}

exports.sendBillingEngineInvoicePaymentFailedEmail = async function (setup) {
    const fn = `[${setup.requestId}]${ns}[sendBillingEngineInvoicePaymentFailedEmail]`;

    if (!setup || !setup.requestId) {
        logger.warn(fn, 'no requestId');
        return;
    }

    logger.info(fn, JSON.stringify(setup));

    let bcc = setup.noBCC ? '' : (templater.billingEngineInvoicePaymentFailedEmail.bcc || []).concat(setup.additionalBcc || []);

    if (Array.isArray(bcc)) {
        bcc = _.uniq(bcc);
        bcc = bcc.filter(email => Array.isArray(setup.toEmail) ? setup.toEmail.indexOf(email) == -1 : setup.toEmail != email);
    }

    const msg = {
        to: setup.toEmail,
        from: {
            email: templater.billingEngineInvoicePaymentFailedEmail.fromEmail,
            name: templater.billingEngineInvoicePaymentFailedEmail.fromName
        },
        bcc: bcc,
        categories: [templater.billingEngineInvoicePaymentFailedEmail.emailCategory],
        templateId: setup.templateId,
        substitutions: {
            clientName: setup.clientName,
            makePayment: setup.makePayment,
            customerSuccessEmail: setup.customerSuccessEmail,
            year: new Date().getFullYear()
        }
    };

    logger.info(fn, JSON.stringify(msg));

    if (templater.billingEngineInvoicePaymentFailedEmail.send) {
        try {
            const result = await sgMail.send(msg);

            logger.info(fn, 'send result:', result);

            return result;
        } catch (err) {
            logger.error(fn, 'sendgrid error ', err);
        }
    }
}

exports.sendZangSpacesWelcomeEmail = async function (setup) {
    const fn = `[${setup.requestId}]${ns}[sendZangSpacesWelcomeEmail]`;

    if (!setup || !setup.requestId) {
        logger.warn(fn, 'no requestId');
        return;
    }

    logger.info(fn, JSON.stringify(setup));

    let bcc = setup.noBCC ? '' : (templater.zangSpacesWelcomeEmail.bcc || []).concat(setup.additionalBcc || []);

    if (Array.isArray(bcc)) {
        bcc = _.uniq(bcc);
        bcc = bcc.filter(email => Array.isArray(setup.toEmail) ? setup.toEmail.indexOf(email) == -1 : setup.toEmail != email);
    }

    let region = setup.region || 'US';

    let userTemplateId = templater.zangSpacesWelcomeEmail.templateIds[region + '_' + setup.teamType] || templater.zangSpacesWelcomeEmail.templateIds[setup.teamType]
    let emailFromName = (region == 'DE' ? templater.zangSpacesWelcomeEmail.fromEmailGSMB : templater.zangSpacesWelcomeEmail.fromName);

    logger.info(fn, 'Template ID Spaces: ', userTemplateId);

    const msg = {
        to: setup.toEmail,
        from: {
            email: templater.zangSpacesWelcomeEmail.fromEmail,
            name: emailFromName
        },
        bcc: bcc,
        categories: [templater.zangSpacesWelcomeEmail.emailCategory],
        templateId: userTemplateId[setup.language] || userTemplateId[defaultEmailLang],
        substitutions: {
            companyName: setup.companyName,
            firstName: setup.firstName,
            'spaces-link': config.urls.zangSpacesURL,
            'spacesAdmin-link': config.urls.zangSpacesURL + '/admin',
            year: new Date().getFullYear(),
            username: setup.username || ''
        }
    };

    logger.info(fn, JSON.stringify(msg));

    if (templater.zangSpacesWelcomeEmail.send) {
        try {
            const result = await sgMail.send(msg);

            logger.info(fn, 'send result:', result);

            return result;
        } catch (err) {
            logger.error(fn, 'sendgrid error ', err);
        }
    }
}

//partner invitation email
exports.sendPartnerInvitationEmail = async function (setup) {
    const fn = `[${setup.requestId}]${ns}[sendPartnerInvitationEmail]`;

    if (!setup || !setup.requestId) {
        logger.warn(fn, 'no requestId');
        return;
    }

    logger.info(fn, JSON.stringify(setup));

    let bcc = setup.noBCC ? '' : (templater.partnerInvitationEmail.bcc || []).concat(setup.additionalBcc || []);

    if (Array.isArray(bcc)) {
        bcc = _.uniq(bcc);
        bcc = bcc.filter(email => Array.isArray(setup.toEmail) ? setup.toEmail.indexOf(email) == -1 : setup.toEmail != email);
    }

    let emailFromName = (setup.region.toUpperCase() == 'DE' ? templater.partnerInvitationEmail.fromEmailGSMB : templater.partnerInvitationEmail.fromName);

    const msg = {
        to: setup.toEmail,
        from: {
            email: templater.partnerInvitationEmail.fromEmail,
            name: emailFromName
        },
        bcc: bcc,
        categories: [templater.partnerInvitationEmail.emailCategory],
        templateId: setup.templateId,
        substitutions: {
            MSA: setup.msa,
            MSAInviteLink: setup.MSAInviteLink,
            firstName: setup.firstName,
            partnerSupportEmail:(setup.region == 'DE' ? constants.SUPPORT_EMAILS.GSMB_SUPPORT : constants.SUPPORT_EMAILS.CLOUD_CS),
            year: getYear(setup)
        }
    };

    logger.info(fn, JSON.stringify(msg));

    if (templater.partnerInvitationEmail.send) {
        try {
            const result = await sgMail.send(msg);

            logger.info(fn, 'send result:', result);

            return result;
        } catch (err) {
            logger.error(fn, 'sendgrid error ', err);
        }
    }
}

//ip office provisioning email
exports.sendIPOfficeProvisioningEmail = async function (setup) {
    const fn = `[${setup.requestId}]${ns}[sendIPOfficeProvisioningEmail]`;

    if (!setup || !setup.requestId) {
        logger.warn(fn, 'no requestId');
        return;
    }

    logger.info(fn, JSON.stringify(setup));

    let bcc = setup.noBCC ? '' : (templater.ipOfficeProvisioningEmail.bcc || []).concat(setup.additionalBcc || []);

    if (Array.isArray(bcc)) {
        bcc = _.uniq(bcc);
        bcc = bcc.filter(email => Array.isArray(setup.toEmail) ? setup.toEmail.indexOf(email) == -1 : setup.toEmail != email);
    }

    let subject = process.env.NODE_ENV !== 'production' ?
        setup.subject + '-[TEST]-' : setup.subject;

    const msg = {
        to: setup.toEmail,
        from: {
            email: templater.ipOfficeProvisioningEmail.fromEmail,
            name: templater.ipOfficeProvisioningEmail.fromName
        },
        bcc: bcc,
        categories: [templater.ipOfficeProvisioningEmail.emailCategory],
        templateId: templater.ipOfficeProvisioningEmail.templateId[defaultEmailLang],
        substitutions: {
            partnerSupportEmail: constants.SUPPORT_EMAILS.PARTNER_PROGRAM,
            subject: subject,
            summary: setup.summary,
            year: new Date().getFullYear()
        }
    };

    logger.info(fn, JSON.stringify(msg));

    if (templater.ipOfficeProvisioningEmail.send) {
        try {
            const result = await sgMail.send(msg);

            logger.info(fn, 'send result:', result);

            return result;
        } catch (err) {
            logger.error(fn, 'sendgrid error ', err);
        }
    }
}

exports.sendPartnerOrderEmail = async function (setup) {
    const fn = `[${setup.requestId}]${ns}[sendPartnerOrderEmail]`;

    if (!setup || !setup.requestId) {
        logger.warn(fn, 'no requestId');
        return;
    }

    logger.info(fn, JSON.stringify(setup));

    let bcc = setup.noBCC ? '' : (templater.partnerOrderEmail.bcc || []).concat(setup.additionalBcc || []);

    if (Array.isArray(bcc)) {
        bcc = _.uniq(bcc);
        bcc = bcc.filter(email => Array.isArray(setup.toEmail) ? setup.toEmail.indexOf(email) == -1 : setup.toEmail != email);
    }

    let region = setup.region && setup.region.toUpperCase() || 'US';
    let emailFromName = (region == 'DE' ? templater.partnerOrderEmail.fromEmailGSMB : templater.partnerOrderEmail.fromName);
    logger.info(fn, "emailFromName:", emailFromName)

    const msg = {
        to: setup.toEmail,
        from: {
            email: templater.partnerOrderEmail.fromEmail,
            name: emailFromName
        },
        bcc: bcc,
        categories: [templater.partnerOrderEmail.emailCategory],
        templateId: templater.partnerOrderEmail.templateId[setup.language] || templater.partnerOrderEmail.templateId[defaultEmailLang],
        substitutions: {
            firstName: setup.firstName,
            lastName: setup.lastName,
            email: setup.toEmail,
            partnerSupportEmail: (setup.region == 'DE' ? constants.SUPPORT_EMAILS.GSMB_SUPPORT : constants.SUPPORT_EMAILS.PARTNER_PROGRAM),
            company: setup.company,
            partnerType: setup.partnerType,
            summary: setup.summary,
            portalLink: setup.portalLink,
            year: getYear(setup)
        }
    };

    logger.info(fn, JSON.stringify(msg));

    if (templater.partnerOrderEmail.send) {
        try {
            const result = await sgMail.send(msg);

            logger.info(fn, 'send result:', result);

            return result;
        } catch (err) {
            logger.error(fn, 'sendgrid error ', err);
        }
    }
}



exports.sendLegalDocEmail = async function (setup) {
    const fn = `[${setup.requestId}]${ns}[sendLegalDocEmail]`;

    if (!setup || !setup.requestId) {
        logger.warn(fn, 'no requestId');
        return;
    }

    logger.info(fn, JSON.stringify(setup));

    let bcc = setup.noBCC ? '' : (templater.legalDocEmail.bcc || []).concat(setup.additionalBcc || []);

    if (Array.isArray(bcc)) {
        bcc = _.uniq(bcc);
        bcc = bcc.filter(email => Array.isArray(setup.toEmail) ? setup.toEmail.indexOf(email) == -1 : setup.toEmail != email);
    }

    const msg = {
        to: setup.toEmail,
        from: {
            email: templater.legalDocEmail.fromEmail,
            name: templater.legalDocEmail.fromName
        },
        bcc: bcc,
        categories: [templater.legalDocEmail.emailCategory],
        templateId: templater.legalDocEmail.templateId[setup.language] || templater.legalDocEmail.templateId[defaultEmailLang],
        substitutions: {
            firstName: setup.firstName,
            lastName: setup.lastName,
            email: setup.toEmail,
            TOSversion: setup.TOSversion,
            TOSlink: setup.TOSlink,
            year: new Date().getFullYear()
        }
    };

    logger.info(fn, JSON.stringify(msg));

    if (templater.legalDocEmail.send) {
        try {
            const result = await sgMail.send(msg);

            logger.info(fn, 'send result:', result);

            return result;
        } catch (err) {
            logger.error(fn, 'sendgrid error ', err);
        }
    }
}

//partners
async function sendPartnerEmail(setup) {
    const fn = `[${setup.requestId}]${ns}[sendPartnerEmail]`;

    if (!setup || !setup.requestId) {
        logger.warn(fn, 'no requestId');
        return;
    }

    logger.info(fn, JSON.stringify(setup));

    let bcc = setup.noBCC ? '' : (setup.config.bcc || []).concat(setup.additionalBcc || []);

    if (Array.isArray(bcc)) {
        bcc = _.uniq(bcc);
        bcc = bcc.filter(email => Array.isArray(setup.toEmail) ? setup.toEmail.indexOf(email) == -1 : setup.toEmail != email);
    }

    const msg = {
        to: setup.toEmail,
        from: {
            email: setup.config.fromEmail,
            name: setup.config.fromName
        },
        bcc: bcc,
        categories: [setup.config.emailCategory],
        templateId: setup.templateId,
        substitutions: {
            firstName: setup.firstName,
            lastName: setup.lastName,
            email: setup.toEmail,
            partnerSupportEmail: constants.SUPPORT_EMAILS.PARTNER_PROGRAM,
            partnerType: setup.partnerType,
            summary: setup.summary,
            referralLink: setup.referralLink,
            approvedDeclined: setup.approvedDeclined,
            portalLink: setup.portalLink,
            company: setup.company,
            rejected: setup.rejected,
            approved: setup.approved,
            dnbLink: setup.dnbLink,
            year: new Date().getFullYear()
        }
    };

    logger.info(fn, JSON.stringify(msg));

    try {
        const result = await sgMail.send(msg);

        logger.info(fn, 'send result:', result);

        return result;
    } catch (err) {
        logger.error(fn, 'sendgrid error ', err);
    }
}

exports.sendPOEmail = async function (setup) {
    const fn = `[${setup.requestId}]${ns}[sendPOEmail]`;

    if (!setup || !setup.requestId) {
        logger.warn(fn, 'no requestId');
        return;
    }

    logger.info(fn, JSON.stringify(setup));

    let bcc = setup.noBCC ? '' : (templater.poEmail.bcc || []).concat(setup.additionalBcc || []);

    if (Array.isArray(bcc)) {
        bcc = _.uniq(bcc);
        bcc = bcc.filter(email => Array.isArray(setup.toEmail) ? setup.toEmail.indexOf(email) == -1 : setup.toEmail != email);
    }

    let subject = config.environment !== 'production' ? setup.subject + '-[TEST]-' : setup.subject;

    const msg = {
        to: setup.toEmail,
        from: {
            email: templater.poEmail.fromEmail,
            name: templater.poEmail.fromName
        },
        bcc: bcc,
        subject: subject,
        categories: [templater.poEmail.emailCategory],
        templateId: templater.poEmail.templateId[defaultEmailLang],
        substitutions: {
            subject: subject,
            summary: setup.summary,
            year: new Date().getFullYear()
        }
    };

    logger.info(fn, JSON.stringify(msg));

    if (templater.poEmail.send) {
        try {
            const result = await sgMail.send(msg);

            logger.info(fn, 'send result:', result);

            return result;
        } catch (err) {
            logger.error(fn, 'sendgrid error ', err);
        }
    }

    logger.info(setup.requestId, '[sendPOEmail]', JSON.stringify(setup))
}

exports.sendGenericEmail = async (setup) => {
    const fn = `[${setup.requestId}]${ns}[sendGenericEmail]`;

    if (!setup || !setup.requestId) {
        logger.warn(fn, 'no requestId');
        return;
    }

    logger.info(fn, JSON.stringify(setup));

    let bcc = setup.noBCC ? '' : (templater.genericEmail.bcc || []).concat(setup.additionalBcc || []);

    if (Array.isArray(bcc)) {
        bcc = _.uniq(bcc);
        bcc = bcc.filter(email => Array.isArray(setup.toEmail) ? setup.toEmail.indexOf(email) == -1 : setup.toEmail != email);
    }

    let subject = process.env.NODE_ENV !== 'production' ?
        setup.subject + '-[TEST]-' : setup.subject;

    const files = setup.files;
    let attachments = [];
    if (files && files.length > 0) {
        for (let file of files) {
            attachments.push({
                filename: file.name,
                content: file.buffer
            });
        }
    }

    let region = setup.region && setup.region.toUpperCase() || 'US'
    let emailFromName = (region == 'DE' ? templater.genericEmail.fromEmailGSMB : templater.genericEmail.fromName);
    logger.info(fn, "emailFromName:", emailFromName)

    const msg = {
        to: setup.toEmail,
        subject: subject,
        substitutions: {
            subject: subject,
            summary: "[%temp%]",
            year: getYear(setup)
        },
        from: {
            email: templater.genericEmail.fromEmail,
            name: emailFromName
        },
        bcc: bcc,
        categories: [templater.genericEmail.emailCategory],
        templateId: templater.genericEmail.templateId[defaultEmailLang],
        attachments: attachments,
        sections: {
            "[%temp%]" : setup.summary
        }
    };

    if (templater.orderEmail.send) {
        try {
            const result = await sgMail.send(msg);

            logger.info(fn, 'send result:', JSON.stringify(result));

            return result;
        } catch (err) {
            logger.error(fn, 'sendgrid error ', err);
        }
    }

}

// Create the footer address
const getYear = setup => {
    localizer = localizerUtil(setup.language || defaultEmailLang);
    let year =  new Date().getFullYear() + ' ';
    // create the footer based on region
    if (setup.region && setup.region == 'DE') {
        year +=  localizer.get('AVAYA_GSMB') + '<br>' + localizer.get('AVAYA_EMAIL_FOOTER_GSMB');
    } else {
        year += localizer.get('AVAYA_CLOUD_INC') + '<br>' + localizer.get('AVAYA_EMAIL_FOOTER');
    }
    return year;
}

exports.sendParnterApplicationEmail = sendPartnerEmail
exports.sendPartnerApplicationStatusUpdatedEmail = sendPartnerEmail
exports.sendPartnerAdminApprovalEmail = sendPartnerEmail
exports.defaultEmailLang = defaultEmailLang
