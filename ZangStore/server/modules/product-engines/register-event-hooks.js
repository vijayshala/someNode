const register = (() => {
  const ipoffice = require('../../ip-office/event-hooks');
  const zangSpaces = require('../../zang-spaces/event-hooks');
  const kazoo = require('../../kazoo/event-hooks');

  return [
    ...ipoffice(),
    ...zangSpaces(),
    ...kazoo()
  ];
});

module.exports = register;
