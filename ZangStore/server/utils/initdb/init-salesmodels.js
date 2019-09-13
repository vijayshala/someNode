const logger = require('applogger');

const { ProductBackend } = require('../../product/product.backend');
const { SalesModelBackend } = require('../../salesmodel/salesmodel.backend');

const initSalesModels = async(options) => {
  const fn = `[initSalesModels]`;
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

  const ipOfficeLegacyDevices = [{
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
    price: 79.95,
    isOneTimeCharge: true,
    defaultQuantity: 0,
    tags: ['devices'],
    references: { 
      sku: 'AVAYA-PHONE-J129',
      provisionCode: 'J129'
    },
  }, {
    type: 'product',
    identifier: 'avaya9608g',
    title: {
      text: 'Avaya 9608G IP Deskphone',
      resource: 'AVAYA_9608G_LABEL',
    },
    description: {
      text: 'The 9608G deskphone is a cost-effective fully functional phone with support for integrated gigabit and monochrome display. Power over Ethernet simplifies deployment and its wideband audio codec provides exceptional audio performance. Designed for small to large enterprises, this deskphone includes access to eight lines and graphical labels that can be administered centrally.',
      resource: 'AVAYA_9608G_DESCRIPTION',
    },
    images: [{
      identifier: 'default',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-9608g.png',
    }, {
      identifier: 'grey',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-9608g.png',
    }],
    product: {
      identifier: 'avaya9608g',
      _id: productsMap['avaya9608g'] && productsMap['avaya9608g']._id,
    },
    price: 249.95,
    isOneTimeCharge: true,
    defaultQuantity: 0,
    tags: ['devices'],
    references: { 
      sku: 'AVAYA-PHONE-9608G',
      provisionCode: '9608G'
    },
  }, {
    type: 'product',
    identifier: 'avaya9611g',
    title: {
      text: 'Avaya 9611G IP Deskphone',
      resource: 'AVAYA_9611G_LABEL',
    },
    description: {
      text: 'The 9611G model includes integrated gigabit and a USB interface. It has a 3.5 inch graphical color display with a white backlight and graphical labels that can be administered centrally. Power over Ethernet simplifies deployment and its wideband audio codec provides exceptional audio performance.',
      resource: 'AVAYA_9611G_DESCRIPTION',
    },
    images: [{
      identifier: 'default',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-9611G.png',
    }, {
      identifier: 'grey',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-9611G.png',
    }],
    product: {
      identifier: 'avaya9611g',
      _id: productsMap['avaya9611g'] && productsMap['avaya9611g']._id,
    },
    price: 319.95,
    isOneTimeCharge: true,
    defaultQuantity: 0,
    tags: ['devices'],
    references: { 
      sku: 'AVAYA-PHONE-9611G',
      provisionCode: '9611G'
    },
  }, {
    type: 'product',
    identifier: 'avaya9641g',
    title: {
      text: 'Avaya 9641GS IP Deskphone',
      resource: 'AVAYA_9641G_LABEL',
    },
    description: {
      text: 'The Avaya 9641GS is a multi-line solutions deskphone ideally suited for people who spend considerable amounts of time on the phone and who rely on intelligent communications and productivity enhancing capabilities. The 9641GS has a 5.0 inch color graphical display, larger touch screen and high definition audio quality. Its wideband audio codec provides exceptional audio performance on all audio interfaces including handset, headset and speaker phone.',
      resource: 'AVAYA_9641G_DESCRIPTION',
    },
    images: [{
      identifier: 'default',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-9641gs.png',
    }, {
      identifier: 'grey',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-9641gs.png',
    }],
    product: {
      identifier: 'avaya9641g',
      _id: productsMap['avaya9641g'] && productsMap['avaya9641g']._id,
    },
    price: 449.95,
    isOneTimeCharge: true,
    defaultQuantity: 0,
    tags: ['devices'],
    references: { 
      sku: 'AVAYA-PHONE-9641G',
      provisionCode: '9641GS'
    },
  }, {
    type: 'product',
    identifier: 'avayab179',
    title: {
      text: 'Avaya B179 SIP Conference Phone',
      resource: 'AVAYA_PHONE_B179_LABEL',
    },
    description: {
      text: 'Tested by Tolly, this flexible SIP-based conference phone delivers clear, natural sound from OmniSound 2.0, Avaya’s patented wideband audio technology. The phone is packed with intelligent features for more efficient conference calls. Use the conference guide to call pre-programmed groups. Import and export contact details conveniently via the web interface. Create your own contact list with the personal user profile feature.',
      resource: 'AVAYA_PHONE_B179_DESCRIPTION',
    },
    images: [{
      identifier: 'default',
      url: 'https://storage.googleapis.com/avayastore/public_files/B179.png',
    }, {
      identifier: 'grey',
      url: 'https://storage.googleapis.com/avayastore/public_files/B179.png',
    }],
    product: {
      identifier: 'avayab179',
      _id: productsMap['avayab179'] && productsMap['avayab179']._id,
    },
    price: 699.95,
    isOneTimeCharge: true,
    defaultQuantity: 0,
    tags: ['devices'],
    references: { 
      sku: 'AVAYA-PHONE-B179',
      provisionCode: 'B179'
    },
  }];

  const ipOfficeDevices = [{
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
    //   references: { sku: 'AVAYA-IPO-APPLICATION' },
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
    price: 79.95,
    isOneTimeCharge: true,
    defaultQuantity: 0,
    tags: ['devices'],
    references: { 
      sku: 'AVAYA-PHONE-J129',
      provisionCode: 'J129'
    },
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
    price: 239.95,
    isOneTimeCharge: true,
    defaultQuantity: 0,
    tags: ['devices'],
    references: { 
      sku: 'AVAYA-PHONE-J169',
      provisionCode: 'J169'
    },
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
    price: 289.95,
    isOneTimeCharge: true,
    defaultQuantity: 0,
    tags: ['devices'],
    references: { 
      sku: 'AVAYA-PHONE-J179',
      provisionCode: 'J179'
    },
  }, {
    type: 'product',
    identifier: 'avayak175',
    title: {
      text: 'Avaya Vantage™ K175',
      resource: 'AVAYA_K175_LABEL',
    },
    description: {
      text: 'The Avaya K175 phone is a cost-effective fully functional phone with support for integrated gigabit and monochrome display. Power over Ethernet simplifies deployment and its wideband audio codec provides exceptional audio performance. Designed for small to large enterprises, this deskphone includes access to eight lines and graphical labels that can be administered centrally.',
      resource: 'AVAYA_K175_DESCRIPTION',
    },
    images: [{
      identifier: 'default',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-k175.png',
    }, {
      identifier: 'grey',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-k175.png',
    }],
    product: {
      identifier: 'avayak175',
      _id: productsMap['avayak175'] && productsMap['avayak175']._id,
    },
    price: 659.95,
    isOneTimeCharge: true,
    defaultQuantity: 0,
    tags: ['devices'],
    references: { 
      sku: 'AVAYA-PHONE-K175',
      provisionCode: 'K175'
    },
  }, {
    type: 'product',
    identifier: 'avayab179',
    title: {
      text: 'Avaya B179 SIP Conference Phone',
      resource: 'AVAYA_PHONE_B179_LABEL',
    },
    description: {
      text: 'Tested by Tolly, this flexible SIP-based conference phone delivers clear, natural sound from OmniSound 2.0, Avaya’s patented wideband audio technology. The phone is packed with intelligent features for more efficient conference calls. Use the conference guide to call pre-programmed groups. Import and export contact details conveniently via the web interface. Create your own contact list with the personal user profile feature.',
      resource: 'AVAYA_PHONE_B179_DESCRIPTION',
    },
    images: [{
      identifier: 'default',
      url: 'https://storage.googleapis.com/avayastore/public_files/B179.png',
    }, {
      identifier: 'grey',
      url: 'https://storage.googleapis.com/avayastore/public_files/B179.png',
    }],
    product: {
      identifier: 'avayab179',
      _id: productsMap['avayab179'] && productsMap['avayab179']._id,
    },
    price: 699.95,
    isOneTimeCharge: true,
    defaultQuantity: 0,
    tags: ['devices'],
    references: { 
      sku: 'AVAYA-PHONE-B179',
      provisionCode: 'B179'
    },
  }];

  const ucOfferStandardRules = [{
    identifier: 'remove-other-items',
    event: 'before-update-cart',
    parameters: [{ parameter: 'tag', value: 'ucoffer' }]
  }];

  const ipOfficeLegacyUserTypes = (salesModelIdentifier) => {
    return [{
      isPrimary: true,
      identifier: 'ip-office-basic-user',
      title: {
        text: 'Basic User',
      },
      descriptions: [{
        identifier: 'short-title',
        text: 'Basic',
      }, {
        identifier: 'long-title',
        text: 'Avaya Cloud IP Office™ Basic User',
      }, {
        identifier: 'default',
        text: "Optimized for a Standard Unified Communication worker and built for success. <span style='color:#000000;font-weight:600;'>Includes a FREE Zang Spaces Standard User.</span>",
      }],
      regularPrice: 34.95,
      price: 34.95,
      minQuantity: 1,
      maxQuantity: 3000,
      defaultQuantity: 2,
      attributes: [...ipOfficeLegacyDevices],
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
        identifier: 'quantity-based-price',
        event: 'before-update-cart',
        parameters: [{
          parameter: 'tag',
          value: 'user-types'
        }, {
          parameter: 'prices',
          value: [{
            maxQuantity: 5,
            price: 34.95,
            references: { sku: 'AVAY-IPOB-0005' },
          }, {
            maxQuantity: 99,
            price: 24.95,
            references: { sku: 'AVAY-IPOB-0099' },
          }, {
            minQuantity: 100,
            maxQuantity: 999,
            price: 22.95,
            references: { sku: 'AVAY-IPOB-0999' },
          }, {
            minQuantity: 1000,
            price: 19.95,
            references: { sku: 'AVAY-IPOB-1000' },
          }]
        }]
      }, {
        identifier: 'add-another-item',
        event: 'before-update-cart',
        parameters: [{
            parameter: 'identifier',
            value: `${salesModelIdentifier}..zang-spaces-basic-user`,
          },
          {
            parameter: 'quantityTag',
            value: 'basic-user'
          },
        ],
      }],
      tags: ['user-types', 'basic-user'],
      references: {
        sku: 'AVAY-IPOB-0005'
      },
    }, {
      identifier: 'ip-office-standard-user',
      title: {
        text: 'Standard User',
      },
      descriptions: [{
        identifier: 'short-title',
        text: 'Standard',
      }, {
        identifier: 'long-title',
        text: 'Avaya Cloud IP Office™ Standard User',
      }, {
        identifier: 'default',
        text: "Optimized for a Standard Unified Communication worker and built for success. <span style='color:#000000;font-weight:600;'>Includes a FREE Zang Spaces Standard User.</span>",
      }],
      regularPrice: 39.95,
      price: 39.95,
      minQuantity: 1,
      maxQuantity: 3000,
      defaultQuantity: 4,
      attributes: [...ipOfficeLegacyDevices],
      // attributes: [{
      //   identifier: 'direct-phone-number',
      //   title: {
      //     text: 'Direct Phone Number Included!'
      //   },
      //   descriptions: [{
      //     identifier: 'default',
      //     text: 'Gain a dedicated, unique number, so anyone can call you directly instead of working through the office main number and receptionist (virtual or human). Direct Phone Number included in Power User subscription pricing.'
      //   }],
      //   tags: ['addon', 'addon-by-usertypes', 'addon-direct-phone-number', 'included'],
      // }],
      rules: [{
        identifier: 'quantity-based-price',
        event: 'before-update-cart',
        parameters: [{
          parameter: 'tag',
          value: 'user-types'
        }, {
          parameter: 'prices',
          value: [{
            maxQuantity: 5,
            price: 39.95,
            references: { sku: 'AVAY-IPOS-0005' },
          }, {
            maxQuantity: 99,
            price: 29.95,
            references: { sku: 'AVAY-IPOS-0099' },
          }, {
            minQuantity: 100,
            maxQuantity: 999,
            price: 27.95,
            references: { sku: 'AVAY-IPOS-0999' },
          }, {
            minQuantity: 1000,
            price: 24.95,
            references: { sku: 'AVAY-IPOS-1000' },
          }]
        }]
      }, {
        identifier: 'add-another-item',
        event: 'before-update-cart',
        parameters: [{
            parameter: 'identifier',
            value: `${salesModelIdentifier}..zang-spaces-plus-user`,
          },
          {
            parameter: 'quantityTag',
            value: 'standard-user'
          },
        ],
      }],
      tags: ['user-types', 'standard-user'],
      references: {
        sku: 'AVAY-IPOS-0005'
      },
    }, {
      identifier: 'ip-office-power-user',
      title: {
        text: 'Power User',
      },
      descriptions: [{
        identifier: 'short-title',
        text: 'Power',
      }, {
        identifier: 'long-title',
        text: 'Avaya Cloud IP Office™ Power User',
      }, {
        identifier: 'default',
        text: "Optimized for a Standard Unified Communication worker and built for success. <span style='color:#000000;font-weight:600;'>Includes a FREE Zang Spaces Standard User.</span>",
      }],
      regularPrice: 49.95,
      price: 49.95,
      minQuantity: 1,
      maxQuantity: 3000,
      defaultQuantity: 4,
      attributes: [...ipOfficeLegacyDevices],
      // attributes: [{
      //   identifier: 'direct-phone-number',
      //   title: {
      //     text: 'Direct Phone Number Included!'
      //   },
      //   descriptions: [{
      //     identifier: 'default',
      //     text: 'Gain a dedicated, unique number, so anyone can call you directly instead of working through the office main number and receptionist (virtual or human). Direct Phone Number included in Power User subscription pricing.'
      //   }],
      //   tags: ['addon', 'addon-by-usertypes', 'addon-direct-phone-number', 'included'],
      // }],
      rules: [{
        identifier: 'quantity-based-price',
        event: 'before-update-cart',
        parameters: [{
          parameter: 'tag',
          value: 'user-types'
        }, {
          parameter: 'prices',
          value: [{
            maxQuantity: 5,
            price: 49.95,
            references: { sku: 'AVAY-IPOP-0099' },
          }, {
            maxQuantity: 99,
            price: 39.95,
            references: { sku: 'AVAY-IPOP-0099' },
          }, {
            minQuantity: 100,
            maxQuantity: 999,
            price: 37.95,
            references: { sku: 'AVAY-IPOP-0999' },
          }, {
            minQuantity: 1000,
            price: 34.95,
            references: { sku: 'AVAY-IPOP-1000' },
          }]
        }]
      }, {
        identifier: 'add-another-item',
        event: 'before-update-cart',
        parameters: [{
            parameter: 'identifier',
            value: `${salesModelIdentifier}..zang-spaces-business-user`,
          },
          {
            parameter: 'quantityTag',
            value: 'power-user'
          },
        ],
      }],
      tags: ['user-types', 'power-user', 'bestdeal'],
      references: {
        sku: 'AVAY-IPOP-0005'
      },
    }];
  };

  const ucSolutionUserTypes = (salesModelIdentifier) => {
    return [{
      isPrimary: true,
      identifier: 'ip-office-essential-user',
      title: {
        text: 'Essential User',
      },
      descriptions: [{
        identifier: 'short-title',
        text: 'Essential',
      }, {
        identifier: 'long-title',
        text: 'Avaya Cloud Solutions Essential User',
      }, {
        identifier: 'default',
        text: "Optimized for a Standard Unified Communication worker and built for success. <span style='color:#000000;font-weight:600;'>Includes a FREE Avaya Spaces Standard User.</span>",
      },{
        identifier: 'title-plural',
        text: 'Essential Users',
      }],
      regularPrice: 24.95,
      price: 24.95,
      minQuantity: 1,
      maxQuantity: 3000,
      defaultQuantity: 2,
      attributes: [...ipOfficeDevices],
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
        identifier: 'quantity-based-price',
        event: 'before-update-cart',
        parameters: [{
          parameter: 'tag',
          value: 'user-types'
        }, {
          parameter: 'prices',
          value: [{
            maxQuantity: 99,
            price: 24.95,
            references: { sku: 'AVAYA-IPOB-0099' },
          }, {
            minQuantity: 100,
            maxQuantity: 999,
            price: 22.95,
            references: { sku: 'AVAYA-IPOB-0999' },
          }, {
            minQuantity: 1000,
            price: 19.95,
            references: { sku: 'AVAYA-IPOB-1000' },
          }]
        }]
      }, {
        identifier: 'add-another-item',
        event: 'before-update-cart',
        parameters: [{
            parameter: 'identifier',
            value: `${salesModelIdentifier}..zang-spaces-basic-user`,
          },
          {
            parameter: 'quantityTag',
            value: 'basic-user'
          },
        ],
      }],
      tags: ['user-types', 'basic-user'],
      references: {
        sku: 'AVAY-IPOB-0099'
      },
    }, {
      identifier: 'ip-office-business-user',
      title: {
        text: 'Business User',
      },
      descriptions: [{
        identifier: 'short-title',
        text: 'Business',
      }, {
        identifier: 'long-title',
        text: 'Avaya Cloud Solutions Business User',
      }, {
        identifier: 'default',
        text: "Optimized for a Standard Unified Communication worker and built for success. <span style='color:#000000;font-weight:600;'>Includes a FREE Avaya Spaces Standard User.</span>",
      },
      {
        identifier: 'title-plural',
        text: 'Business Users',
      }],
      regularPrice: 29.95,
      price: 29.95,
      minQuantity: 1,
      maxQuantity: 3000,
      defaultQuantity: 4,
      attributes: [...ipOfficeDevices],
      // attributes: [{
      //   identifier: 'direct-phone-number',
      //   title: {
      //     text: 'Direct Phone Number Included!'
      //   },
      //   descriptions: [{
      //     identifier: 'default',
      //     text: 'Gain a dedicated, unique number, so anyone can call you directly instead of working through the office main number and receptionist (virtual or human). Direct Phone Number included in Power User subscription pricing.'
      //   }],
      //   tags: ['addon', 'addon-by-usertypes', 'addon-direct-phone-number', 'included'],
      // }],
      rules: [{
        identifier: 'quantity-based-price',
        event: 'before-update-cart',
        parameters: [{
          parameter: 'tag',
          value: 'user-types'
        }, {
          parameter: 'prices',
          value: [{
            maxQuantity: 99,
            price: 29.95,
            references: { sku: 'AVAYA-IPOS-0099' },
          }, {
            minQuantity: 100,
            maxQuantity: 999,
            price: 27.95,
            references: { sku: 'AVAYA-IPOS-0999' },
          }, {
            minQuantity: 1000,
            price: 24.95,
            references: { sku: 'AVAYA-IPOS-1000' },
          }]
        }]
      }, {
        identifier: 'add-another-item',
        event: 'before-update-cart',
        parameters: [{
            parameter: 'identifier',
            value: `${salesModelIdentifier}..zang-spaces-plus-user`,
          },
          {
            parameter: 'quantityTag',
            value: 'standard-user'
          },
        ],
      }],
      tags: ['user-types', 'standard-user'],
      references: {
        sku: 'AVAY-IPOS-0099'
      },
    }, {
      identifier: 'ip-office-power-user',
      title: {
        text: 'Power User',
      },
      descriptions: [{
        identifier: 'short-title',
        text: 'Power',
      }, {
        identifier: 'long-title',
        text: 'Avaya Cloud Solutions Power User',
      }, {
        identifier: 'default',
        text: "Optimized for a Standard Unified Communication worker and built for success. <span style='color:#000000;font-weight:600;'>Includes a FREE Avaya Spaces Standard User.</span>",
      },
      {
        identifier: 'title-plural',
        text: 'Power Users',
      }],
      regularPrice: 39.95,
      price: 39.95,
      minQuantity: 1,
      maxQuantity: 3000,
      defaultQuantity: 4,
      attributes: [...ipOfficeDevices],
      // attributes: [{
      //   identifier: 'direct-phone-number',
      //   title: {
      //     text: 'Direct Phone Number Included!'
      //   },
      //   descriptions: [{
      //     identifier: 'default',
      //     text: 'Gain a dedicated, unique number, so anyone can call you directly instead of working through the office main number and receptionist (virtual or human). Direct Phone Number included in Power User subscription pricing.'
      //   }],
      //   tags: ['addon', 'addon-by-usertypes', 'addon-direct-phone-number', 'included'],
      // }],
      rules: [{
        identifier: 'quantity-based-price',
        event: 'before-update-cart',
        parameters: [{
          parameter: 'tag',
          value: 'user-types'
        }, {
          parameter: 'prices',
          value: [{
            maxQuantity: 99,
            price: 39.95,
            references: { sku: 'AVAYA-IPOP-0099' },
          }, {
            minQuantity: 100,
            maxQuantity: 999,
            price: 37.95,
            references: { sku: 'AVAYA-IPOP-0999' },
          }, {
            minQuantity: 1000,
            price: 34.95,
            references: { sku: 'AVAYA-IPOP-1000' },
          }]
        }]
      }, {
        identifier: 'add-another-item',
        event: 'before-update-cart',
        parameters: [{
            parameter: 'identifier',
            value: `${salesModelIdentifier}..zang-spaces-business-user`,
          },
          {
            parameter: 'quantityTag',
            value: 'power-user'
          },
        ],
      }],
      tags: ['user-types', 'power-user', 'bestdeal'],
      references: {
        sku: 'AVAY-IPOP-0099'
      },
    }];
  };
  const ucSolutionSystemAddons = [{
    identifier: 'toll-free-service-with-1000-min',
    title: {
      text: 'Toll Free Service w. 1000 minutes'
    },
    descriptions: [{
      identifier: 'default',
      text: 'A toll-free number makes it easier and more affordable for your customers to contact your business, as they are not charged for the calls that they place into your number. This add-on includes 1000 mins.'
    }],
    price: 10,
    tags: ['addon', 'system-addon'],
  }, {
    identifier: 'extra-toll-free-minutes',
    title: {
      text: 'Extra Toll Free Minutes'
    },
    descriptions: [{
      identifier: 'default',
      text: 'This add-on enables additional minutes'
    }],
    price: 0.04,
    tags: ['addon', 'system-addon'],
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
    tags: ['did', 'did-main', 'did-existing'],
    references: { sku: 'AVAY-IPOB-0999' },
  }, {
    identifier: 'did-tollfree',
    title: {
      text: 'Pre-select a Toll-Free Number',
      resource: 'PRE_SELECT_A_TOLL_FREE_NUMBER',
    },
    descriptions: [{
      identifier: 'short-title',
      text: 'Toll-Free Number',
      resource: 'TOLL_FREE',
    }, {
      identifier: 'default',
      text: 'Select to add a toll-free number to your plan',
      resource: 'SELECT_TO_ADD_YOUR_VERY_OWN_TOLL_FREE_NUMBER_TO_YOUR_PLAN',
    }, {
      identifier: 'cart-title',
      text: 'Toll-Free Number',
      resource: 'TOLL_FREE',
    }, {
      identifier: 'LNP_FORM_LINK',
      text: 'https://storage.googleapis.com/avayastore/downloads/Avaya-Blank-LOA-Form.pdf',
      resource: 'LNP_FORM_LINK'
    }, {
      identifier: 'RODAA_LINK',
      text: 'https://storage.googleapis.com/avayastore/downloads/Avaya-RODAA-Form.pdf',
      resource: 'RODAA_LINK'
    }],
    tags: ['did', 'did-main', 'did-tollfree'],
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
    tags: ['did', 'did-main', 'did-local'],
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

  const ucSolutionContractDiscounts = {
    'uc-solution-yearly': {
      identifier: 'device-discount-1-year',
      title: {
        text: 'Device Discount',
      },
      shortTitle: {
        text: 'Discount',
        resource: 'DISCOUNT',
      },
      price: -79.95,
      isOneTimeCharge: true,
      tags: ['discount'],
      references: { sku: 'AVAYA-PHONE-CREDIT' },
    },
    'uc-solution-3-years': {
      identifier: 'device-discount-3-years',
      title: {
        text: 'Device Discount',
      },
      shortTitle: {
        text: 'Discount',
        resource: 'DISCOUNT',
      },
      price: -239.95,
      isOneTimeCharge: true,
      tags: ['discount'],
      references: { sku: 'AVAYA-PHONE-CREDIT' },
    },
    'uc-solution-5-years': {
      identifier: 'device-discount-5-years',
      title: {
        text: 'Device Discount',
      },
      shortTitle: {
        text: 'Discount',
        resource: 'DISCOUNT',
      },
      price: -289.95,
      isOneTimeCharge: true,
      tags: ['discount'],
      references: { sku: 'AVAYA-PHONE-CREDIT' },
    }
  };

  const ucSolutionLegacyContractDiscounts = {
    'ip-office-legacy-yearly': {
      identifier: 'device-discount-1-year',
      title: {
        text: 'Device Discount',
      },
      shortTitle: {
        text: 'Discount',
        resource: 'DISCOUNT',
      },
      price: -79.95,
      isOneTimeCharge: true,
      tags: ['discount'],
      references: { sku: 'AVAYA-PHONE-CREDIT' },
    },
    'ip-office-legacy-3-years': {
      identifier: 'device-discount-3-years',
      title: {
        text: 'Device Discount',
      },
      shortTitle: {
        text: 'Discount',
        resource: 'DISCOUNT',
      },
      price: -249.95,
      isOneTimeCharge: true,
      tags: ['discount'],
      references: { sku: 'AVAYA-PHONE-CREDIT' },
    },
    'ip-office-legacy-5-years': {
      identifier: 'device-discount-5-years',
      title: {
        text: 'Device Discount',
      },
      shortTitle: {
        text: 'Discount',
        resource: 'DISCOUNT',
      },
      price: -319.95,
      isOneTimeCharge: true,
      tags: ['discount'],
      references: { sku: 'AVAYA-PHONE-CREDIT' },
    }
  };

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
        { parameter: 'extraReferences', value: { maxDiscountAmountTag: 'devices' } },
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

  const IPOfficeLegalDocument = {
    identifier: 'ipoffice-term-conditions',
    title: {
      text: 'General Terms Of Service - Avaya Cloud Solutions',
      resource: 'GENERAL_TERMS_OF_SERVICE_AVAYA_CLOUD_IP_OFFICE',
    },
    version: '1.0.1',
    url: 'https://storage.googleapis.com/avayastore/html/TERMS_OF_SERVICE_AVAYA_Cloud_ver_2.0_5_25_18_.html',
    pdf: 'https://storage.googleapis.com/avayastore/html/TERMS_OF_SERVICE_AVAYA_Cloud_ver_2.0_5_25_18_.pdf',
    display: 'modal',
    requireUserConsent: true,
  };

  const generalLegalDocument = {
    identifier: 'general-term-conditions',
    title: {
      text: 'General Privacy Statement',
      resource: 'GENERAL_PRIVACY_STATEMENT',
    },
    version: '1.0',
    url: 'https://www.avaya.com/en/privacy/website/',
    display: 'newwindow',
    requireUserConsent: true,
  };

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
    currency: 'USD',
    allowed_regions: ['US'],
    identifier: 'uc-solution-monthly',
    title: {
      text: 'Cloud UC Solution Monthly Plan',
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
      identifier: 'ip-office',
      _id: productsMap['ip-office'] && productsMap['ip-office']._id,
      engines: productsMap['ip-office'] && productsMap['ip-office'].engines,
    },
    subscription: {
      contractLength: 1,
      contractPeriod: 'month',
      billingInterval: 1,
      billingPeriod: 'month',
    },
    rules: [...ucOfferStandardRules],
    items: [
      ...ucSolutionUserTypes('uc-solution-monthly'),
      // ...ucSolutionSystemAddons,
      ...ucSolutionMainDid,
      ...ucSolutionSpacesBundle,
    ],
    tags: ['ucoffer', 'uc-solution'],
    legalDocuments: [generalLegalDocument, IPOfficeLegalDocument],
    created: {
      by: null,
      on: new Date()
    },
  }, {
      status: 'active',
      currency: 'USD',  
      allowed_regions: ['US'],
    identifier: 'uc-solution-yearly',
    title: {
      text: 'Cloud UC Solution 1 Year Plan',
    },
    descriptions: [{
      identifier: 'short-title',
      text: 'UC Solution',
    },
    ...uiStepFootNote],
    product: {
      identifier: 'ip-office',
      _id: productsMap['ip-office'] && productsMap['ip-office']._id,
      engines: productsMap['ip-office'] && productsMap['ip-office'].engines,
    },
    subscription: {
      contractLength: 1,
      contractPeriod: 'year',
      billingInterval: 1,
      billingPeriod: 'month',
    },
    rules: [
      ...ucOfferStandardRules,
      ...ucSolutionContractDiscountRule('uc-solution-yearly', 'device-discount-1-year'),
      ...ucSolutionContractPrepopulateRule('avayaj129'),
    ],
    items: [
      ...ucSolutionUserTypes('uc-solution-yearly'),
      // ...ucSolutionSystemAddons,
      ...ucSolutionMainDid,
      ...ucSolutionSpacesBundle,
      ucSolutionContractDiscounts['uc-solution-yearly'],
    ],
    tags: ['ucoffer', 'uc-solution'],
    legalDocuments: [generalLegalDocument, IPOfficeLegalDocument],
    created: {
      by: null,
      on: new Date()
    },
  }, {
      status: 'active',
      currency: 'USD',  
      allowed_regions: ['US'],
    identifier: 'uc-solution-3-years',
    title: {
      text: 'Cloud UC Solution 3 Year Plan',
    },
    descriptions: [{
      identifier: 'short-title',
      text: 'UC Solution',
    },
    ...uiStepFootNote],
    product: {
      identifier: 'ip-office',
      _id: productsMap['ip-office'] && productsMap['ip-office']._id,
      engines: productsMap['ip-office'] && productsMap['ip-office'].engines,
    },
    subscription: {
      contractLength: 3,
      contractPeriod: 'year',
      billingInterval: 1,
      billingPeriod: 'month',
    },
    rules: [
      ...ucOfferStandardRules,
      ...ucSolutionContractDiscountRule('uc-solution-3-years', 'device-discount-3-years'),
      ...ucSolutionContractPrepopulateRule('avayaj169'),
    ],
    items: [
      ...ucSolutionUserTypes('uc-solution-3-years'),
      // ...ucSolutionSystemAddons,
      ...ucSolutionMainDid,
      ...ucSolutionSpacesBundle,
      ucSolutionContractDiscounts['uc-solution-3-years'],
    ],
    tags: ['ucoffer', 'uc-solution'],
    legalDocuments: [generalLegalDocument, IPOfficeLegalDocument],
    created: {
      by: null,
      on: new Date()
    },
  }, {
      status: 'active',
      currency: 'USD',  
      allowed_regions: ['US'],
    identifier: 'uc-solution-5-years',
    title: {
      text: 'Cloud UC Solution 5 Year Plan',
    },
    descriptions: [{
      identifier: 'short-title',
      text: 'UC Solution',
    },
    ...uiStepFootNote],
    product: {
      identifier: 'ip-office',
      _id: productsMap['ip-office'] && productsMap['ip-office']._id,
      engines: productsMap['ip-office'] && productsMap['ip-office'].engines,
    },
    subscription: {
      contractLength: 5,
      contractPeriod: 'year',
      billingInterval: 1,
      billingPeriod: 'month',
    },
    rules: [
      ...ucOfferStandardRules,
      ...ucSolutionContractDiscountRule('uc-solution-5-years', 'device-discount-5-years'),
      ...ucSolutionContractPrepopulateRule('avayaj179'),
    ],
    items: [
      ...ucSolutionUserTypes('uc-solution-5-years'),
      // ...ucSolutionSystemAddons,
      ...ucSolutionMainDid,
      ...ucSolutionSpacesBundle,
      ucSolutionContractDiscounts['uc-solution-5-years'],
    ],
    tags: ['ucoffer', 'uc-solution'],
    legalDocuments: [generalLegalDocument, IPOfficeLegalDocument],
    created: {
      by: null,
      on: new Date()
    },
  }, {
    status: 'active',
    identifier: 'ip-office-legacy-monthly',
    title: {
      text: 'Avaya Cloud IP Office™ Monthly Plan',
    },
    descriptions: [{
      identifier: 'short-title',
      text: 'Avaya Cloud IP Office™',
    }, {
      identifier: 'default',
      text: 'Empower your company with the ultimate enterprise communications in the cloud',
    }],
    product: {
      identifier: 'ip-office',
      _id: productsMap['ip-office'] && productsMap['ip-office']._id,
      engines: productsMap['ip-office'] && productsMap['ip-office'].engines,
    },
    subscription: {
      contractLength: 1,
      contractPeriod: 'month',
      billingInterval: 1,
      billingPeriod: 'month',
    },
    rules: [...ucOfferStandardRules],
    items: [
      ...ipOfficeLegacyUserTypes('ip-office-legacy-monthly'),
      // ...ucSolutionSystemAddons,
      ...ucSolutionMainDid,
      ...ucSolutionSpacesBundle,
    ],
    tags: ['ip-office-legacy'],
    legalDocuments: [generalLegalDocument, IPOfficeLegalDocument],
    created: {
      by: null,
      on: new Date()
    },
  }, {
    status: 'active',
    identifier: 'ip-office-legacy-yearly',
    title: {
      text: 'Avaya Cloud IP Office™ 1 Year Plan',
    },
    descriptions: [{
      identifier: 'short-title',
      text: 'Avaya Cloud IP Office™',
    }],
    product: {
      identifier: 'ip-office',
      _id: productsMap['ip-office'] && productsMap['ip-office']._id,
      engines: productsMap['ip-office'] && productsMap['ip-office'].engines,
    },
    subscription: {
      contractLength: 1,
      contractPeriod: 'year',
      billingInterval: 1,
      billingPeriod: 'month',
    },
    rules: [
      ...ucOfferStandardRules,
      ...ucSolutionContractDiscountRule('ip-office-legacy-yearly', 'device-discount-1-year'),
      ...ucSolutionContractPrepopulateRule('avayaj129'),
    ],
    items: [
      ...ipOfficeLegacyUserTypes('ip-office-legacy-yearly'),
      // ...ucSolutionSystemAddons,
      ...ucSolutionMainDid,
      ...ucSolutionSpacesBundle,
      ucSolutionLegacyContractDiscounts['ip-office-legacy-yearly'],
    ],
    tags: ['ip-office-legacy'],
    legalDocuments: [generalLegalDocument, IPOfficeLegalDocument],
    created: {
      by: null,
      on: new Date()
    },
  }, {
    status: 'active',
    identifier: 'ip-office-legacy-3-years',
    title: {
      text: 'Avaya Cloud IP Office™ 3 Years Plan',
    },
    descriptions: [{
      identifier: 'short-title',
      text: 'Avaya Cloud IP Office™',
    }],
    product: {
      identifier: 'ip-office',
      _id: productsMap['ip-office'] && productsMap['ip-office']._id,
      engines: productsMap['ip-office'] && productsMap['ip-office'].engines,
    },
    subscription: {
      contractLength: 3,
      contractPeriod: 'year',
      billingInterval: 1,
      billingPeriod: 'month',
    },
    rules: [
      ...ucOfferStandardRules,
      ...ucSolutionContractDiscountRule('ip-office-legacy-3-years', 'device-discount-3-years'),
      ...ucSolutionContractPrepopulateRule('avaya9608g'),
    ],
    items: [
      ...ipOfficeLegacyUserTypes('ip-office-legacy-3-years'),
      // ...ucSolutionSystemAddons,
      ...ucSolutionMainDid,
      ...ucSolutionSpacesBundle,
      ucSolutionLegacyContractDiscounts['ip-office-legacy-3-years'],
    ],
    tags: ['ip-office-legacy'],
    legalDocuments: [generalLegalDocument, IPOfficeLegalDocument],
    created: {
      by: null,
      on: new Date()
    },
  }, {
    status: 'active',
    identifier: 'ip-office-legacy-5-years',
    title: {
      text: 'Avaya Cloud IP Office™ 5 Years Plan',
    },
    descriptions: [{
      identifier: 'short-title',
      text: 'Avaya Cloud IP Office™',
    }],
    product: {
      identifier: 'ip-office',
      _id: productsMap['ip-office'] && productsMap['ip-office']._id,
      engines: productsMap['ip-office'] && productsMap['ip-office'].engines,
    },
    subscription: {
      contractLength: 5,
      contractPeriod: 'year',
      billingInterval: 1,
      billingPeriod: 'month',
    },
    rules: [
      ...ucOfferStandardRules,
      ...ucSolutionContractDiscountRule('ip-office-legacy-5-years', 'device-discount-5-years'),
      ...ucSolutionContractPrepopulateRule('avaya9611g'),
    ],
    items: [
      ...ipOfficeLegacyUserTypes('ip-office-legacy-5-years'),
      // ...ucSolutionSystemAddons,
      ...ucSolutionMainDid,
      ...ucSolutionSpacesBundle,
      ucSolutionLegacyContractDiscounts['ip-office-legacy-5-years'],
    ],
    tags: ['ip-office-legacy'],
    legalDocuments: [generalLegalDocument, IPOfficeLegalDocument],
    created: {
      by: null,
      on: new Date()
    },
  }];

  for (let doc of docs) {
    logger.info(fn, `creating "${doc.identifier}" ...`);
    let result = await SalesModelBackend.findOneAndUpdate({
      identifier: doc.identifier,
    }, doc, { upsert: true, returnNewDocument: true });
    logger.info(fn, `    "${doc.identifier}" created`, result);
  }
};

module.exports = initSalesModels;
