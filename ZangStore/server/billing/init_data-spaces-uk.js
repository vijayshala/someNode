import config from '../../config';
import constants from '../../config/constants';

export const StripeProducts = [

];

export const StripePlans = [
  {
    currency: 'gbp',
    interval: 'month',
    product: '',
    price: 0,
    interval_count: 1,
    metadata: {
      LegacyPlanOptionKey: '',
      QuantityStep: '1',
      sku: 'SPACES-ESSENTIAL-USER-UK',
      AvayaStoreEnvironment: config.environment
    },
    product_sku: 'SPACES-ESSENTIAL-USER'
  }, {
    currency: 'gbp',
    interval: 'month',
    product: '',
    price: 500,
    interval_count: 1,
    metadata: {
      LegacyPlanOptionKey: '',
      QuantityStep: '1',
      sku: 'SPACES-BUSINESS-USER-UK',
      AvayaStoreEnvironment: config.environment
    },
    product_sku: 'SPACES-BUSINESS-USER'
  }, {
    currency: 'gbp',
    interval: 'month',
    product: '',
    price: 2500,
    interval_count: 1,
    metadata: {
      LegacyPlanOptionKey: '',
      QuantityStep: '1',
      sku: 'SPACES-POWER-USER-UK',
      AvayaStoreEnvironment: config.environment
    },
    product_sku: 'SPACES-POWER-USER'
  },
  {
    currency: 'gbp',
    interval: 'month',
    product: '',
    price: 500,
    interval_count: 1,
    metadata: {
      LegacyPlanOptionKey: '',
      QuantityStep: '1',
      sku: 'SPACES-DIALIN-ADDON-UK',
      AvayaStoreEnvironment: config.environment
    },
    product_sku: 'SPACES-DIALIN-ADDON'
  }
];

export const AvalaraTaxCodes = [
  {
    sku: 'SPACES-ESSENTIAL-USER-UK',
    taxCodes: {
      transactionType: 3,
      serviceType: 34
    }
  }, {
    sku: 'SPACES-BUSINESS-USER-UK',
    taxCodes: {
      transactionType: 3,
      serviceType: 34
    }
  }, {
    sku: 'SPACES-POWER-USER-UK',
    taxCodes: {
      transactionType: 3,
      serviceType: 34
    }
  }, {
    sku: 'SPACES-DIALIN-ADDON-UK',
    taxCodes: {
      transactionType: 3,
      serviceType: 34
    }
  }
];
