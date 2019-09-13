import config from '../../config';
import constants from '../../config/constants';

export const StripeProducts = [
    {
       name: 'AVAY-KZOP',
       type: 'service', //or type=good
       metadata: {
           sku: '',
           AvayaStoreProductId: '',
           description: 'Avaya Cloud Solutions Power User',
           AvayaStoreEnvironment: config.environment
       }
    },
    {
        name: 'AVAY-KZOS',
        type: 'service', //or type=good
        metadata: {
            sku: 'AVAY-KZOS',
            AvayaStoreProductId: '',
            description: 'Avaya Cloud Solutions Standard User',
            AvayaStoreEnvironment: config.environment
        }
     },
     {
        name: 'AVAY-KZOB',
        type: 'service', //or type=good
        metadata: {
            sku: 'AVAY-KZOB',
            AvayaStoreProductId: '',
            description: 'Avaya Cloud Solutions Basic User',
            AvayaStoreEnvironment: config.environment
        }
     },
     {
        name: 'AVAY-KZLO',
        type: 'service', //or type=good
        metadata: {
            sku: 'AVAY-KZLO',
            AvayaStoreProductId: '',
            description: 'Avaya Cloud Solutions Local DID',
            AvayaStoreEnvironment: config.environment
        }
     }
     
];

