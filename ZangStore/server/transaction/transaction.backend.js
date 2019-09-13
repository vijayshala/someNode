const ns = '[transaction.backend]';

import logger from 'applogger';
import { DbBase } from '../modules/db/index';
import TransactionSchema from './transaction.model';
import * as Constants from '../billing/Constants';

const { STATUS } = require('./transaction.constants');

class TransactionBackend extends DbBase {
  async findByBillingEngineIdentifier(identifierValue, options) {
    let fn = `[${options && options.requestId}]${ns}[findByBillingEngineIdentifier]`;

    logger.info(fn, 'begin');

    options = Object.assign({
      identifierType: 'invoiceId',
      // billingEngine: Constants.PAYMENT_GATEWAYS.STRIPE,
      ignoreNotFoundError: true
    }, options);
    logger.info(fn, 'options:', options);

    let queryMetadata = `payment.metadata.${options.identifierType}`;
    let query = {
      'payment.billingEngine': options.billingEngine,
      [queryMetadata]: identifierValue
    };

    let transaction = await this.findOne(query, options);

    logger.info(fn, 'transaction ', transaction);

    return transaction;
  }

  async startTransaction(refType, refObject, details, userId, options) {
    const fn = `[${options && options.requestId}]${ns}[startTransaction]`;

    const now = new Date();
    const transaction = {
      ...details,

      transactionInitOn: now,
      status: STATUS.STARTED,
      refObject: refObject,
      refObjectType: refType,

      created: {
        ...(userId ? { by: userId } : {}),
        on: now,
      },
    };

    logger.info(fn, 'transaction prepared', transaction);

    let created = await this.create(transaction, options);
    if (created && created.toObject) {
      created = created.toObject();
    }

    return created;
  }

  async endTransaction(transactionId, status, extraUpdates, options) {
    const fn = `[${options && options.requestId}]${ns}[startTransaction]`;

    const update = {
      $set: {
        status,
        ...extraUpdates
      }
    };

    logger.info(fn, `updating transaction ${transactionId} status to ${status}`);

    return await this.findOneAndUpdate({
      _id: transactionId,
    }, update, options);
  }
}

let backend = new TransactionBackend(TransactionSchema, {});

export default backend;
