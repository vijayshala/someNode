const register = (taskqueue => {
  const globalTasks = require('../tasks');
  globalTasks(taskqueue);
  const ipoffice = require('../../ip-office/tasks');
  ipoffice(taskqueue);
  const zangspaces = require('../../zang-spaces/tasks');
  zangspaces(taskqueue);
  const kazoo = require('../../kazoo/tasks');
  kazoo(taskqueue);
});

module.exports = register;
