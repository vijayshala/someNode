import config from '../../config';
import constants from '../../config/constants';

export const StripeProducts = [

];

export const StripePlans = [
  {
    currency: 'eur',
    interval: 'month',
    product: '',
    price: 0,
    interval_count: 1,
    metadata: {
      LegacyPlanOptionKey: '',
      QuantityStep: '1',
      sku: 'SPACES-ESSENTIAL-USER-DE',
      AvayaStoreEnvironment: config.environment
    },
    product_sku: 'SPACES-ESSENTIAL-USER'
  }, {
    currency: 'eur',
    interval: 'month',
    product: '',
    price: 500,
    interval_count: 1,
    metadata: {
      LegacyPlanOptionKey: '',
      QuantityStep: '1',
      sku: 'SPACES-BUSINESS-USER-DE',
      AvayaStoreEnvironment: config.environment
    },
    product_sku: 'SPACES-BUSINESS-USER'
  }, {
    currency: 'eur',
    interval: 'month',
    product: '',
    price: 2500,
    interval_count: 1,
    metadata: {
      LegacyPlanOptionKey: '',
      QuantityStep: '1',
      sku: 'SPACES-POWER-USER-DE',
      AvayaStoreEnvironment: config.environment
    },
    product_sku: 'SPACES-POWER-USER'
  },
  {
    currency: 'eur',
    interval: 'month',
    product: '',
    price: 500,
    interval_count: 1,
    metadata: {
      LegacyPlanOptionKey: '',
      QuantityStep: '1',
      sku: 'SPACES-DIALIN-ADDON-DE',
      AvayaStoreEnvironment: config.environment
    },
    product_sku: 'SPACES-DIALIN-ADDON'
  }
];

export const AvalaraTaxCodes = [
  {
    sku: 'SPACES-ESSENTIAL-USER-DE',
    taxCodes: {
      transactionType: 3,
      serviceType: 34
    }
  }, {
    sku: 'SPACES-BUSINESS-USER-DE',
    taxCodes: {
      transactionType: 3,
      serviceType: 34
    }
  }, {
    sku: 'SPACES-POWER-USER-DE',
    taxCodes: {
      transactionType: 3,
      serviceType: 34
    }
  }, {
    sku: 'SPACES-DIALIN-ADDON-DE',
    taxCodes: {
      transactionType: 3,
      serviceType: 34
    }
  }
];
