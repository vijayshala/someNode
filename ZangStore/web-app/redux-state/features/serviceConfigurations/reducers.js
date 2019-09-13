import { Map } from 'immutable';
const defaultServiceConfig = {
  avayastorelocal: {
    spaces: {
      server_url: 'https://avayastorelocal.esna.com:5000',      
    },    
    accounts: {
      server_url: 'https://onesnatesting.esna.com'
    }
  },  
};

const serviceConfig =
  (!!process.env.SUBDOMAIN && defaultServiceConfig[process.env.SUBDOMAIN]) ||
  defaultServiceConfig.avayastorelocal;

export default (state = Map(serviceConfig), action) => {
  const { type, payload } = action;
  return state;
};
