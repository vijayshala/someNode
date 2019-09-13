const register = (taskqueue => {
  const ipoffice = require('../../ip-office/cart-salesmodel-rules');
  const kazoo = require('../../kazoo/cart-salesmodel-rules');

  return {
    ...ipoffice(),
    ...kazoo(),
  };
});

module.exports = register;
