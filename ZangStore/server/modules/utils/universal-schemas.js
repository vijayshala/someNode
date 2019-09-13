const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

const LEGAL_DOCUMENTS_DISPLAY_METHOD_MODAL = 'modal';
const LEGAL_DOCUMENTS_DISPLAY_METHOD_NEWWINDOW = 'newwindow';
const LEGAL_DOCUMENTS_DISPLAY_METHODS = [
  LEGAL_DOCUMENTS_DISPLAY_METHOD_MODAL,
  LEGAL_DOCUMENTS_DISPLAY_METHOD_NEWWINDOW,
];

const LegalDocumentSchema = new Schema({
  identifier: String,
  title: {
    text: String,
    resource: String,
  },
  content: {
    text: String,
    resource: String,
  },
  version: String,
  url: String, // can either have content or url
  pdf: String,
  display: {
    type: String,
    enum: LEGAL_DOCUMENTS_DISPLAY_METHODS,
  },
  requireUserConsent: Boolean,
});

/**
 * Rule to process SalesModel
 *
 * Example 1: empty cart before adding to
 * {
 *   type: 'empty-cart',
 *   hook: 'before-update-cart',
 * }
 *
 * Example 2: adding another SalesModel if adding one
 * {
 *   type: 'add-offer',
 *   hook: 'before-update-cart',
 *   input: [{
 *     parameter: 'anotherSalesModel',
 *     value: 'zang-spaces-plus-monthly',
 *   }]
 * }
 */
const RuleSchema = new Schema({
  identifier: {
    type: String,
    required: true,
  },
  event: {
    type: String,
    required: true,
  },
  parameters: [{
    parameter: String,
    value: Schema.Types.Mixed,
  }],
});

module.exports = {
  LEGAL_DOCUMENTS_DISPLAY_METHODS,
  LEGAL_DOCUMENTS_DISPLAY_METHOD_MODAL,
  LEGAL_DOCUMENTS_DISPLAY_METHOD_NEWWINDOW,

  LegalDocumentSchema,

  RuleSchema,
};
