import config from '../../config';
import constants from '../../config/constants';

export const StripeProducts = [
  {
    name: 'SPACES-ESSENTIAL-USER',
    type: 'service', //or type=good
    metadata: {
      sku: 'SPACES-ESSENTIAL-USER',
      AvayaStoreProductId: '',
      description: 'Avaya Spaces Essential User',
      AvayaStoreEnvironment: config.environment
    }
  }, {
    name: 'SPACES-BUSINESS-USER',
    type: 'service', //or type=good
    metadata: {
      sku: 'SPACES-BUSINESS-USER',
      AvayaStoreProductId: '',
      description: 'Avaya Spaces Business User',
      AvayaStoreEnvironment: config.environment
    }
  }, {
    name: 'SPACES-POWER-USER',
    type: 'service', //or type=good
    metadata: {
      sku: 'SPACES-POWER-USER',
      AvayaStoreProductId: '',
      description: 'Avaya Spaces Power User',
      AvayaStoreEnvironment: config.environment
    }
  },
  {
    name: 'SPACES-DIALIN-ADDON',
    type: 'service', //or type=good
    metadata: {
      sku: 'SPACES-DIALIN-ADDON',
      AvayaStoreProductId: '',
      description: 'Avaya Spaces Dialin Addon',
      AvayaStoreEnvironment: config.environment
    }
  }
];

export const StripePlans = [
  
];

export const AvalaraTaxCodes = [
  
];
