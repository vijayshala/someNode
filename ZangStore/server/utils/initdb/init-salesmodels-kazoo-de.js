const logger = require('applogger');

const { ProductBackend } = require('../../product/product.backend');
const { SalesModelBackend } = require('../../salesmodel/salesmodel.backend');
const { KAZOO_USER_TYPE_ESSENTIAL, KAZOO_USER_TYPE_BUSINESS, KAZOO_USER_TYPE_POWER } = require('../../kazoo/constants');

const initSalesModelsKazooDe = async(options) => {
  const fn = `[initSalesModelsKazooDe]`;
  const collection = 'salesmodel';
  options = Object.assign({
    emptyCollection: false,
  }, options);

  let docs;

  if (options.emptyCollection) {
    logger.info(fn, `empty ${collection}s collection...`);
    await SalesModelBackend.remove();
  }

  logger.info(fn, `loading products...`);
  const products = await ProductBackend.find();
  if (!products || !products.length) {
    throw new Error('Product is empty');
  }
  logger.info(fn, `${products.length} products found.`);
  const productsMap = {};
  products.forEach((one) => {
    productsMap[one.identifier] = one;
  });

  const kazooOfficeDevices = [{
    //   type: 'product',
    //   identifier: 'ipoapplication',
    //   title: {
    //     text: 'Avaya Cloud IP Office Softphone',
    //     resource: 'IP_OFFICE_PHONE_APPLICATION',
    //   },
    //   description: {
    //     text: 'The Avaya Cloud IP Office softphone provides users with simple access to all the communication channels in a single interface. Avaya Cloud IP Office softphone enables you to log into your Avaya Cloud IP Office and make and receive voice and video calls from your deskphone extension using your PC. Softphone is included for free with Avaya Cloud IP Office Standard and Power user subscriptions.',
    //     resource: 'IP_OFFICE_PHONE_DESCRIPTION',
    //   },
    //   images: [{
    //     identifier: 'default',
    //     url: 'https://storage.googleapis.com/avayastore/public_files/avaya_IPO_app_icon.svg',
    //   }, {
    //     identifier: 'grey',
    //     url: 'https://storage.googleapis.com/avayastore/public_files/avaya_IPO_app_icon.svg',
    //   }],
    //   product: {
    //     identifier: 'ipoapplication',
    //     _id: productsMap['ipoapplication'] && productsMap['ipoapplication']._id,
    //   },
    //   price: 0,
    //   isOneTimeCharge: true,
    //   defaultQuantity: 0,
    //   tags: ['devices'],
    //   references: { sku: 'AVAYA-KZO-DE-APPLICATION' },
    // }, {
    type: 'product',
    identifier: 'avayaj129',
    title: {
      text: 'Avaya J129 IP Deskphone',
      resource: 'AVAYA_J129_LABEL',
    },
    description: {
      text: 'Get all your essential call-handling features in an affordable, yet highly functional SIP Phone. This phone delivers the key features needed by users in any-size businesses. The phone supports two call appearances with single-line call display. Buy a phone with solid features that trumps what’s available in the market today.',
      resource: 'AVAYA_J129_DESCRIPTION',
    },
    images: [{
      identifier: 'default',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-J129.png',
    }, {
      identifier: 'grey',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-J129.png',
    }],
    product: {
      identifier: 'avayaj129',
      _id: productsMap['avayaj129'] && productsMap['avayaj129']._id,
    },
    price: 110.30,
    isOneTimeCharge: true,
    defaultQuantity: 0,
    tags: ['devices'],
    references: { sku: 'AVAYA-PHONE-J129' },
  }, {
    type: 'product',
    identifier: 'avayaj139',
    title: {
      text: 'Avaya J139 Phone',
      resource: 'AVAYA_J139_LABEL',
    },
    description: {
      text: 'The Avaya J139 phone is a cost-effective fully functional phone with support for integrated gigabit and monochrome display. Power over Ethernet simplifies deployment and its wideband audio codec provides exceptional audio performance. Designed for small to large enterprises, this deskphone includes access to eight lines and graphical labels that can be administered centrally.',
      resource: 'AVAYA_J139_DESCRIPTION',
    },
    images: [{
      identifier: 'default',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-j139.png',
    }, {
      identifier: 'grey',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-j139.png',
    }],
    product: {
      identifier: 'avayaj139',
      _id: productsMap['avayaj139'] && productsMap['avayaj139']._id,
    },
    price: 163.50,
    isOneTimeCharge: true,
    defaultQuantity: 0,
    tags: ['devices'],
    references: { sku: 'AVAYA-PHONE-J139' },
  }, {
    type: 'product',
    identifier: 'avayaj169',
    title: {
      text: 'Avaya J169 Phone',
      resource: 'AVAYA_J169_LABEL',
    },
    description: {
      text: 'The Avaya J169 phone is a cost-effective fully functional phone with support for integrated gigabit and monochrome display. Power over Ethernet simplifies deployment and its wideband audio codec provides exceptional audio performance. Designed for small to large enterprises, this deskphone includes access to eight lines and graphical labels that can be administered centrally.',
      resource: 'AVAYA_J169_DESCRIPTION',
    },
    images: [{
      identifier: 'default',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-j169.png',
    }, {
      identifier: 'grey',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-j169.png',
    }],
    product: {
      identifier: 'avayaj169',
      _id: productsMap['avayaj169'] && productsMap['avayaj169']._id,
    },
    price: 242.80,
    isOneTimeCharge: true,
    defaultQuantity: 0,
    tags: ['devices'],
    references: { sku: 'AVAYA-PHONE-J169' },
  }, {
    type: 'product',
    identifier: 'avayaj179',
    title: {
      text: 'Avaya J179 Phone',
      resource: 'AVAYA_J179_LABEL',
    },
    description: {
      text: 'The Avaya J179 phone is a cost-effective fully functional phone with support for integrated gigabit and monochrome display. Power over Ethernet simplifies deployment and its wideband audio codec provides exceptional audio performance. Designed for small to large enterprises, this deskphone includes access to eight lines and graphical labels that can be administered centrally.',
      resource: 'AVAYA_J179_DESCRIPTION',
    },
    images: [{
      identifier: 'default',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-j179.png',
    }, {
      identifier: 'grey',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-j179.png',
    }],
    product: {
      identifier: 'avayaj179',
      _id: productsMap['avayaj179'] && productsMap['avayaj179']._id,
    },
    price: 287.80,
    isOneTimeCharge: true,
    defaultQuantity: 0,
    tags: ['devices'],
    references: { sku: 'AVAYA-PHONE-J179' },
  }, {
    type: 'product',
    identifier: 'avayaht802',
    title: {
      text: 'Analog Adapter 2 Ports',
      resource: 'AVAYA_HT802_LABEL',
    },
    description: {
      text: '',
      resource: 'AVAYA_HT802_DESCRIPTION',
    },
    images: [{
      identifier: 'default',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-k175.png',
    }, {
      identifier: 'grey',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-k175.png',
    }],
    product: {
      identifier: 'avayaht802',
      _id: productsMap['avayaht802'] && productsMap['avayaht802']._id,
    },
    price: 42.60,
    isOneTimeCharge: true,
    defaultQuantity: 0,
    tags: ['devices'],
    references: { sku: 'AVAYA-PHONE-HT802' },
  }, {
    type: 'product',
    identifier: 'avayaS850',
    title: {
      text: 'DECT Gigaset S850 GO',
      resource: 'AVAYA_PHONE_S850_LABEL',
    },
    description: {
      text: '',
      resource: 'AVAYA_PHONE_S850_DESCRIPTION',
    },
    images: [{
      identifier: 'default',
      url: 'https://storage.googleapis.com/avayastore/public_files/B179.png', // FIX ME
    }, {
      identifier: 'grey',
      url: 'https://storage.googleapis.com/avayastore/public_files/B179.png',
    }],
    product: {
      identifier: 'avayaS850',
      _id: productsMap['avayaS850'] && productsMap['avayaS850']._id,
    },
    price: 92.30,
    isOneTimeCharge: true,
    defaultQuantity: 0,
    tags: ['devices'],
    references: { sku: 'AVAYA-PHONE-S850' },
  }];

  const ucOfferStandardRules = [{
    identifier: 'remove-other-items',
    event: 'before-update-cart',
    parameters: [{ parameter: 'tag', value: 'uc-kazoo-offer' }]
  }];

  const ucSolutionUserTypes = (salesModelIdentifier) => {
    return [{
      isPrimary: true,
      identifier: 'kazoo-essential-user',
      title: {
        text: 'Avaya Office Essential User',
      },
      descriptions: [{
        identifier: 'short-title',
        text: 'Avaya Office Essential',
      }, {
        identifier: 'long-title',
        text: 'Avaya Office Essential User',
      }, {
        identifier: 'default',
        text: "Optimized for a Standard Unified Communication worker and built for success. <span style='color:#000000;font-weight:600;'>Includes a FREE Avaya Spaces Standard User.</span>",
      },{
        identifier: 'title-plural',
        text: 'Essential Users',
      }],
      regularPrice: 6.95,
      price: 6.95,
      maxQuantity: 999,
      defaultQuantity: 0,
      // attributes: [{
      //   identifier: 'direct-phone-number',
      //   title: {
      //     text: 'Direct Phone Number'
      //   },
      //   descriptions: [{
      //     identifier: 'default',
      //     text: 'Gain a dedicated, unique number, so anyone can call you directly instead of working through the office main number and receptionist (virtual or human). Direct Phone Number included in Power User subscription pricing.'
      //   }],
      //   price: 5,
      //   tags: ['addon', 'addon-by-usertypes', 'addon-direct-phone-number'],
      //   references: { sku: 'ZANG-OFLO-USER' }, // FIXME: product code
      // }],
      rules: [{
        identifier: 'add-another-item',
        event: 'before-update-cart',
        parameters: [{
            parameter: 'identifier',
            value: `${salesModelIdentifier}..zang-spaces-basic-user`,
          },
          {
            parameter: 'quantityTag',
            value: KAZOO_USER_TYPE_ESSENTIAL
          },
        ],
      }],
      tags: ['user-types', KAZOO_USER_TYPE_ESSENTIAL],
      references: {
        sku: 'AVAYA-KZO-DEB',
        servicePlanId: 'essential_user'
      },
    }, {
      identifier: 'kazoo-business-user',
      title: {
        text: 'Avaya Office Business User',
      },
      descriptions: [{
        identifier: 'short-title',
        text: 'Avaya Office Business',
      }, {
        identifier: 'long-title',
        text: 'Avaya Office Business User',
      }, {
        identifier: 'default',
        text: "Optimized for a Standard Unified Communication worker and built for success. <span style='color:#000000;font-weight:600;'>Includes a FREE Avaya Spaces Standard User.</span>",
      },
      {
        identifier: 'title-plural',
        text: 'Business Users',
      }],
      regularPrice: 12.95,
      price: 12.95,
      maxQuantity: 999,
      defaultQuantity: 0,
      rules: [{
        identifier: 'add-another-item',
        event: 'before-update-cart',
        parameters: [{
            parameter: 'identifier',
            value: `${salesModelIdentifier}..zang-spaces-plus-user`,
          },
          {
            parameter: 'quantityTag',
            value: KAZOO_USER_TYPE_BUSINESS
          },
        ],
      }],
      tags: ['user-types', KAZOO_USER_TYPE_BUSINESS],
      references: {
        sku: 'AVAYA-KZO-DES',
        servicePlanId: 'business_user'
      },
    }, {
      identifier: 'kazoo-power-user',
      title: {
        text: 'Avaya Office Power User',
      },
      descriptions: [{
        identifier: 'short-title',
        text: 'Avaya Office Power',
      }, {
        identifier: 'long-title',
        text: 'Avaya Office Power User',
      }, {
        identifier: 'default',
        text: "Optimized for a Standard Unified Communication worker and built for success. <span style='color:#000000;font-weight:600;'>Includes a FREE Avaya Spaces Standard User.</span>",
      },
      {
        identifier: 'title-plural',
        text: 'Power Users',
      }],
      regularPrice: 19.95,
      price: 19.95,
      maxQuantity: 999,
      defaultQuantity: 0,
      rules: [{
        identifier: 'add-another-item',
        event: 'before-update-cart',
        parameters: [{
            parameter: 'identifier',
            value: `${salesModelIdentifier}..zang-spaces-business-user`,
          },
          {
            parameter: 'quantityTag',
            value: KAZOO_USER_TYPE_POWER
          },
        ],
      }],
      tags: ['user-types', KAZOO_USER_TYPE_POWER, 'bestdeal'],
      references: {
        sku: 'AVAYA-KZO-DEP',
        servicePlanId: 'power_user'
      },
    }];
  };
  const ucSolutionSystemAddons = [
    {
      identifier: 'pay-as-you-go-minutes',
      title: {
        text: 'Pay as you go minutes',
        resource: 'PAY_AS_YOU_GO_MINUTES'
      },
      descriptions: [{
        identifier: 'default',
        text: 'Pay as you go minutes.'
      }],
      price: 0,
      regularPrice: 0,
      defaultQuantity: 1,
      minQuantity: 0,
      tags: ['addon', 'quantity-match-item', 'usage-flat-rate-addon'],
      rules: [{
        identifier: 'quantity-match-item',
        event: 'before-update-cart',
        parameters: [{
          parameter: 'quantityTag',
          value: 'user-types'
        }]
      }, {
        identifier: 'remove-other-items',
        event: 'before-update-cart',
        parameters: [{ parameter: 'tag', value: 'usage-flat-rate-addon' }]
      }],
      references: {
        sku: 'AVAYA-KZO-PAYG'
      }
    }, {
    identifier: 'flatrate-national-fixed-net',
    title: {
      text: 'Flatrate national fixed net',
      resource: 'FLATRATE_NATIONAL_FIXED_NET'
    },
    descriptions: [{
      identifier: 'default',
      text: 'Flatrate national fixed net.'
    }],
    price: 6,
    regularPrice: 6,
    minQuantity: 0,
    tags: ['addon', 'quantity-match-item', 'usage-flat-rate-addon'],
    rules: [{
      identifier: 'quantity-match-item',
      event: 'before-update-cart',
      parameters: [{
        parameter: 'quantityTag',
        value: 'user-types'
      }]
    }, {
      identifier: 'remove-other-items',
      event: 'before-update-cart',
      parameters: [{ parameter: 'tag', value: 'usage-flat-rate-addon' }]
    }],
    references: {
      sku: 'AVAYA-KZO-FRNF'
    }
  }, {
    identifier: 'flatrate-national-fixed-netmobile',
    title: {
      text: 'Flatrate national fixed net and mobile',
      resource: 'FLATRATE_NATIONAL_FIXED_NET_MOBILE'
    },
    descriptions: [{
      identifier: 'default',
      text: 'Flatrate national fixed net and mobile.'
    }],
    price: 11,
    regularPrice: 11,
    minQuantity: 0,
    tags: ['addon', 'quantity-match-item', 'usage-flat-rate-addon'],
    rules: [{
      identifier: 'quantity-match-item',
      event: 'before-update-cart',
      parameters: [{
        parameter: 'quantityTag',
        value: 'user-types'
      }]
    }, {
      identifier: 'remove-other-items',
      event: 'before-update-cart',
      parameters: [{ parameter: 'tag', value: 'usage-flat-rate-addon' }]
    }],
    references: {
      sku: 'AVAYA-KZO-FRNM'
    }
  }, {
    identifier: 'kazoo-voicemail-box-addon',
    title: {
      text: 'Voicemail box addon',
      resource: 'VOICEMAIL_BOX_ADDON'
    },
    descriptions: [{
      identifier: 'default',
      text: 'Voicemail box addon'
    }],
    price: 1,
    regularPrice: 1,
    minQuantity: 0,
    tags: ['addon', 'kazoo-feature-addon', 'hide'],
    references: {
      sku: 'AVAYA-KZO-VM'
    }
  }, {
    identifier: 'kazoo-conference-bridge-addon',
    title: {
      text: 'Conference bridge addon',
      resource: 'CONFERENCE_BRIDGE_ADDON'
    },
    descriptions: [{
      identifier: 'default',
      text: 'Conference bridge addon'
    }],
    price: 2,
    regularPrice: 2,
    minQuantity: 0,
    tags: ['addon', 'kazoo-feature-addon', 'hide'],
    references: {
      sku: 'AVAYA-KZO-CONF'
    }
  }, {
    identifier: 'kazoo-device-addon',
    title: {
      text: 'Device addon',
      resource: 'DEVICE_ADDON'
    },
    descriptions: [{
      identifier: 'default',
      text: 'Device addon'
    }],
    price: 2,
    regularPrice: 2,
    minQuantity: 0,
    tags: ['addon', 'kazoo-feature-addon', 'hide' ],
    references: {
      sku: 'AVAYA-KZO-DEV'
    }
  }];
  const ucSolutionMainDid = [{
    identifier: 'did-existing',
    title: {
      text: 'Transfer Existing Number',
      resource: 'USE_EXISTING_NUMBER',
    },
    descriptions: [{
      identifier: 'short-title',
      text: 'Transfer Number',
      resource: 'TRANSFER_NUMBER',
    }, {
      identifier: 'default',
      text: 'Select to transfer an existing number to your plan',
      resource: 'SELECT_TO_USE_YOUR_EXISTING_NUMBER_WITH_YOUR_PLAN',
    }, {
      identifier: 'notes',
      text: 'Please note that the phone number transferring process could take up to 10 business days. In the meantime, we will attach a temporary phone number for you to use within your account.',
      resource: 'USE_EXISTING_NUMBER_POPUP_INFORMATION',
    }, {
      identifier: 'cart-title',
      text: 'Transfer Number',
      resource: 'TRANSFER_NUMBER',
    }],
    isOneTimeCharge: true,
    price: 0,
    tags: ['did', 'did-main', 'did-existing', 'no-config'],
    references: { sku: 'AVAYA-KZO-DID-EXH' },
  }, {
    identifier: 'did-local',
    title: {
      text: 'Find a Local Number',
      resource: 'FIND_A_LOCAL_NUMBER',
    },
    descriptions: [{
      identifier: 'short-title',
      text: 'Local Number',
      resource: 'LOCAL_NUMBER',
    }, {
      identifier: 'default',
      text: 'Select to add a local number to your plan',
      resource: 'SELEC_TO_ADD_A_LOCAL_NUMBER_TO_YOUR_PLAN',
    }, {
      identifier: 'cart-title',
      text: 'Local Number',
      resource: 'LOCAL_NUMBER',
    }],
    tags: ['did', 'did-main', 'did-local', 'info-only', 'no-config'],
    references: { sku: 'AVAYA-KZO-DID-LOC' },
  }];
  const ucSolutionSpacesBundle = [{
    type: 'product',
    identifier: 'zang-spaces-basic-user',
    title: {
      text: 'Avaya Spaces™ Essential User',
    },
    descriptions: [{
      identifier: 'default',
      text: "GiveEnjoy Avaya Spaces for FREE and experience many of its amazing features like direct messaging, limited file sharing, individual task management, unlimited 1-on-1 video calls, plus up to 5 participants on voice calls. In addition, for the next 90 days, you'll have access to test drive our 'Plus' plan, which includes unlimited file sharing, group tasks, and enhanced voice/video functionality.",
    }, {
      identifier: 'short-title',
      text: 'Essential',
    }],
    product: {
      identifier: 'zang-spaces',
      _id: productsMap['zang-spaces'] && productsMap['zang-spaces']._id,
      engines: productsMap['zang-spaces'] && productsMap['zang-spaces'].engines,
    },
    price: 0,
    attributes: [],
    tags: ['zang-spaces', 'zang-spaces-basic'],
    references: { sku: 'ZANG-SPBA-USER-BDL', licenseType: 'zangspaces_free' },
  }, {
    type: 'product',
    identifier: 'zang-spaces-plus-user',
    title: {
      text: 'Avaya Spaces™ Business User',
    },
    descriptions: [{
      identifier: 'default',
      text: "Give your team the elite Spaces experience with direct messaging, unlimited file sharing, group task management, unlimited 1-on-1 video calls, plus have up to 25 participants on voice calls, and up to 15 for video calls. Dial-in add-on available.",
    }, {
      identifier: 'short-title',
      text: 'Business',
    }],
    product: {
      identifier: 'zang-spaces',
      _id: productsMap['zang-spaces'] && productsMap['zang-spaces']._id,
      engines: productsMap['zang-spaces'] && productsMap['zang-spaces'].engines,
    },
    price: 0,
    attributes: [],
    tags: ['zang-spaces', 'zang-spaces-plus'],
    references: { sku: 'ZANG-SPPL-USER-BDL', licenseType: 'zangspaces_team' },
  }, {
    type: 'product',
    identifier: 'zang-spaces-business-user',
    title: {
      text: 'Avaya Spaces™ Power User',
    },
    descriptions: [{
      identifier: 'default',
      text: "Collaborate like an industry leader with the ultimate Spaces experience and enjoy all the features of a team user, plus have up to 60 participants for voice calls, and up to 25 for video calls. Dial-in features are built into all of your spaces + many more features!",
    }, {
      identifier: 'short-title',
      text: 'Power',
    }],
    product: {
      identifier: 'zang-spaces',
      _id: productsMap['zang-spaces'] && productsMap['zang-spaces']._id,
      engines: productsMap['zang-spaces'] && productsMap['zang-spaces'].engines,
    },
    price: 0,
    attributes: [],
    tags: ['zang-spaces', 'zang-spaces-business'],
    references: { sku: 'ZANG-SPBU-USER-BDL', licenseType: 'zangspaces_business' },
  }];

  const ucSolutionContractDiscountRule = (salesModelIdentifier, discountIdentifier) => {
    return [{
      identifier: 'remove-other-items',
      event: 'before-update-cart',
      parameters: [{ parameter: 'tag', value: 'discount' }]
    }, {
      identifier: 'add-another-item',
      event: 'before-update-cart',
      parameters: [
        { parameter: 'identifier', value: `${salesModelIdentifier}..${discountIdentifier}` },
        { parameter: 'quantityTag', value: 'user-types' },
      ],
    }];
  };

  const ucSolutionContractPrepopulateRule = (deviceIdentifier) => {
    return [{
      identifier: 'prepopulate-other-items',
      event: 'before-config-init-cart',
      parameters: [ 
        { parameter: 'tag', value: 'devices' },
        { parameter: 'identifier', value: deviceIdentifier },
        { parameter: 'follow', value: 'parent' },
      ]
    }];
  };

  const generalLegalDocument = {
    identifier: 'gsmb-general-legal-tos',
    title: {
      text: 'GSMB Terms of Service',
      resource: 'GSMB_TOS',
    },
    version: '1.0',
    url: '',
    content: {
      text: 'The <a href="https://www.avaya.com/de/documents/avaya-office-und-spaces-allgemeine-geschaftsbedingungen.pdf" target="_blank" rel="noopener noreferrer"> Avaya Communication Cloud Terms & Conditions </a>, which are <a href="https://www.avaya.com/de/documents/avaya-office-und-spaces-leistungsbeschreibung.pdf" target="_blank rel="noopener noreferrer">specifications</a> and the <a href="https://www.avaya.com/de/documents/avaya-office-und-spaces-preisliste.pdf" target="_blank" rel="noopener noreferrer"> price lists </a> of the selected products and the <a href="https://www.avaya.com/de/documents/avaya-office-und-spaces-datenschutz.pdf" target="_blank" rel="noopener noreferrer"> privacy policy </a> I have read and agree with this.',
      resource: 'GSMB_GENERAL_LEGAL_TOS',
    },
    display: 'newwindow',
    requireUserConsent: true,
  };

  // const priceListLegalDoc = {
  //   identifier: 'avaya-office-prices',
  //   title: {
  //     text: 'Avaya Office Price List',
  //     resource: 'AVAYA_OFFICE_PRICE_LIST',
  //   },
  //   version: '1.0.0',
  //   url: 'https://storage.googleapis.com/avayastore/html/AvayaOfficeundSpacesPreislisteV3.html',
  //   pdf: 'https://storage.googleapis.com/avayastore/pdf/Avaya%20Office%20und%20Spaces%20Preisliste%20V3.pdf',
  //   display: 'modal',
  //   requireUserConsent: true,
  // };

  // const termsAndConditionsLegalDoc = {
  //   identifier: 'avaya-office-term-conditions',
  //   title: {
  //     text: 'General Terms of Service - Avaya Office and Spaces',
  //     resource: 'GENERAL_TERMS_OF_SERVICE_AVAYA_OFFICE_SPACES',
  //   },
  //   version: '1.0.0',
  //   url: 'https://storage.googleapis.com/avayastore/html/AvayaOfficeundSpacesLeistungsbeschreibungV5.html',
  //   pdf: 'https://storage.googleapis.com/avayastore/pdf/Avaya%20Office%20und%20Spaces%20Leistungsbeschreibung%20V5.pdf',
  //   display: 'modal',
  //   requireUserConsent: true,
  // };

  const uiStepFootNote = [
    {
      identifier: 'ui.footnote.step.user-types.label',
      text: 'Have large numbers of users?',
      resource: 'HAVE_LARGE_NUMBERS_OF_USERS',
    },
    { 
      identifier: 'ui.footnote.step.user-types.link.label',
      text: 'Review our volume discount breakdown.',
      resource: 'REVIEW_OUR_VOLUME_DISCOUNT_BREAKDOWN',
    },
    {
      identifier: 'ui.footnote.step.devices.label',
      text: 'USE_EXISTING_NUMBER_POPUP_INFORMATION',
      resource: 'USE_EXISTING_NUMBER_POPUP_INFORMATION',
    },
  ]

  docs = [{
    status: 'active',
    currency: 'EUR',  
    allowed_regions: ['DE'],
    identifier: 'avaya-office-sb-de-monthly',
    title: {
      text: 'Cloud UC Solution Monthly Plan',
      resource: 'CLOUD_UC_SOLUTION_MONTHLY_PLAN',
    },
    descriptions: [{
      identifier: 'short-title',
      text: 'UC Solution',
    }, {
      identifier: 'default',
      text: 'Empower your company with the ultimate enterprise communications in the cloud',
      },
    ...uiStepFootNote],
    product: {
      identifier: 'kazoo',
      _id: productsMap['kazoo'] && productsMap['kazoo']._id,
      engines: productsMap['kazoo'] && productsMap['kazoo'].engines,
    },
    subscription: {
      contractLength: 1,
      contractPeriod: 'month',
      billingInterval: 1,
      billingPeriod: 'month',
    },
    rules: [...ucOfferStandardRules],
    items: [
      ...ucSolutionUserTypes('avaya-office-sb-de-monthly'),
      ...ucSolutionSystemAddons,
      ...kazooOfficeDevices,
      ...ucSolutionMainDid,
      ...ucSolutionSpacesBundle,
    ],
    tags: ['uc-kazoo-offer', 'avaya-office-sb-de'],
    legalDocuments: [generalLegalDocument],
    created: {
      by: null,
      on: new Date()
    },
    references: {
      servicePlanId: 'germany_service_plan'
    }
  }];

  for (let doc of docs) {
    logger.info(fn, `creating "${doc.identifier}" ...`);
    let result = await SalesModelBackend.findOneAndUpdate({
      identifier: doc.identifier,
    }, doc, { upsert: true, returnNewDocument: true });
    logger.info(fn, `    "${doc.identifier}" created`, result);
  }
};

module.exports = initSalesModelsKazooDe;
