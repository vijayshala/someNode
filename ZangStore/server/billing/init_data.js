import config from '../../config';
import constants from '../../config/constants';

export const StripeProducts = [
    {
       name: 'AVAY-IPOP',
       type: 'service', //or type=good
       metadata: {
           sku: 'AVAY-IPOP',
           AvayaStoreProductId: '',
           description: 'Avaya Cloud Solutions Power User',
           AvayaStoreEnvironment: config.environment
       }
    },
    {
        name: 'AVAY-IPOS',
        type: 'service', //or type=good
        metadata: {
            sku: 'AVAY-IPOS',
            AvayaStoreProductId: '',
            description: 'Avaya Cloud Solutions Standard User',
            AvayaStoreEnvironment: config.environment
        }
     },
     {
        name: 'AVAY-IPOB',
        type: 'service', //or type=good
        metadata: {
            sku: 'AVAY-IPOB',
            AvayaStoreProductId: '',
            description: 'Avaya Cloud Solutions Basic User',
            AvayaStoreEnvironment: config.environment
        }
     },
     {
        name: 'AVAY-IPTF',
        type: 'service', //or type=good
        metadata: {
            sku: 'AVAY-IPTF',
            AvayaStoreProductId: '',
            description: 'Avaya Cloud Solutions Toll Free DID',
            AvayaStoreEnvironment: config.environment
        }
     },
     {
        name: 'AVAY-IPLO',
        type: 'service', //or type=good
        metadata: {
            sku: 'AVAY-IPLO',
            AvayaStoreProductId: '',
            description: 'Avaya Cloud Solutions Local DID',
            AvayaStoreEnvironment: config.environment
        }
     },
     {
        name: 'ZANG-SPBA-USER',
        type: 'service', //or type=good
        metadata: {
            sku: 'ZANG-SPBA-USER',
            AvayaStoreProductId: '',
            description: 'Avaya Spaces Basic User',
            AvayaStoreEnvironment: config.environment
        }
     },
     {
        name: 'ZANG-SPPL-USER',
        type: 'service', //or type=good
        metadata: {
            sku: 'ZANG-SPPL-USER',
            AvayaStoreProductId: '',
            description: 'Avaya Spaces Team User',
            AvayaStoreEnvironment: config.environment
        }
     },
     {
        name: 'ZANG-SPBU-USER',
        type: 'service', //or type=good
        metadata: {
            sku: 'ZANG-SPBU-USER',
            AvayaStoreProductId: '',
            description: 'Avaya Spaces Business User',
            AvayaStoreEnvironment: config.environment
        }
     },
     {
        name: 'TAX',
        type: 'service', //or type=good
        metadata: {
            sku: 'TAX',
            AvayaStoreProductId: '',
            description: 'TAX placeholer',
            AvayaStoreEnvironment: config.environment
        }
     }
];

