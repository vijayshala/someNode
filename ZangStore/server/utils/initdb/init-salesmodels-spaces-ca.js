const logger = require('applogger');

const { ProductBackend } = require('../../product/product.backend');
const { SalesModelBackend } = require('../../salesmodel/salesmodel.backend');

const initSpacesSalesModels = async (options) => {
  const fn = `[initSpacesSalesModels]`;
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

  const collaborationsStandardRules = [{
    identifier: 'remove-other-items',
    event: 'before-update-cart',
    parameters: [{ parameter: 'tag', value: 'collaborations' }]
  }];

  const ucSolutionUserTypes = (salesModelIdentifier) => {
    return [
      // {
      // isPrimary: true,
      // identifier: 'spaces-essential-user-ca',
      // title: {
      //   text: 'Essential User',
      // },
      // descriptions: [{
      //   identifier: 'short-title',
      //   text: 'Essential',
      // }, {
      //   identifier: 'long-title',
      //   text: 'Avaya Spaces Essential User',
      // }, {
      //   identifier: 'default',
      //   text: "",
      // }, {
      //   identifier: 'title-plural',
      //   text: 'Essential Users',
      // }],
      // regularPrice: 0,
      // price: 0,
      // minQuantity: 1,
      // maxQuantity: 10000,
      // defaultQuantity: 0,
      // // attributes: [{
      // //   identifier: 'direct-phone-number',
      // //   title: {
      // //     text: 'Direct Phone Number'
      // //   },
      // //   descriptions: [{
      // //     identifier: 'default',
      // //     text: 'Gain a dedicated, unique number, so anyone can call you directly instead of working through the office main number and receptionist (virtual or human). Direct Phone Number included in Power User subscription pricing.'
      // //   }],
      // //   price: 5,
      // //   tags: ['addon', 'addon-by-usertypes', 'addon-direct-phone-number'],
      // //   references: { sku: 'ZANG-OFLO-USER' }, // FIXME: product code
      // // }],
      
      // //rules for volume discount
      // // rules: [{
      // //   identifier: 'quantity-based-price',
      // //   event: 'before-update-cart',
      // //   parameters: [{
      // //     parameter: 'tag',
      // //     value: 'user-types'
      // //   }, {
      // //     parameter: 'prices',
      // //     value: [{
      // //       maxQuantity: 1,
      // //       price: 0,
      // //       references: { sku: 'AVAYA-SPACES' },
      // //     }, {
      // //       minQuantity: 100,
      // //       maxQuantity: 999,
      // //       price: 22.95,
      // //       references: { sku: 'AVAYA-IPOB-0999' },
      // //     }, {
      // //       minQuantity: 1000,
      // //       price: 19.95,
      // //       references: { sku: 'AVAYA-IPOB-1000' },
      // //       }
      // //     ]
      // //   }]
      // // }],
      // tags: ['user-types', 'basic-user'],
      // references: {
      //   sku: 'SPACES-ESSENTIAL-USER-DE',
      //   licenseType: 'zangspaces_free'
      // },
      // },
      {
        isPrimary: true,
        identifier: 'spaces-business-user-ca',
        title: {
          text: 'Business User',
        },
        descriptions: [{
          identifier: 'short-title',
          text: 'Business',
        }, {
          identifier: 'long-title',
          text: 'Avaya Spaces Business User',
        }, {
          identifier: 'default',
          text: "",
        },
        {
          identifier: 'title-plural',
          text: 'Business Users',
        }],
        regularPrice: 5.00,
        price: 5.00,
        minQuantity: 1,
        maxQuantity: 100000,
        defaultQuantity: 4,
        // attributes: [...ipOfficeDevices],
        attributes: [{
          identifier: 'dialin-conference',
          title: {
            text: 'Conference Dial-in Package'
          },
          descriptions: [{
            identifier: 'default',
            text: ''
          }],
          price: 5.00,
          tags: ['addon', 'addon-by-usertypes', 'addon-dialin'],
          rules: [{
            identifier: 'quantity-max-follow-parent-item',
            event: 'before-update-cart',
            parameters:[]
          }],
          references: {
            sku: 'SPACES-DIALIN-ADDON-CA',
            licenseType: 'zangspaces_dial'
          }
          
        }],
        // Volume Discount
        // rules: [{
        //   identifier: 'quantity-based-price',
        //   event: 'before-update-cart',
        //   parameters: [{
        //     parameter: 'tag',
        //     value: 'user-types'
        //   }, {
        //     parameter: 'prices',
        //     value: [{
        //       maxQuantity: 99,
        //       price: 29.95,
        //       references: { sku: 'AVAYA-IPOS-0099' },
        //     }, {
        //       minQuantity: 100,
        //       maxQuantity: 999,
        //       price: 27.95,
        //       references: { sku: 'AVAYA-IPOS-0999' },
        //     }, {
        //       minQuantity: 1000,
        //       price: 24.95,
        //       references: { sku: 'AVAYA-IPOS-1000' },
        //     }]
        //   }]
        // }],
      
        tags: ['user-types', 'standard-user'],
        references: {
          sku: 'SPACES-BUSINESS-USER-CA',
          licenseType: 'zangspaces_team'
        }
      }, {
        identifier: 'spaces-power-user-ca',
        title: {
          text: 'Power User',
        },
        descriptions: [{
          identifier: 'short-title',
          text: 'Power',
        }, {
          identifier: 'long-title',
          text: 'Avaya Spaces Power User',
        }, {
          identifier: 'default',
          text: "",
        },
        {
          identifier: 'title-plural',
          text: 'Power Users',
        }],
        regularPrice: 25.00,
        price: 25.00,
        minQuantity: 1,
        maxQuantity: 100000,
        defaultQuantity: 1,
        attributes: [{
          identifier: 'conference-dialin',
          title: {
            text: 'Conference Dial-in Package'
          },
          descriptions: [{
            identifier: 'default',
            text: ''
          }],
          tags: ['addon', 'addon-by-usertypes', 'addon-dialin', 'included'],
        }],
        // rules: [{
        //   identifier: 'quantity-based-price',
        //   event: 'before-update-cart',
        //   parameters: [{
        //     parameter: 'tag',
        //     value: 'user-types'
        //   }, {
        //     parameter: 'prices',
        //     value: [{
        //       maxQuantity: 99,
        //       price: 39.95,
        //       references: { sku: 'AVAYA-IPOP-0099' },
        //     }, {
        //       minQuantity: 100,
        //       maxQuantity: 999,
        //       price: 37.95,
        //       references: { sku: 'AVAYA-IPOP-0999' },
        //     }, {
        //       minQuantity: 1000,
        //       price: 34.95,
        //       references: { sku: 'AVAYA-IPOP-1000' },
        //     }]
        //   }]
        // }, {
        //   identifier: 'add-another-item',
        //   event: 'before-update-cart',
        //   parameters: [{
        //       parameter: 'identifier',
        //       value: `${salesModelIdentifier}..zang-spaces-business-user`,
        //     },
        //     {
        //       parameter: 'quantityTag',
        //       value: 'power-user'
        //     },
        //   ],
        // }],
        tags: ['user-types', 'power-user', 'bestdeal'],
        references: {
          sku: 'SPACES-POWER-USER-CA',
          licenseType: 'zangspaces_business'
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
    currency: 'CAD',
    allowed_regions: ['CA'],
    identifier: 'spaces-solution-monthly-ca',
    title: {
      text: 'Avaya Spaces Monthly Plan',
    },
    descriptions: [{
      identifier: 'short-title',
      text: 'Avaya Spaces',
    }, {
      identifier: 'default',
      text: 'Empower your company with the ultimate enterprise collaboration in the cloud',
    },
      // ...uiStepFootNote
    ],
    product: {
      identifier: 'zang-spaces',
      _id: productsMap['zang-spaces'] && productsMap['zang-spaces']._id,
      engines: productsMap['zang-spaces'] && productsMap['zang-spaces'].engines,
    },
    subscription: {
      contractLength: 1,
      contractPeriod: 'month',
      billingInterval: 1,
      billingPeriod: 'month',
    },
    rules: [...collaborationsStandardRules],
    items: [
      ...ucSolutionUserTypes('spaces-solution-monthly'),
      // ...ucSolutionSystemAddons,   
    ],
    tags: ['collaborations', 'spaces-solution'],
    legalDocuments: [generalLegalDocument],
    created: {
      by: null,
      on: new Date()
    },
  }, {
    status: 'active',
    currency: 'CAD',
    allowed_regions: ['CA'],
    identifier: 'spaces-solution-yearly-ca',
    title: {
      text: 'Avaya Spaces 1 Year Plan',
    },
    descriptions: [{
      identifier: 'short-title',
      text: 'Avaya Spaces',
    },
    ...uiStepFootNote],
    product: {
      identifier: 'zang-spaces',
      _id: productsMap['zang-spaces'] && productsMap['zang-spaces']._id,
      engines: productsMap['zang-spaces'] && productsMap['zang-spaces'].engines,
    },
    subscription: {
      contractLength: 1,
      contractPeriod: 'year',
      billingInterval: 1,
      billingPeriod: 'year',
    },
    rules: [...collaborationsStandardRules],
    items: [
      ...ucSolutionUserTypes('spaces-solution-yearly-ca'),
      // ...ucSolutionSystemAddons,      
    ],
    tags: ['collaborations', 'spaces-solution'],
    legalDocuments: [generalLegalDocument],
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

module.exports = initSpacesSalesModels;
