const ns = '[order.utils]';
const logger = require('applogger');

const CreateOrderConfirmationNumber = () => {
  var rand = 'xxxyxxxx-'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  var d = new Date().getTime().toString();
  d = d.slice(-8)
  var str = rand + d;
  return str.toUpperCase();
};

const isOrderProcessingCompleted = (processStatus) => {
  const { ORDER_PROCESSING_SUCCEED } = require('./order.constants');

  let completed = true;

  for (let stage in processStatus) {
    if (processStatus[stage] !== ORDER_PROCESSING_SUCCEED) {
      completed = false;
      break;
    }
  }

  return completed;
};

module.exports = {
  CreateOrderConfirmationNumber,
  isOrderProcessingCompleted,
};
