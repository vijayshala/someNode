import constants from '../../../config/constants'
import config from '../../../config';
export default {
  customerWelcomeToZangOfficeEmail: { // Not used
    send: true,
    //templateId: '90ba14e8-db79-412f-bcc3-d71b28d32c11',
    templateId: {
      'en-US': '90ba14e8-db79-412f-bcc3-d71b28d32c11'
    },
    fromName: 'Jacqueline Mullen',
    fromEmail: 'jackie@zang.io',
    emailCategory: 'Avaya Store Welcome email',
    bcc: config.environment == 'production' ? [constants.SUPPORT_EMAILS.CLOUD_CS, 'jackie@zang.io', constants.SUPPORT_EMAILS.CLOUD_DEVOPS] : config.currentDeveloperEmails
  },
  orderEmail: { // used
    send: true,
    //templateId: 'bed6e1ce-5e4c-4f5d-a718-17c6eea1e8ba',
    templateId: {
      'en-US': '40c6d000-0bd6-4b28-92b2-5d83acca4fbb'
    },
    fromName: 'Avaya Store',
    fromEmail: 'noreply@avaya.com',
    fromEmailGSMB: 'Avaya Cloud Team',
    bcc: config.environment == 'production' ? [constants.SUPPORT_EMAILS.CLOUD_CS, constants.SUPPORT_EMAILS.CLOUD_DEVOPS] : config.currentDeveloperEmails,
    emailCategory: 'Avaya Store Customer Orders',
    itemHTML: '<table style="width:100%"><thead><tr><th>Name</th><th>Quantity</th><th>Sub total</th></tr></thead><tbody>{TBODY}<tr><td colspan="3">Total: {TOTAL}</td></tr></tbody></table>',
    detailHTML: '<table style="width:100%"><caption>{CAPTION}</caption><thead><tr><th>Fee</th><th>Items</th><th>Total</th></tr></thead><tbody>{TBODY}</tbody></table>',
    subscriptionUpdateHTML: '<table style="width:100%"><thead><tr><th>Item</th><th>Quantity</th><th>Price</th><th>Subtotal</th></tr></thead><tbody>{TBODY}<tr><td colspan="5">Total: {TOTAL}</td></tr></tbody></table>'
  },
  quoteEmail: { // used
    send: true,
    //templateId: 'bed6e1ce-5e4c-4f5d-a718-17c6eea1e8ba',
    templateId: {
      'en-US': '410c44c9-5021-4870-bbf5-4066d2690237'
    },
    fromName: 'Avaya Store',
    fromEmail: 'noreply@avaya.com',
    bcc: config.environment == 'production' ? [constants.SUPPORT_EMAILS.CLOUD_CS, constants.SUPPORT_EMAILS.CLOUD_DEVOPS] : config.currentDeveloperEmails,
    emailCategory: 'Avaya Store Customer Quotes',
    itemHTML: '<table style="width:100%"><thead><tr><th>Name</th><th>Quantity</th><th>Sub total</th></tr></thead><tbody>{TBODY}<tr><td colspan="3">Total: {TOTAL}</td></tr></tbody></table>',
    detailHTML: '<table style="width:100%"><caption>{CAPTION}</caption><thead><tr><th>Fee</th><th>Items</th><th>Total</th></tr></thead><tbody>{TBODY}</tbody></table>',
    subscriptionUpdateHTML: '<table style="width:100%"><thead><tr><th>Item</th><th>Quantity</th><th>Price</th><th>Subtotal</th></tr></thead><tbody>{TBODY}<tr><td colspan="5">Total: {TOTAL}</td></tr></tbody></table>'
  },
  criEmail: { // used
    send: true,
    //templateId: 'dfe3927f-dcc5-46aa-a285-d42fbe2dd59c',
    templateId: {
      'en-US': 'ce75f300-2fdf-4060-9a02-19a5f70ae911'
    },
    restriction: {
      country: 'Canada',
      toEmail: 'jackie@zang.io',
      bcc: config.environment == 'production' ? [constants.SUPPORT_EMAILS.CLOUD_SUPPORT, constants.SUPPORT_EMAILS.CLOUD_CS, constants.SUPPORT_EMAILS.CLOUD_DEVOPS] : config.currentDeveloperEmails
    },
    fromName: 'Avaya Store',
    toEmail: constants.SUPPORT_EMAILS.CLOUD_SUPPORT,
    fromEmail: 'noreply@avaya.com',
    bcc: config.environment == 'production' ? [constants.SUPPORT_EMAILS.CLOUD_CS, constants.SUPPORT_EMAILS.CLOUD_DEVOPS, 'jackie@zang.io'] : config.currentDeveloperEmails,
    emailCategory: 'Avaya Store Device Provisioning',
    templateHTML: '<table style="width:100%"><thead><tr><th>Username</th><th>Ext.</th><th>PIN</th><th>Password</th><th>Type</th><th>Device</th></tr></thead><tbody>{TBODY}</tbody></table>'
  },
  requestContractCancelationEmail: { // not used
    send: true,
    //templateId: '62212c14-a85d-4be7-883e-3730d7c70e32',
    templateId: {
      'en-US': '085e1f98-125e-44bc-b301-3c253ca71d9a'
    },
    fromName: 'Avaya Store',
    fromEmail: 'noreply@avaya.com',
    emailCategory: 'Avaya Store Cancellation Process',
    bcc: config.environment == 'production' ? [constants.SUPPORT_EMAILS.CLOUD_CS, constants.SUPPORT_EMAILS.CLOUD_DEVOPS, 'jackie@zang.io'] : config.currentDeveloperEmails
  },
  zangOfficeFollowupEmail: { // not used
    send: true,
    //templateId: 'ab025a75-00ed-46ff-a3f3-eb1aff8d88bd',
    templateId: {
      'en-US': 'ab025a75-00ed-46ff-a3f3-eb1aff8d88bd'
    },
    fromName: 'Jacqueline Mullen',
    fromEmail: 'jackie@zang.io',
    emailCategory: 'Zang Office Followup Email',
    bcc: []
  },
  contractAutoRenewalEmail: {
    send: true,
    //templateId: '482ffc08-108d-4d96-97a6-d6df95cea2d2',
    templateId: {
      'en-US': 'a8c02038-ed32-4275-8240-09e529f26d56'
    },
    fromName: 'Avaya Store',
    fromEmail: 'noreply@avaya.com',
    emailCategory: 'Avaya Store AutoRenewal Email',
    bcc: []
  },
  contractAutoRenewalReminderEmail: {
    send: true,
    //templateId: '60f022bb-334e-440b-8ba5-3f2e786d2b47',
    templateId: {
      'en-US': '60f022bb-334e-440b-8ba5-3f2e786d2b47'
    },
    fromName: 'Avaya Store',
    fromEmail: 'noreply@avaya.com',
    emailCategory: 'Avaya Store AutoRenewalReminder Email',
    bcc: []
  },
  billingEngineInvoicePaymentFailedEmail: { // used
    send: true,
    //reminderTemplateId: '1104c17a-dab8-486c-b4ac-27f715536cec',
    reminderTemplateId: {
      'en-US': 'cfc953d1-885a-4e5f-bff0-aabb210fe91a'
    },
    //finalReminderTemplateId: '3d39258c-395c-49b6-958b-a1eddde02460',
    finalReminderTemplateId: {
      'en-US': 'd803e478-24c8-4725-870c-f43a02ac48d0'
    },
    //finalTemplateId: '769d75e5-f30e-40c7-ba2b-c80e16475899',
    finalTemplateId: {
      'en-US': 'a35eceb2-911e-4450-a63e-e28bb127213f'
    },
    fromName: 'Avaya Store',
    fromEmail: 'noreply@avaya.com',
    emailCategory: 'Avaya Store Payment Failed Email',
    bcc: config.environment == 'production' ? [constants.SUPPORT_EMAILS.CLOUD_CS, constants.SUPPORT_EMAILS.CLOUD_DEVOPS] : config.currentDeveloperEmails
  },
  quoteToSalesEmail: {
    send: true,
    //templateId: '43b22b98-c9a9-408f-9c5c-d8091e95c88b',
    templateId: {
      'en-US': 'e7d18440-5220-4965-8955-6c9ef2949a8f'
    },
    toEmail: 'sales@zang.io',
    fromName: 'Avaya Store',
    fromEmail: 'noreply@avaya.com',
    fromEmailGSMB: 'Avaya Cloud Team',
    emailCategory: 'Avaya Store Quote',
    bcc: []
  },
  zangSpacesFollowupEmail: {
    send: true,
    //templateId: '5c7694c6-8b4d-4360-b675-d120a3d096b3',
    templateId: {
      'en-US': '5c7694c6-8b4d-4360-b675-d120a3d096b3'
    },
    fromName: 'Jacqueline Mullen',
    fromEmail: 'jackie@zang.io',
    emailCategory: 'Avaya Spaces Followup Email',
    bcc: []
  },
  zangSpacesWelcomeEmail: {
    send: true,
    templateIds: {
      //user: '61640a11-8856-4cfe-b6ee-564a71e80556',
      user: {
        'en-US': '61640a11-8856-4cfe-b6ee-564a71e80556',
        'de-DE': '69d82473-bf6e-4c52-bb85-b9451c64cb85'
      },
      DE_user: {
        'en-US': '61640a11-8856-4cfe-b6ee-564a71e80556',
        'de-DE': '69d82473-bf6e-4c52-bb85-b9451c64cb85'
      },
      //company: 'df2f8e17-771e-49b4-9074-558b7158e04f'
      company: {
        'en-US': 'df2f8e17-771e-49b4-9074-558b7158e04f',
        'de-DE': 'c0fcbdba-7aac-4aa4-9b00-1699b0640a7b'
      },
      DE_company: {
        'en-US': 'de6d5c2b-3e84-4eb7-8863-efeb98e911a5',
        'de-DE': '627c2973-fa7c-4b9f-b6bc-69554c39ddc0'
      },
    },
    fromName: 'Avaya Spaces',
    fromEmail: 'noreply@avaya.com',
    fromEmailGSMB: 'Avaya Cloud Team',
    emailCategory: 'Avaya Spaces Welcome Email',
    bcc: []
  },
  partnerApplicationEmail: {
    send: true,
    templateIds: {
      //sales: "da5a8b88-adf5-499a-b184-63ee3b2e0289",
      sales: {
        'en-US': 'da5a8b88-adf5-499a-b184-63ee3b2e0289'
      },
      //referral: "da5a8b88-adf5-499a-b184-63ee3b2e0289",
      referral: {
        'en-US': 'da5a8b88-adf5-499a-b184-63ee3b2e0289'
      },
      msa: {
        'en-US': 'da5a8b88-adf5-499a-b184-63ee3b2e0289'
      }
      // referral: "70017263-5f74-4d5f-85ad-62d9ef610467"
    },
    fromName: "Avaya Partner Programs",
    fromEmail: "noreply@avaya.com",
    fromEmailGSMB: 'Avaya Cloud Team',
    emailCategory: "Avaya Partner Programs",
    bcc: []
  },
  partnerApplicationStatusUpdatedEmail: {
    send: true,
    templateIds: {
      //APPROVED: "a98918b1-8f8f-4ae6-80f4-c72531243db2",
      APPROVED: {
        'en-US': 'c635cdf9-9846-4e52-8624-c43f633d7851'
      },
      //REJECTED: "754bcaa0-ee97-4229-825a-98d462209595",
      REJECTED: {
        'en-US': 'a5b51396-3e22-4d4e-bedd-38636d42e57f'
      }
    },
    templateId: "a98918b1-8f8f-4ae6-80f4-c72531243db2",
    fromName: "Avaya Partner Programs",
    fromEmail: "noreply@avaya.com",
    fromEmailGSMB: 'Avaya Cloud Team',
    emailCategory: "Avaya Partner Programs",
    bcc: []
  },
  partnerAdminApprovalEmail: {
    send: true,
    //templateId: "c2d0dac8-d6d4-46af-b76e-cfcd94bc4a4a",
    templateId: {
      'en-US': 'e3bd483c-1fd2-498e-9c45-2676628a54fb'
    },
    fromName: "Avaya Partner Programs",
    fromEmailGSMB: 'Avaya Cloud Team',
    fromEmail: "noreply@avaya.com",
    emailCategory: "Avaya Partner Programs",
    bcc: config.environment == 'production' ? constants.PARTNER_APPROVERS : config.currentDeveloperEmails
  },
  partnerOrderEmail: { // used
    send: true,
    //templateId: "11daafbe-cdc7-40f4-a2fa-c271d2c06272",
    templateId: {
      'en-US': 'a597d0c7-5b5f-4fa0-b37c-8907c0d3aef0'
    },
    fromName: "Avaya Partner Programs",
    fromEmail: "noreply@avaya.com",
    fromEmailGSMB: 'Avaya Cloud Team',
    emailCategory: "Avaya Partner Program",
    bcc: config.environment == 'production' ? ["nicholasz@zang.io"] : config.currentDeveloperEmails
  },
  partnerInvitationEmail: {
    send: true,
    templateIds: {
      company: {
        'en-US': '7704fff4-064d-4ea2-9b5e-0409690d3974'
      },
      agent: {
        'en-US': '596edfc0-3e9a-49ef-b4f6-cadcf265c902'
      }
    },
    // templateId: {
    //   //sales: "da5a8b88-adf5-499a-b184-63ee3b2e0289",
    //   'en-US': '596edfc0-3e9a-49ef-b4f6-cadcf265c902'
    //   // referral: "70017263-5f74-4d5f-85ad-62d9ef610467"
    // },
    fromName: "Avaya Partner Programs",
    fromEmail: "noreply@avaya.com",
    fromEmailGSMB: 'Avaya Cloud Team',
    emailCategory: "Avaya Partner Programs",
    bcc: []
  },
  ipOfficeProvisioningEmail: {
    send: true,
    templateId: {
      'en-US': '1ead954f-5040-4929-8f81-b44cc7e2a1d9'
    },
    fromName: 'Avaya Store',
    fromEmail: constants.SUPPORT_EMAILS.CLOUD_CS,
    emailCategory: 'IP office Provisioning Emails',
    //cc: [constants.SUPPORT_EMAILS.IP_OFFICE_CS],
    bcc: config.environment == 'production' ? [constants.SUPPORT_EMAILS.CLOUD_CS, constants.SUPPORT_EMAILS.CLOUD_DEVOPS, constants.SUPPORT_EMAILS.CLOUD_SUPPORT] : config.currentDeveloperEmails
  },
  invoiceEmail: { // not used
    send: true,
    templateId: {
      'en-US': '1ead954f-5040-4929-8f81-b44cc7e2a1d9'
    },
    fromName: 'Avaya Store',
    fromEmail: constants.SUPPORT_EMAILS.CLOUD_CS,
    emailCategory: 'Interval Invoice',
    //cc: [constants.SUPPORT_EMAILS.IP_OFFICE_CS],
    bcc: config.environment == 'production' ? [constants.SUPPORT_EMAILS.CLOUD_CS, constants.SUPPORT_EMAILS.CLOUD_DEVOPS] : config.currentDeveloperEmails
  },
  poEmail: {
    send: true,
    templateId: {
      'en-US': '1ead954f-5040-4929-8f81-b44cc7e2a1d9'
    },
    fromName: 'Avaya Store',
    fromEmail: 'noreply@avaya.com',
    emailCategory: 'Purchase Order Pending',
    //cc: [constants.SUPPORT_EMAILS.IP_OFFICE_CS],
    bcc: config.environment == 'production' ? [] : config.currentDeveloperEmails
  },
  genericEmail: {
    send: true,
    templateId: {
      'en-US': 'ca17bff3-e683-4b18-aa58-0716d606f555' //'1ead954f-5040-4929-8f81-b44cc7e2a1d9'
    },
    fromName: 'Avaya Store',
    fromEmail: 'noreply@avaya.com',
    fromEmailGSMB: 'Avaya Cloud Team',
    emailCategory: 'Generic',
    bcc: config.environment == 'production' ? [] : config.currentDeveloperEmails
  },
  legalDocEmail: {
    send: true,
    templateId: {
      'en-US': '2066cd5e-f66c-4c8a-abf5-8490d0972f27'
    },
    fromName: 'Avaya Store',
    fromEmail: 'noreply@avaya.com',
    emailCategory: 'IP office Legal Emails',
    bcc: config.environment == 'production' ? [constants.LEGAL_DOCS.legalDocEmail] : []
  }
}
