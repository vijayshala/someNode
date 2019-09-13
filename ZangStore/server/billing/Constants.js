export const PAYMENT_METHODS = {
  CREDIT_CARD: "CREDIT_CARD",
  PURCHASE_ORDER: 'PURCHASE_ORDER',
  IBAN: 'IBAN'
};

export const CONTRACT_STATUS = {
  ENABLED: 'ENABLED',
  DISABLED: 'DISABLED',
  DELETED: 'DELETED',
  IN_PROGRESS: 'IN_PROGRESS'
};

export const PAYMENT_GATEWAYS = {
  STRIPE: "STRIPE",
  STRIPE_CA: "STRIPE_CA",
  NATIVE: "NATIVE",
  GSMB: "GSMB"
};

export const CHARGE_STATUS = {
  NONE: "NONE",
  PENDING: "PENDING",
  CHARGED: "CHARGE_SUCCESS",
  CHARGE_FAILED: "CHARGE_FAILED",
  CANCELED: 'CANCELED'
};

export const BILLING_ENGINE_METHOD = {
  PLAN_B: "PLAN_B",
  PLAN_A: "PLAN_A",
  PLAN_C: "PLAN_C"
};

export const STRIPE_OBJECTS = {
  card: "CREDIT_CARD",
  plan: "PLAN",
  product: "PRODUCT",
  subscription: "SUBSCRIPTION",
  customer: "CUSTOMER",
  invoice: "INVOICE"
};

export const STRIPE_EVENTS = {
  CHARGE_FAILED: 'charge.failed',
  CHARGE_SUCCEEDED: 'charge.succeeded',
  CUSTOMER_DELETED: 'customer.deleted',
  CUSTOMER_SOURCE_DELETED: 'customer.source.deleted',
  CUSTOMER_SOURCE_EXPIRING: 'customer.source.expiring',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_TRIAL_ENDING: 'customer.subscription.trial_will_end',
  INVOICE_CREATED: 'invoice.created',
  INVOICE_UPCOMING: 'invoice.upcoming',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
  PLAN_DELETED: 'plan.deleted',
  PLAN_UPDATED: 'plan.updated',
  PLAN_CREATED: 'plan.created'
};

export const AVALARA_ENDPOINTS = {
  CALCULATE_TAX: '/api/v2/afc/calctaxes',
  COMMIT_TAX: '/api/v2/afc/commit',
  GEOCODE: '/api/v2/geo/geocode'
};

export const TAX_GATEWAYS = {
  AVALARA: 'AVALARA',
  NATIVE: 'NATIVE'
};

export const TAX_OBJECTS = {
  TAX_CODE: 'TAX_CODE'
};

export const CHARGE_DESCRIPTION = 'Avaya Store';

export const BILLING_ACCOUNT_PERM = {
  ADMIN: 'ADMIN',
  PERSONAL: 'PERSONAL'
};

export const TAX_EXCEPTIONS = {
  DE: [{
    tax: 0.19,
    name: 'VAT_19',
    code: 0
  }]
};

export const DEFAULT_REGION = 'US';

export const BILLING_ACCOUNT_OWNER = {
  USER: 'USER',
  GROUP: 'GROUP'
};

export const STRIPE_PROPERTY_NAMES = {
  SUBSCRIPTION: 'subscriptionId'
};

export const AVALARA_ADDRESS_ERRORS = [
  'County/State/Zip not found.',
  'Address not found.'
]