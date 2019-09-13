const { PRODUCT_ENGINE_NAME } = require('../constants');
const {
  ASEVENT_CART_BEFORE_UPDATE,
  ASEVENT_ORDER_BEFORE_CREATE,
  ASEVENT_ORDER_CREATED,
  ASEVENT_ORDER_SUCCESS,
  ASEVENT_QUOTE_BEFORE_CREATE,
  ASEVENT_ORDER_BEFORE_DELETE
} = require('../../modules/event/constants');

const register = () => {
  return [
    { event: ASEVENT_CART_BEFORE_UPDATE, name: `${PRODUCT_ENGINE_NAME}.example`, listener: require('./example') },

    { event: ASEVENT_CART_BEFORE_UPDATE, name: `${PRODUCT_ENGINE_NAME}.validate-ipoffice-order`, listener: require('./validate-ipoffice-order') },
    { event: ASEVENT_QUOTE_BEFORE_CREATE, name: `${PRODUCT_ENGINE_NAME}.validate-ipoffice-order`, listener: require('./validate-ipoffice-order') },
    { event: ASEVENT_ORDER_BEFORE_CREATE, name: `${PRODUCT_ENGINE_NAME}.validate-ipoffice-order`, listener: require('./validate-ipoffice-order') },

    // { event: ASEVENT_ORDER_CREATED, name: `${PRODUCT_ENGINE_NAME}.send-tos-email`, listener: require('./send-tos-email') },

    { event: ASEVENT_ORDER_SUCCESS, name: `${PRODUCT_ENGINE_NAME}.provisioning`, listener: require('./provisioning') },

    { event: ASEVENT_ORDER_BEFORE_DELETE, name: `${PRODUCT_ENGINE_NAME}.unprovision`, listener: require('./unprovision') },
  ];
};

module.exports = register;
