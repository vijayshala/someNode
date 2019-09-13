const { PRODUCT_ENGINE_NAME } = require('../constants');
const {
  ASEVENT_ORDER_SUCCESS,
  ASEVENT_ORDER_BEFORE_DELETE,
  ASEVENT_CART_BEFORE_UPDATE,
  ASEVENT_QUOTE_BEFORE_CREATE,
  ASEVENT_ORDER_BEFORE_CREATE,
  ASEVENT_PURCHASED_PLAN_INTERVAL,
  ASEVENT_CHANGE_ORDER_SUCCESS,
} = require('../../modules/event/constants');

const register = () => {
  return [
    { event: ASEVENT_CART_BEFORE_UPDATE, name: `${PRODUCT_ENGINE_NAME}.validate-zang-spaces-order`, listener: require('./validate-zang-spaces-order') },
    { event: ASEVENT_QUOTE_BEFORE_CREATE, name: `${PRODUCT_ENGINE_NAME}.validate-zang-spaces-order`, listener: require('./validate-zang-spaces-order') },
    { event: ASEVENT_ORDER_BEFORE_CREATE, name: `${PRODUCT_ENGINE_NAME}.validate-zang-spaces-order`, listener: require('./validate-zang-spaces-order') },

    { event: ASEVENT_ORDER_SUCCESS, name: `${PRODUCT_ENGINE_NAME}.provisioning`, listener: require('./provisioning') },
    
    { event: ASEVENT_CHANGE_ORDER_SUCCESS, name: `${PRODUCT_ENGINE_NAME}.provisioning`, listener: require('./provisioning') },

    { event: ASEVENT_ORDER_BEFORE_DELETE, name: `${PRODUCT_ENGINE_NAME}.unprovision`, listener: require('./unprovision') },

    { event: ASEVENT_PURCHASED_PLAN_INTERVAL, name: `${PRODUCT_ENGINE_NAME}.renewprovisioning`, listener: require('./renewprovisioning') },
  ];
};

module.exports = register;