export const StripePlans = [
    {
        currency: 'usd',
        interval: 'month',
        product: '',
        price: 4995,
        interval_count: 1,
        metadata: {
            LegacyPlanOptionKey: '',
            QuantityStep: '1',
            sku: 'AVAY-IPOP-0005',
            AvayaStoreEnvironment: config.environment
        },
        product_sku: 'AVAY-IPOP'
    },
    {
        currency: 'usd',
        interval: 'month',
        product: '',
        price: 3995,
        interval_count: 1,
        metadata: {
            LegacyPlanOptionKey: '',
            QuantityStep: '6',
            sku: 'AVAY-IPOP-0099',
            AvayaStoreEnvironment: config.environment
        },
        product_sku: 'AVAY-IPOP'
    },
    {
      currency: 'usd',
      interval: 'month',
      product: '',
      price: 3995,
      interval_count: 1,
      metadata: {
          LegacyPlanOptionKey: '',
          QuantityStep: '1',
          sku: 'AVAYA-IPOP-0099',
          AvayaStoreEnvironment: config.environment
      },
      product_sku: 'AVAY-IPOP'
    },
    {
        currency: 'usd',
        interval: 'month',
        product: '',
        price: 3795,
        interval_count: 1,
        metadata: {
            LegacyPlanOptionKey: '',
            QuantityStep: '100',
            sku: 'AVAY-IPOP-0999',
            AvayaStoreEnvironment: config.environment
        },
        product_sku: 'AVAY-IPOP'
    },
    {
      currency: 'usd',
      interval: 'month',
      product: '',
      price: 3795,
      interval_count: 1,
      metadata: {
          LegacyPlanOptionKey: '',
          QuantityStep: '100',
          sku: 'AVAYA-IPOP-0999',
          AvayaStoreEnvironment: config.environment
      },
      product_sku: 'AVAY-IPOP'
    },
    {
        currency: 'usd',
        interval: 'month',
        product: '',
        price: 3495,
        interval_count: 1,
        metadata: {
            LegacyPlanOptionKey: '',
            QuantityStep: '1000',
            sku: 'AVAY-IPOP-1000',
            AvayaStoreEnvironment: config.environment
        },
        product_sku: 'AVAY-IPOP'
    },
    {
      currency: 'usd',
      interval: 'month',
      product: '',
      price: 3495,
      interval_count: 1,
      metadata: {
          LegacyPlanOptionKey: '',
          QuantityStep: '1000',
          sku: 'AVAYA-IPOP-1000',
          AvayaStoreEnvironment: config.environment
      },
      product_sku: 'AVAY-IPOP'
    },
    {
        currency: 'usd',
        interval: 'month',
        product: '',
        price: 3995,
        interval_count: 1,
        metadata: {
            LegacyPlanOptionKey: '',
            QuantityStep: '1',
            sku: 'AVAY-IPOS-0005',
            AvayaStoreEnvironment: config.environment
        },
        product_sku: 'AVAY-IPOS'
    },
    {
        currency: 'usd',
        interval: 'month',
        product: '',
        price: 2995,
        interval_count: 1,
        metadata: {
            LegacyPlanOptionKey: '',
            QuantityStep: '6',
            sku: 'AVAY-IPOS-0099',
            AvayaStoreEnvironment: config.environment
        },
        product_sku: 'AVAY-IPOS'
    },
    {
      currency: 'usd',
      interval: 'month',
      product: '',
      price: 2995,
      interval_count: 1,
      metadata: {
          LegacyPlanOptionKey: '',
          QuantityStep: '1',
          sku: 'AVAYA-IPOS-0099',
          AvayaStoreEnvironment: config.environment
      },
      product_sku: 'AVAY-IPOS'
    },
    {
        currency: 'usd',
        interval: 'month',
        product: '',
        price: 2795,
        interval_count: 1,
        metadata: {
            LegacyPlanOptionKey: '',
            QuantityStep: '100',
            sku: 'AVAY-IPOS-0999',
            AvayaStoreEnvironment: config.environment
        },
        product_sku: 'AVAY-IPOS'
    },
    {
      currency: 'usd',
      interval: 'month',
      product: '',
      price: 2795,
      interval_count: 1,
      metadata: {
          LegacyPlanOptionKey: '',
          QuantityStep: '100',
          sku: 'AVAYA-IPOS-0999',
          AvayaStoreEnvironment: config.environment
      },
      product_sku: 'AVAY-IPOS'
    },
    {
        currency: 'usd',
        interval: 'month',
        product: '',
        price: 2495,
        interval_count: 1,
        metadata: {
            LegacyPlanOptionKey: '',
            QuantityStep: '1000',
            sku: 'AVAY-IPOS-1000',
            AvayaStoreEnvironment: config.environment
        },
        product_sku: 'AVAY-IPOS'
    },
    {
      currency: 'usd',
      interval: 'month',
      product: '',
      price: 2495,
      interval_count: 1,
      metadata: {
          LegacyPlanOptionKey: '',
          QuantityStep: '1000',
          sku: 'AVAYA-IPOS-1000',
          AvayaStoreEnvironment: config.environment
      },
      product_sku: 'AVAY-IPOS'
    },
    {
        currency: 'usd',
        interval: 'month',
        product: '',
        price: 3495,
        interval_count: 1,
        metadata: {
            LegacyPlanOptionKey: '',
            QuantityStep: '1',
            sku: 'AVAY-IPOB-0005',
            AvayaStoreEnvironment: config.environment
        },
        product_sku: 'AVAY-IPOB'
    },
    {
        currency: 'usd',
        interval: 'month',
        product: '',
        price: 2495,
        interval_count: 1,
        metadata: {
            LegacyPlanOptionKey: '',
            QuantityStep: '6',
            sku: 'AVAY-IPOB-0099',
            AvayaStoreEnvironment: config.environment
        },
        product_sku: 'AVAY-IPOB'
    },
    {
      currency: 'usd',
      interval: 'month',
      product: '',
      price: 2495,
      interval_count: 1,
      metadata: {
          LegacyPlanOptionKey: '',
          QuantityStep: '6',
          sku: 'AVAYA-IPOB-0099',
          AvayaStoreEnvironment: config.environment
      },
      product_sku: 'AVAY-IPOB'
    },
    {
        currency: 'usd',
        interval: 'month',
        product: '',
        price: 2295,
        interval_count: 1,
        metadata: {
            LegacyPlanOptionKey: '',
            QuantityStep: '100',
            sku: 'AVAY-IPOB-0999',
            AvayaStoreEnvironment: config.environment
        },
        product_sku: 'AVAY-IPOB'
    },
    {
      currency: 'usd',
      interval: 'month',
      product: '',
      price: 2295,
      interval_count: 1,
      metadata: {
          LegacyPlanOptionKey: '',
          QuantityStep: '100',
          sku: 'AVAYA-IPOB-0999',
          AvayaStoreEnvironment: config.environment
      },
      product_sku: 'AVAY-IPOB'
    },
    {
        currency: 'usd',
        interval: 'month',
        product: '',
        price: 1995,
        interval_count: 1,
        metadata: {
            LegacyPlanOptionKey: '',
            QuantityStep: '6',
            sku: 'AVAY-IPOB-1000',
            AvayaStoreEnvironment: config.environment
        },
        product_sku: 'AVAY-IPOB'
    },
    {
      currency: 'usd',
      interval: 'month',
      product: '',
      price: 1995,
      interval_count: 1,
      metadata: {
          LegacyPlanOptionKey: '',
          QuantityStep: '6',
          sku: 'AVAYA-IPOB-1000',
          AvayaStoreEnvironment: config.environment
      },
      product_sku: 'AVAY-IPOB'
    },
    {
        currency: 'usd',
        interval: 'month',
        product: '',
        price: 0,
        interval_count: 1,
        metadata: {
            sku: 'ZANG-SPBA-USER',
            AvayaStoreEnvironment: config.environment
        },
        product_sku: 'ZANG-SPBA-USER'
    },
    {
      currency: 'usd',
      interval: 'month',
      product: '',
      price: 0,
      interval_count: 1,
      metadata: {
          sku: 'ZANG-SPBA-USER-BDL',
          AvayaStoreEnvironment: config.environment
      },
      product_sku: 'ZANG-SPBA-USER-BDL'
    },
    {
        currency: 'usd',
        interval: 'month',
        product: '',
        price: 500,
        interval_count: 1,
        metadata: {
            sku: 'ZANG-SPPL-USER',
            AvayaStoreEnvironment: config.environment
        },
        product_sku: 'ZANG-SPPL-USER'
    },
    {
      currency: 'usd',
      interval: 'month',
      product: '',
      price: 0,
      interval_count: 1,
      metadata: {
          sku: 'ZANG-SPPL-USER-BDL',
          AvayaStoreEnvironment: config.environment
      },
      product_sku: 'ZANG-SPPL-USER-BDL'
    },
    {
        currency: 'usd',
        interval: 'month',
        product: '',
        price: 2500,
        interval_count: 1,
        metadata: {
            sku: 'ZANG-SPBU-USER',
            AvayaStoreEnvironment: config.environment
        },
        product_sku: 'ZANG-SPBU-USER'
    },
    {
      currency: 'usd',
      interval: 'month',
      product: '',
      price: 0,
      interval_count: 1,
      metadata: {
          sku: 'ZANG-SPBU-USER-BDL',
          AvayaStoreEnvironment: config.environment
      },
      product_sku: 'ZANG-SPBU-USER-BDL'
    }
];

