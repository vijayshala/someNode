const ns = '[utils]';
const logger = require('applogger');

const { MigrateContracts } = require('./migrate-contracts');
const { MigrateOrders } = require('./migrate-orders');

export function migrateLegacyModel(req, res) {
  let fn = `[${req.requestId}]${ns}[migrateLegacyModel]`;

  logger.info(fn, 'begin')

  let promise = Promise.resolve();

  promise.then(async() => {
      const options = {};

      await MigrateOrders(options);
      await MigrateContracts(options);
    })
    .then(() => {
      res.status(200).json({
        status: true,
      });
    })
    .catch((error) => {
      logger.error(fn, error);
      res.status(500).json({
        error: error,
      });
    });
}
