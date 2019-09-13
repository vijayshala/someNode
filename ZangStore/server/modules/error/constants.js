const VIOLATIONS = {
  FIELD_IS_EMPTY: 'VIOLATION.FIELD_IS_EMPTY',
  FIELD_VALUE_INVALID: 'VIOLATION.FIELD_VALUE_INVALID',
  TAX_CALCULATION_FAILED: 'VIOLATION.TAX_CALCULATION_FAILED',
  AGREE_ON_LEGAL_DOC: 'VIOLATION.AGREE_ON_LEGAL_DOC',
  CART_IS_EMPTY: 'VIOLATION.CART_IS_EMPTY',
  CART_IS_TOO_BIG: 'VIOLATION.CART_IS_TOO_BIG',
  QUOTE_IS_EMPTY: 'VIOLATION.QUOTE_IS_EMPTY',
  QUOTE_IS_TOO_BIG: 'VIOLATION.CART_IS_TOO_BIG',
};

const SALESMODELRULES = {
  UNKNOWN_ERROR: 'SALESMODELRULE.UNKNOWN_ERROR',
  INVALID_PARAMETER: 'SALESMODELRULE.INVALID_PARAMETER',
  NOT_SAME_CURRENCY: 'SALESMODELRULE.NOT_SAME_CURRENCY',
  NOT_SAME_REGION: 'SALESMODELRULE.NOT_SAME_REGION',
  REMOVE_OTHER_ITEMS: 'SALESMODELRULE.REMOVE_OTHER_ITEMS',
  QUANTITY_AUTO_ADJUSTED: 'SALESMODELRULE.QUANTITY_AUTO_ADJUSTED',
  DISCOUNT_AUTO_ADJUSTED: 'SALESMODELRULE.DISCOUNT_AUTO_ADJUSTED',
  QUANTITY_BASED_PRICE: 'SALESMODELRULE.QUANTITY_BASED_PRICE',
  DISCOUNT_RULE_MISSING: 'SALESMODELRULE.DISCOUNT_RULE_MISSING',
};

module.exports = {
  VIOLATIONS,
  SALESMODELRULES,
};