export const AvalaraTaxCodes = [
    {
        sku: 'AVAY-IPOP-0005',
        taxCodes: {
            transactionType: 59,
            serviceType: 6
        }
    },
    {
        sku: 'AVAY-IPOP-0099',
        taxCodes: {
            transactionType: 59,
            serviceType: 6
        }
    },
    {
        sku: 'AVAY-IPOP-0999',
        taxCodes: {
            transactionType: 59,
            serviceType: 6
        }
    },
    {
        sku: 'AVAY-IPOP-1000',
        taxCodes: {
            transactionType: 59,
            serviceType: 6
        }
    },
    {
        sku: 'AVAY-IPOS-0005',
        taxCodes: {
            transactionType: 59,
            serviceType: 6
        }
    },
    {
        sku: 'AVAY-IPOS-0099',
        taxCodes: {
            transactionType: 59,
            serviceType: 6
        }
    },
    {
        sku: 'AVAY-IPOS-0999',
        taxCodes: {
            transactionType: 59,
            serviceType: 6
        }
    },
    {
        sku: 'AVAY-IPOS-1000',
        taxCodes: {
            transactionType: 59,
            serviceType: 6
        }
    },
    {
        sku: 'AVAY-IPOB-0005',
        taxCodes: {
            transactionType: 59,
            serviceType: 6
        }
    },
    {
        sku: 'AVAY-IPOB-0099',
        taxCodes: {
            transactionType: 59,
            serviceType: 6
        }
    },
    {
        sku: 'AVAY-IPOB-0999',
        taxCodes: {
            transactionType: 59,
            serviceType: 6
        }
    },
    {
        sku: 'AVAY-IPOB-1000',
        taxCodes: {
            transactionType: 59,
            serviceType: 6
        }
    },
    {
        sku: 'ZANG-OFTF-USER',
        taxCodes: {
            transactionType: 59,
            serviceType: 635
        }
    },
    {
        sku: 'ZANG-OFLO-USER',
        taxCodes: {
            transactionType: 59,
            serviceType: 30
        }
    },
    {
        sku: 'AVAYA-IPO-APPLICATION',
        taxCodes: {
            transactionType: 10,
            serviceType: 15
        }
    },
    {
        sku: 'AVAYA-PHONE-J129',
        taxCodes: {
            transactionType: 10,
            serviceType: 15
        }
    },
    {
      sku: 'AVAYA-PHONE-J169',
      taxCodes: {
          transactionType: 10,
          serviceType: 15
      }
    },
    {
      sku: 'AVAYA-PHONE-J179',
      taxCodes: {
          transactionType: 10,
          serviceType: 15
      }
    },
    {
      sku: 'AVAYA-PHONE-K175',
      taxCodes: {
          transactionType: 10,
          serviceType: 15
      }
    },
    {
        sku: 'AVAYA-PHONE-9608G',
        taxCodes: {
            transactionType: 10,
            serviceType: 15
        }
    },
    {
        sku: 'AVAYA-PHONE-9611G',
        taxCodes: {
            transactionType: 10,
            serviceType: 15
        }
    },
    {
        sku: 'AVAYA-PHONE-9641G',
        taxCodes: {
            transactionType: 10,
            serviceType: 15
        }
    },
    {
        sku: 'AVAYA-PHONE-B179',
        taxCodes: {
            transactionType: 10,
            serviceType: 15
        }
    },
    {
        sku: 'AVAYA-PHONE-CREDIT',
        taxCodes: {
            transactionType: 10,
            serviceType: 15
        }
    },//**** */
    {
        sku: 'ZANG-SPBA-USER',
        taxCodes: {
            transactionType: 3,
            serviceType: 34
        }
    },
    {
        sku: 'ZANG-SPPL-USER',
        taxCodes: {
            transactionType: 3,
            serviceType: 34
        }
    },
    {
        sku: 'ZANG-SPBU-USER',
        taxCodes: {
            transactionType: 3,
            serviceType: 34
        }
    },
    {
        sku: 'ZANG-SPBA-USER-BDL',
        taxCodes: {
            transactionType: 3,
            serviceType: 34
        }
    },
    {
        sku: 'ZANG-SPPL-USER-BDL',
        taxCodes: {
            transactionType: 3,
            serviceType: 34
        }
    },
    {
        sku: 'ZANG-SPBU-USER-BDL',
        taxCodes: {
            transactionType: 3,
            serviceType: 34
        }
    },

    {
      sku: 'AVAYA-IPOP-0005',
      taxCodes: {
          transactionType: 59,
          serviceType: 6
      }
  },
  {
      sku: 'AVAYA-IPOP-0099',
      taxCodes: {
          transactionType: 59,
          serviceType: 6
      }
  },
  {
      sku: 'AVAYA-IPOP-0999',
      taxCodes: {
          transactionType: 59,
          serviceType: 6
      }
  },
  {
      sku: 'AVAYA-IPOP-1000',
      taxCodes: {
          transactionType: 59,
          serviceType: 6
      }
  },
  {
      sku: 'AVAYA-IPOS-0005',
      taxCodes: {
          transactionType: 59,
          serviceType: 6
      }
  },
  {
      sku: 'AVAYA-IPOS-0099',
      taxCodes: {
          transactionType: 59,
          serviceType: 6
      }
  },
  {
      sku: 'AVAYA-IPOS-0999',
      taxCodes: {
          transactionType: 59,
          serviceType: 6
      }
  },
  {
      sku: 'AVAYA-IPOS-1000',
      taxCodes: {
          transactionType: 59,
          serviceType: 6
      }
  },
  {
      sku: 'AVAYA-IPOB-0005',
      taxCodes: {
          transactionType: 59,
          serviceType: 6
      }
  },
  {
      sku: 'AVAYA-IPOB-0099',
      taxCodes: {
          transactionType: 59,
          serviceType: 6
      }
  },
  {
      sku: 'AVAYA-IPOB-0999',
      taxCodes: {
          transactionType: 59,
          serviceType: 6
      }
  },
  {
      sku: 'AVAYA-IPOB-1000',
      taxCodes: {
          transactionType: 59,
          serviceType: 6
      }
  }
];

