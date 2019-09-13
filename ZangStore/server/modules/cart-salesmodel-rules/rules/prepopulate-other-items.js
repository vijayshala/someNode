const ns = '[cart-salesmodel-rules][rules][pre-populate-other-items]';

const processEvent = function(params) {
  // params suppose to have itemIndex, parameters
  const itemIndex = params && params.itemIndex;
  const parameters = params && params.parameters;

  return function(context) {
    const _this = this;
    const fn = `${ns}[processEvent]`;
    const event = context.event;
    
    const parametersJson = JSON.stringify(parameters);
    console.log(fn, `start (itemIndex=${itemIndex}, parameters=${parametersJson})`);
    // context suppose to have event, cart
    // console.log(fn, 'context:', JSON.stringify(context));

    let cart = context.cart;

    // modify cart here

    console.log(fn, 'done');
  };
};

module.exports = processEvent;