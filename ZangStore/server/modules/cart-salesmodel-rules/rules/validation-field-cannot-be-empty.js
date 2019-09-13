const ns = '[cart-salesmodel-rules][rules][validation-field-cannot-be-empty]';

/**
 * This rule validate specific field and report warning if it's empty.
 *
 * @param {String}  field            required, field identifier
 *                                   can be nested identifier points to sub-properties.
 * @param {String|Object} message    error message
 *                                   - if it's string, it is just error message
 *                                   - if it's object, should be in format of { text: String, resource: String }
 */

const _ = require('lodash');

const processEvent = function(params) {
  const ruleOnItem = params && params.item;
  const parameters = params && params.parameters;
  const paramField = parameters && parameters.field;
  let paramMessage = parameters && parameters.message;

  return function(context) {
    const _this = this;
    const fn = `${ns}[processEvent]`;
    const event = context.event;
    const cart = context.cart;
    const { ErrorMessage, SALESMODELRULES, VIOLATIONS } = require('../../error');

    if (!paramField) {
      console.log(fn, `Invalid parameter: field is not defeined`);
      _this.error(event, new ErrorMessage(fn, SALESMODELRULES.INVALID_PARAMETER, {
        text: `Invalid parameter: field`,
        resource: ['SALESMODELRULE.INVALID_PARAMETER', 'field'],
      }));
      return;
    }

    const parametersJson = JSON.stringify(parameters);
    console.log(fn, `start (ruleOnItem=${ruleOnItem.identifier}, parameters=${parametersJson})`);

    const val = _.get(cart, paramField);
    if (!val) {
      if (!paramMessage) {
        paramMessage = {
          text: `${paramField} is required`,
          resource: ['VIOLATION.FIELD_IS_EMPTY', paramField],
        };
      } else if (_.isString(paramMessage)) {
        paramMessage = {
          text: paramMessage,
          resource: ['VIOLATION.FIELD_IS_EMPTY', paramField],
        };
      } else if (!_.isObject(paramMessage)) {
        console.log(fn, `Invalid parameter: message is not recognized`);
        _this.error(event, new ErrorMessage(fn, SALESMODELRULES.INVALID_PARAMETER, {
          text: `Invalid parameter: message`,
          resource: ['SALESMODELRULE.INVALID_PARAMETER', 'message'],
        }));
        return;
      }

      _this.warn(event, new ErrorMessage(fn, VIOLATIONS.FIELD_IS_EMPTY, paramMessage, paramField));
    }

    console.log(fn, 'done');
  };
};

module.exports = processEvent;