export const INDUSTRY_TYPES = [{
    type: constants.LOOKUP_TYPES.INDUSTRY_TYPES,
    keyValue: 'Healthcare',
    description: 'Healthcare'
  },{
    type: constants.LOOKUP_TYPES.INDUSTRY_TYPES,
    keyValue: 'Government',
    description: 'Government'
  },{
    type: constants.LOOKUP_TYPES.INDUSTRY_TYPES,
    keyValue: 'Education',
    description: 'Education'
  },{
    type: constants.LOOKUP_TYPES.INDUSTRY_TYPES,
    keyValue: 'Insurance',
    description: 'Insurance'
  },{
    type: constants.LOOKUP_TYPES.INDUSTRY_TYPES,
    keyValue: 'Transportation',
    description: 'Transportation'
  },{
    type: constants.LOOKUP_TYPES.INDUSTRY_TYPES,
    keyValue: 'Design',
    description: 'Design'
  },{
    type: constants.LOOKUP_TYPES.INDUSTRY_TYPES,
    keyValue: 'Technology',
    description: 'Technology'
  },{
    type: constants.LOOKUP_TYPES.INDUSTRY_TYPES,
    keyValue: 'Other',
    description: 'Other'
  }]
  

export const COUNTRIES = [{
    type: constants.LOOKUP_TYPES.COUNTRIES,
    keyValue: 'United States',
    description: 'United States',
    metadata: {
        ISO3: 'USA',
        ISO2: 'US'
    }
    },{
    type: constants.LOOKUP_TYPES.COUNTRIES,
    keyValue: 'Canada',
    description: 'Canada',
    metadata: {
        ISO3: 'CAN',
        ISO2: 'CA'
    }
}];
  