export const StripePlans = [
    {
        currency: 'eur',
        interval: 'month',
        product: '',
        price: 4995,
        interval_count: 1,
        metadata: {
            LegacyPlanOptionKey: '',
            QuantityStep: '1',
            sku: 'AVAYA-KZO-DEP-0005',
            AvayaStoreEnvironment: config.environment
        },
        product_sku: 'AVAY-KZOP'
    },
    {
        currency: 'eur',
        interval: 'month',
        product: '',
        price: 3995,
        interval_count: 1,
        metadata: {
            LegacyPlanOptionKey: '',
            QuantityStep: '6',
            sku: 'AVAYA-KZO-DEP-0099',
            AvayaStoreEnvironment: config.environment
        },
        product_sku: 'AVAY-KZOP'
    },
    {
      currency: 'eur',
      interval: 'month',
      product: '',
      price: 3995,
      interval_count: 1,
      metadata: {
          LegacyPlanOptionKey: '',
          QuantityStep: '1',
          sku: 'AVAYA-KZO-DEP-0099',
          AvayaStoreEnvironment: config.environment
      },
      product_sku: 'AVAY-KZOP'
    },
    {
        currency: 'eur',
        interval: 'month',
        product: '',
        price: 3795,
        interval_count: 1,
        metadata: {
            LegacyPlanOptionKey: '',
            QuantityStep: '100',
            sku: 'AVAYA-KZO-DEP-0999',
            AvayaStoreEnvironment: config.environment
        },
        product_sku: 'AVAY-KZOP'
    },
    {
      currency: 'eur',
      interval: 'month',
      product: '',
      price: 3795,
      interval_count: 1,
      metadata: {
          LegacyPlanOptionKey: '',
          QuantityStep: '100',
          sku: 'AVAYA-KZO-DEP-0999',
          AvayaStoreEnvironment: config.environment
      },
      product_sku: 'AVAY-KZOP'
    },
    {
        currency: 'eur',
        interval: 'month',
        product: '',
        price: 3495,
        interval_count: 1,
        metadata: {
            LegacyPlanOptionKey: '',
            QuantityStep: '1000',
            sku: 'AVAYA-KZO-DEP-1000',
            AvayaStoreEnvironment: config.environment
        },
        product_sku: 'AVAY-KZOP'
    },
    {
      currency: 'eur',
      interval: 'month',
      product: '',
      price: 3495,
      interval_count: 1,
      metadata: {
          LegacyPlanOptionKey: '',
          QuantityStep: '1000',
          sku: 'AVAYA-KZO-DEP-1000',
          AvayaStoreEnvironment: config.environment
      },
      product_sku: 'AVAYA-KZO-DEP'
    },
    {
        currency: 'eur',
        interval: 'month',
        product: '',
        price: 3995,
        interval_count: 1,
        metadata: {
            LegacyPlanOptionKey: '',
            QuantityStep: '1',
            sku: 'AVAY-KZOS-0005',
            AvayaStoreEnvironment: config.environment
        },
        product_sku: 'AVAY-KZOS'
    },
    {
        currency: 'eur',
        interval: 'month',
        product: '',
        price: 2995,
        interval_count: 1,
        metadata: {
            LegacyPlanOptionKey: '',
            QuantityStep: '6',
            sku: 'AVAYA-KZO-DES-0099',
            AvayaStoreEnvironment: config.environment
        },
        product_sku: 'AVAY-KZOS'
    },
    {
      currency: 'eur',
      interval: 'month',
      product: '',
      price: 2995,
      interval_count: 1,
      metadata: {
          LegacyPlanOptionKey: '',
          QuantityStep: '1',
          sku: 'AVAYA-KZO-DES-0099',
          AvayaStoreEnvironment: config.environment
      },
      product_sku: 'AVAY-KZOS'
    },
    {
        currency: 'eur',
        interval: 'month',
        product: '',
        price: 2795,
        interval_count: 1,
        metadata: {
            LegacyPlanOptionKey: '',
            QuantityStep: '100',
            sku: 'AVAYA-KZO-DES-0999',
            AvayaStoreEnvironment: config.environment
        },
        product_sku: 'AVAY-KZOS'
    },
    {
      currency: 'eur',
      interval: 'month',
      product: '',
      price: 2795,
      interval_count: 1,
      metadata: {
          LegacyPlanOptionKey: '',
          QuantityStep: '100',
          sku: 'AVAYA-KZO-DES-0999',
          AvayaStoreEnvironment: config.environment
      },
      product_sku: 'AVAY-KZOS'
    },
    {
        currency: 'eur',
        interval: 'month',
        product: '',
        price: 2495,
        interval_count: 1,
        metadata: {
            LegacyPlanOptionKey: '',
            QuantityStep: '1000',
            sku: 'AVAYA-KZO-DES-1000',
            AvayaStoreEnvironment: config.environment
        },
        product_sku: 'AVAY-KZOS'
    },
    {
      currency: 'eur',
      interval: 'month',
      product: '',
      price: 2495,
      interval_count: 1,
      metadata: {
          LegacyPlanOptionKey: '',
          QuantityStep: '1000',
          sku: 'AVAYA-KZO-DES-1000',
          AvayaStoreEnvironment: config.environment
      },
      product_sku: 'AVAY-KZOS'
    },
    {
        currency: 'eur',
        interval: 'month',
        product: '',
        price: 3495,
        interval_count: 1,
        metadata: {
            LegacyPlanOptionKey: '',
            QuantityStep: '1',
            sku: 'AVAYA-KZO-DEB-0005',
            AvayaStoreEnvironment: config.environment
        },
        product_sku: 'AVAY-KZOB'
    },
    {
        currency: 'eur',
        interval: 'month',
        product: '',
        price: 1995,
        interval_count: 1,
        metadata: {
            LegacyPlanOptionKey: '',
            QuantityStep: '6',
            sku: 'AVAYA-KZO-DEB-0099',
            AvayaStoreEnvironment: config.environment
        },
        product_sku: 'AVAY-KZOB'
    },
    {
      currency: 'eur',
      interval: 'month',
      product: '',
      price: 2495,
      interval_count: 1,
      metadata: {
          LegacyPlanOptionKey: '',
          QuantityStep: '6',
          sku: 'AVAYA-KZO-DEB-0099',
          AvayaStoreEnvironment: config.environment
      },
      product_sku: 'AVAY-KZOB'
    },
    {
        currency: 'eur',
        interval: 'month',
        product: '',
        price: 1795,
        interval_count: 1,
        metadata: {
            LegacyPlanOptionKey: '',
            QuantityStep: '100',
            sku: 'AVAYA-KZO-DEB-0999',
            AvayaStoreEnvironment: config.environment
        },
        product_sku: 'AVAY-KZOB'
    },
    {
      currency: 'eur',
      interval: 'month',
      product: '',
      price: 2295,
      interval_count: 1,
      metadata: {
          LegacyPlanOptionKey: '',
          QuantityStep: '100',
          sku: 'AVAYA-KZO-DEB-0999',
          AvayaStoreEnvironment: config.environment
      },
      product_sku: 'AVAY-KZOB'
    },
    {
        currency: 'eur',
        interval: 'month',
        product: '',
        price: 1495,
        interval_count: 1,
        metadata: {
            LegacyPlanOptionKey: '',
            QuantityStep: '6',
            sku: 'AVAYA-KZO-DEB-1000',
            AvayaStoreEnvironment: config.environment
        },
        product_sku: 'AVAY-KZOB'
    },
    {
      currency: 'eur',
      interval: 'month',
      product: '',
      price: 1995,
      interval_count: 1,
      metadata: {
          LegacyPlanOptionKey: '',
          QuantityStep: '6',
          sku: 'AVAYA-KZO-DEB-1000',
          AvayaStoreEnvironment: config.environment
      },
      product_sku: 'AVAY-KZOB'
    },
    {
        currency: 'eur',
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
      currency: 'eur',
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
        currency: 'eur',
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
      currency: 'eur',
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
        currency: 'eur',
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
      currency: 'eur',
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
        sku: 'AVAYA-KZO-DEP-0005',
        taxCodes: {
            transactionType: 59,
            serviceType: 6
        }
    },
    {
        sku: 'AVAYA-KZO-DEP-0099',
        taxCodes: {
            transactionType: 59,
            serviceType: 6
        }
    },
    {
        sku: 'AVAYA-KZO-DEP-0999',
        taxCodes: {
            transactionType: 59,
            serviceType: 6
        }
    },
    {
        sku: 'AVAYA-KZO-DEP-1000',
        taxCodes: {
            transactionType: 59,
            serviceType: 6
        }
    },
    {
        sku: 'AVAYA-KZO-DES-0005',
        taxCodes: {
            transactionType: 59,
            serviceType: 6
        }
    },
    {
        sku: 'AVAYA-KZO-DES-0099',
        taxCodes: {
            transactionType: 59,
            serviceType: 6
        }
    },
    {
        sku: 'AVAYA-KZO-DES-0999',
        taxCodes: {
            transactionType: 59,
            serviceType: 6
        }
    },
    {
        sku: 'AVAYA-KZO-DES-1000',
        taxCodes: {
            transactionType: 59,
            serviceType: 6
        }
    },
    {
        sku: 'AVAYA-KZO-DEB-0005',
        taxCodes: {
            transactionType: 59,
            serviceType: 6
        }
    },
    {
        sku: 'AVAYA-KZO-DEB-0099',
        taxCodes: {
            transactionType: 59,
            serviceType: 6
        }
    },
    {
        sku: 'AVAYA-KZO-DEB-0999',
        taxCodes: {
            transactionType: 59,
            serviceType: 6
        }
    },
    {
        sku: 'AVAYA-KZO-DEB-1000',
        taxCodes: {
            transactionType: 59,
            serviceType: 6
        }
    }, 
    {
        sku: 'AVAYA-KZO-DE-APPLICATION',
        taxCodes: {
            transactionType: 10,
            serviceType: 15
        }
    },
    
    {
      sku: 'AVAYA-KZO-DEP-0005',
      taxCodes: {
          transactionType: 59,
          serviceType: 6
      }
  },
  {
      sku: 'AVAYA-KZO-DEP-0099',
      taxCodes: {
          transactionType: 59,
          serviceType: 6
      }
  },
  {
      sku: 'AVAYA-KZO-DEP-0999',
      taxCodes: {
          transactionType: 59,
          serviceType: 6
      }
  },
  {
      sku: 'AVAYA-KZO-DEP-1000',
      taxCodes: {
          transactionType: 59,
          serviceType: 6
      }
  },
  {
      sku: 'AVAYA-KZO-DES-0005',
      taxCodes: {
          transactionType: 59,
          serviceType: 6
      }
  },
  {
      sku: 'AVAYA-KZO-DES-0099',
      taxCodes: {
          transactionType: 59,
          serviceType: 6
      }
  },
  {
      sku: 'AVAYA-KZO-DES-0999',
      taxCodes: {
          transactionType: 59,
          serviceType: 6
      }
  },
  {
      sku: 'AVAYA-KZO-DES-1000',
      taxCodes: {
          transactionType: 59,
          serviceType: 6
      }
  },
  {
      sku: 'AVAYA-KZO-DEB-0005',
      taxCodes: {
          transactionType: 59,
          serviceType: 6
      }
  },
  {
      sku: 'AVAYA-KZO-DEB-0099',
      taxCodes: {
          transactionType: 59,
          serviceType: 6
      }
  },
  {
      sku: 'AVAYA-KZO-DEB-0999',
      taxCodes: {
          transactionType: 59,
          serviceType: 6
      }
  },
  {
      sku: 'AVAYA-KZO-DEB-1000',
      taxCodes: {
          transactionType: 59,
          serviceType: 6
      }
  }
];
