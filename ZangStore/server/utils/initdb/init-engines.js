const ns = '[init-engines]';

const logger = require('applogger');
const { EngineBackend } = require('../../engine/engine.backend');
const config = require('../../../config');

const initEngines = async (options) =>  {
    const fn = `[initEngines]`;

    options = Object.assign({}, options);


    const enginesList = [
        {
            name: 'kazoo-de',
            value: {
                apiURL: config.kazoo_de.apiURL,
                apiKey: config.kazoo_de.apiKey,
                accountId: config.kazoo_de.accountId
            }
        }
    ];

    for (let engine of enginesList) {
        logger.info(fn, `create new engine`);
        await EngineBackend.findOneAndUpdate({
            name: engine.name
        }, engine, {
            upsert: true,
            returnNewDocument: true
        });
    }
};

module.exports = initEngines;