export const STATES = [{
      "type" : "STATES",
      "keyValue" : "Alabama",
      "description" : "Alabama",
      "metadata" : {
        "abbreviation": "AL",
        "country" : "United States",
        "areaCodes" : ["205", "251", "256", "334", "938"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Alaska",
      "description" : "Alaska",
      "metadata" : {
        "abbreviation": "AK",
        "country" : "United States",
        "areaCodes" : ["907"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "American Samoa",
      "description" : "American Samoa",
      "metadata" : {
        "abbreviation": "AS",
        "country" : "United States",
        "areaCodes" : ["684"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Arizona",
      "description" : "Arizona",
      "metadata" : {
        "abbreviation": "AZ",
        "country" : "United States",
        "areaCodes" : ["480", "520", "602", "623", "928"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Arkansas",
      "description" : "Arkansas",
      "metadata" : {
        "abbreviation": "AR",
        "country" : "United States",
        "areaCodes" : ["479", "501", "870"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "California",
      "description" : "California",
      "metadata" : {
        "abbreviation": "CA",
        "country" : "United States",
        "areaCodes" : ["209", "213", "310", "323", "408", "415", "424", "442", "510", "530", "559", "562", "619", "626", "650", "657", "661", "669", "707", "714", "747", "760", "805", "818", "831", "858", "909", "916", "925", "949", "951"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Colorado",
      "description" : "Colorado",
      "metadata" : {
        "abbreviation": "CO",
        "country" : "United States",
        "areaCodes" : ["303", "719", "720", "970"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Connecticut",
      "description" : "Connecticut",
      "metadata" : {
        "abbreviation": "CT",
        "country" : "United States",
        "areaCodes" : ["203", "475", "860"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Delaware",
      "description" : "Delaware",
      "metadata" : {
        "abbreviation": "DE",
        "country" : "United States",
        "areaCodes" : ["302"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Florida",
      "description" : "Florida",
      "metadata" : {
        "abbreviation": "FL",
        "country" : "United States",
        "areaCodes" : ["239", "305", "321", "352", "386", "407", "561", "727", "754", "772", "786", "813", "850", "863", "904", "941", "954"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Georgia",
      "description" : "Georgia",
      "metadata" : {
        "abbreviation": "GA",
        "country" : "United States",
        "areaCodes" : ["229", "404", "470", "478", "678", "706", "762", "770", "912"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Guam",
      "description" : "Guam",
      "metadata" : {
        "abbreviation": "GU",
        "country" : "United States",
        "areaCodes" : ["671"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Hawaii",
      "description" : "Hawaii",
      "metadata" : {
        "abbreviation": "HI",
        "country" : "United States",
        "areaCodes" : ["808"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Idaho",
      "description" : "Idaho",
      "metadata" : {
        "abbreviation": "ID",
        "country" : "United States",
        "areaCodes" : ["208"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Illinois",
      "description" : "Illinois",
      "metadata" : {
        "abbreviation": "IL",
        "country" : "United States",
        "areaCodes" : ["217", "224", "309", "312", "331", "618", "630", "708", "773", "779", "815", "847", "872"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Indiana",
      "description" : "Indiana",
      "metadata" : {
        "abbreviation": "IN",
        "country" : "United States",
        "areaCodes" : ["219", "260", "317", "574", "765", "812"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Iowa",
      "description" : "Iowa",
      "metadata" : {
        "abbreviation": "IA",
        "country" : "United States",
        "areaCodes" : ["319", "515", "563", "641", "712"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Kansas",
      "description" : "Kansas",
      "metadata" : {
        "abbreviation": "KS",
        "country" : "United States",
        "areaCodes" : ["316", "620", "785", "913"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Kentucky",
      "description" : "Kentucky",
      "metadata" : {
        "abbreviation": "KY",
        "country" : "United States",
        "areaCodes" : ["270", "502", "606", "859"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Louisiana",
      "description" : "Louisiana",
      "metadata" : {
        "abbreviation": "LA",
        "country" : "United States",
        "areaCodes" : ["225", "318", "337", "504", "985"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Maine",
      "description" : "Maine",
      "metadata" : {
        "abbreviation": "ME",
        "country" : "United States",
        "areaCodes" : ["207"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Maryland",
      "description" : "Maryland",
      "metadata" : {
        "abbreviation": "MD",
        "country" : "United States",
        "areaCodes" : ["240", "301", "410", "443", "667"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Massachusetts",
      "description" : "Massachusetts",
      "metadata" : {
        "abbreviation": "MA",
        "country" : "United States",
        "areaCodes" : ["339", "351", "413", "508", "617", "774", "781", "857", "978"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Michigan",
      "description" : "Michigan",
      "metadata" : {
        "abbreviation": "MI",
        "country" : "United States",
        "areaCodes" : ["231", "248", "269", "313", "517", "586", "616", "734", "810", "906", "947", "989"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Minnesota",
      "description" : "Minnesota",
      "metadata" : {
        "abbreviation": "MN",
        "country" : "United States",
        "areaCodes" : ["218", "320", "507", "612", "651", "763", "952"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Mississippi",
      "description" : "Mississippi",
      "metadata" : {
        "abbreviation": "MS",
        "country" : "United States",
        "areaCodes" : ["228", "601", "662", "769"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Missouri",
      "description" : "Missouri",
      "metadata" : {
        "abbreviation": "MO",
        "country" : "United States",
        "areaCodes" : ["314", "417", "573", "636", "660", "816"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Montana",
      "description" : "Montana",
      "metadata" : {
        "abbreviation": "MT",
        "country" : "United States",
        "areaCodes" : ["406"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Nebraska",
      "description" : "Nebraska",
      "metadata" : {
        "abbreviation": "NE",
        "country" : "United States",
        "areaCodes" : ["308", "402", "531"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Nevada",
      "description" : "Nevada",
      "metadata" : {
        "abbreviation": "NV",
        "country" : "United States",
        "areaCodes" : ["702", "725", "775"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "New Hampshire",
      "description" : "New Hampshire",
      "metadata" : {
        "abbreviation": "NH",
        "country" : "United States",
        "areaCodes" : ["603"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "New Jersey",
      "description" : "New Jersey",
      "metadata" : {
        "abbreviation": "NJ",
        "country" : "United States",
        "areaCodes" : ["201", "551", "609", "732", "848", "856", "862", "908", "973"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "New Mexico",
      "description" : "New Mexico",
      "metadata" : {
        "abbreviation": "NM",
        "country" : "United States",
        "areaCodes" : ["505", "575"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "New York",
      "description" : "New York",
      "metadata" : {
        "abbreviation": "NY",
        "country" : "United States",
        "areaCodes" : ["212", "315", "347", "516", "518", "585", "607", "631", "646", "716", "718", "845", "914", "917", "929"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "North Carolina",
      "description" : "North Carolina",
      "metadata" : {
        "abbreviation": "NC",
        "country" : "United States",
        "areaCodes" : ["252", "336", "704", "828", "910", "919", "980", "984"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "North Dakota",
      "description" : "North Dakota",
      "metadata" : {
        "abbreviation": "ND",
        "country" : "United States",
        "areaCodes" : ["701"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Northern Mariana Islands",
      "description" : "Northern Mariana Islands",
      "metadata" : {
        "abbreviation": "MP",
        "country" : "United States",
        "areaCodes" : ["670"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Ohio",
      "description" : "Ohio",
      "metadata" : {
        "abbreviation": "OH",
        "country" : "United States",
        "areaCodes" : ["216", "234", "330", "419", "440", "513", "567", "614", "740", "937"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Oklahoma",
      "description" : "Oklahoma",
      "metadata" : {
        "abbreviation": "OK",
        "country" : "United States",
        "areaCodes" : ["405", "539", "580", "918"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Oregon",
      "description" : "Oregon",
      "metadata" : {
        "abbreviation": "OR",
        "country" : "United States",
        "areaCodes" : ["458", "503", "541", "971"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Pennsylvania",
      "description" : "Pennsylvania",
      "metadata" : {
        "abbreviation": "PA",
        "country" : "United States",
        "areaCodes" : ["215", "267", "272", "412", "484", "570", "610", "717", "724", "814", "878"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Puerto Rico",
      "description" : "Puerto Rico",
      "metadata" : {
        "abbreviation": "PR",
        "country" : "United States",
        "areaCodes" : ["787", "939"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Rhode Island",
      "description" : "Rhode Island",
      "metadata" : {
        "abbreviation": "RI",
        "country" : "United States",
        "areaCodes" : ["401"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "South Carolina",
      "description" : "South Carolina",
      "metadata" : {
        "abbreviation": "SC",
        "country" : "United States",
        "areaCodes" : ["803", "843", "864"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "South Dakota",
      "description" : "South Dakota",
      "metadata" : {
        "abbreviation": "SD",
        "country" : "United States",
        "areaCodes" : ["605"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Tennessee",
      "description" : "Tennessee",
      "metadata" : {
        "abbreviation": "TN",
        "country" : "United States",
        "areaCodes" : ["423", "615", "731", "865", "901", "931"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Texas",
      "description" : "Texas",
      "metadata" : {
        "abbreviation": "TX",
        "country" : "United States",
        "areaCodes" : ["210", "214", "254", "281", "325", "346", "361", "409", "430", "432", "469", "512", "682", "713", "737", "806", "817", "830", "832", "903", "915", "936", "940", "956", "972", "979"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Utah",
      "description" : "Utah",
      "metadata" : {
        "abbreviation": "UT",
        "country" : "United States",
        "areaCodes" : ["385", "435", "801"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Vermont",
      "description" : "Vermont",
      "metadata" : {
        "abbreviation": "VT",
        "country" : "United States",
        "areaCodes" : ["802"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Virgin Islands",
      "description" : "Virgin Islands",
      "metadata" : {
        "abbreviation": "VI",
        "country" : "United States",
        "areaCodes" : ["340"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Virginia",
      "description" : "Virginia",
      "metadata" : {
        "abbreviation": "VA",
        "country" : "United States",
        "areaCodes" : ["276", "434", "540", "571", "703", "757", "804"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Washington",
      "description" : "Washington",
      "metadata" : {
        "abbreviation": "WA",
        "country" : "United States",
        "areaCodes" : ["206", "253", "360", "425", "509"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "District of Columbia",
      "description" : "District of Columbia",
      "metadata" : {
        "abbreviation": "DC",
        "country" : "United States",
        "areaCodes" : ["202"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "West Virginia",
      "description" : "West Virginia",
      "metadata" : {
        "abbreviation": "WV",
        "country" : "United States",
        "areaCodes" : ["304", "681"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Wisconsin",
      "description" : "Wisconsin",
      "metadata" : {
        "abbreviation": "WI",
        "country" : "United States",
        "areaCodes" : ["262", "414", "534", "608", "715", "920"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Wyoming",
      "description" : "Wyoming",
      "metadata" : {
        "abbreviation": "WY",
        "country" : "United States",
        "areaCodes" : ["307"]
      }
    },{
      "type" : "STATES",
      "keyValue" : "Alberta",
      "description" : "Alberta",
      "metadata" : {
        "abbreviation": "AB",
        "country" : "Canada",
        "areaCodes" : ["403", "587", "780"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "British Columbia",
      "description" : "British Columbia",
      "metadata" : {
        "abbreviation": "BC",
        "country" : "Canada",
        "areaCodes" : ["236", "250", "604", "778"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Manitoba",
      "description" : "Manitoba",
      "metadata" : {
        "abbreviation": "MB",
        "country" : "Canada",
        "areaCodes" : ["204", "431"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "New Brunswick",
      "description" : "New Brunswick",
      "metadata" : {
        "abbreviation": "NB",
        "country" : "Canada",
        "areaCodes" : ["506"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Newfoundland",
      "description" : "Newfoundland",
      "metadata" : {
        "abbreviation": "NL",
        "country" : "Canada",
        "areaCodes" : ["709"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Northwest Territories",
      "description" : "Northwest Territories",
      "metadata" : {
        "abbreviation": "NT",
        "country" : "Canada",
        "areaCodes" : ["867"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Nova Scotia",
      "description" : "Nova Scotia",
      "metadata" : {
        "abbreviation": "NS",
        "country" : "Canada",
        "areaCodes" : ["902"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Nunavut",
      "description" : "Nunavut",
      "metadata" : {
        "abbreviation": "NU",
        "country" : "Canada",
        "areaCodes" : ["867"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Ontario",
      "description" : "Ontario",
      "metadata" : {
        "abbreviation": "ON",
        "country" : "Canada",
        "areaCodes" : ["226", "249", "289", "343", "365", "416", "437", "519", "613", "647", "705", "807", "905"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Quebec",
      "description" : "Quebec",
      "metadata" : {
        "abbreviation": "QC",
        "country" : "Canada",
        "areaCodes" : ["418", "438", "450", "514", "579", "581", "819", "873"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Saskatchewan",
      "description" : "Saskatchewan",
      "metadata" : {
        "abbreviation": "SK",
        "country" : "Canada",
        "areaCodes" : ["306", "639"]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Yukon",
      "description" : "Yukon",
      "metadata" : {
        "abbreviation": "YT",
        "country" : "Canada",
        "areaCodes" : ["867 "]
      }
    }, {
      "type" : "STATES",
      "keyValue" : "Prince Edward Island",
      "description" : "Prince Edward Island",
      "metadata" : {
        "abbreviation": "PE",
        "areaCodes" : [ "902", "782"],
        "country" : "Canada"
      }
    }
  ];