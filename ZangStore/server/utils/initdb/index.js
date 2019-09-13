const ns = '[utils]';
const logger = require('applogger');

const initProducts = require('./init-products');
const initSalesModels = require('./init-salesmodels');
const initSpacesSalesModelsUS = require('./init-salesmodels-spaces-us');
const initSpacesSalesModelsDe = require('./init-salesmodels-spaces-de');
const initSpacesSalesModelsCA = require('./init-salesmodels-spaces-ca');
const initSpacesSalesModelsUK = require('./init-salesmodels-spaces-uk');
const initSalesModelsKazooDe = require('./init-salesmodels-kazoo-de')
const initOffers = require('./init-offers');
const initSpacesOffersUS = require('./init-offers-spaces-us');
const initSpacesOffersDe = require('./init-offers-spaces-de');
const initSpacesOffersUK = require('./init-offers-spaces-uk');
const initSpacesOffersCA = require('./init-offers-spaces-ca');
const initKazooOffersDe = require('./init-offers-kazoo-de')
const initCountries = require('./init-countries')
const initRegions = require('./init-regions')
const initCart = require('./init-cart');
const initengines = require('./init-engines');

export function initDB(req, res) {
  let fn = `[${req.requestId}]${ns}[initDB]`;

  logger.info(fn, 'begin')

  let promise = Promise.resolve();

  promise.then(async () => {
    const options = {};
    await initCart(options);
    await initProducts(options);
    
    await initSalesModels(options);
    await initSpacesSalesModelsUS(options);
    //await initSpacesSalesModelsDe(options);
    //await initSpacesSalesModelsUK(options);
    //await initSpacesSalesModelsCA(options);
    await initSalesModelsKazooDe(options);

    await initOffers(options);
    await initKazooOffersDe(options);
    await initSpacesOffersUS(options);

    //Not used, comment out for now
    //await initengines(options);
    //await initSpacesOffersDe(options);
    //await initSpacesOffersUK(options);
    //await initSpacesOffersCA(options);
  })
    .then(() => {
      res.status(200).json({
        status: true,
      });
    })
    .catch((error) => {
      console.error(error);
      logger.error(fn, error);
      res.status(500).json({
        error: error,
      });
    });
}


export function initCountriesDB(req, res) {
  let fn = `[${req.requestId}]${ns}[initCountriesDB]`;

  logger.info(fn, 'begin')

  let promise = Promise.resolve();

  promise.then(async () => {
    const options = {};
    let countries = await initCountries(options);
  //   res.status(200).json({
  //     countries
  //  })
  })
    .then(() => {
      res.status(200).json({
        status: true,
      });
    })
    .catch((error) => {
      console.error(error);
      logger.error(fn, error);
      res.status(500).json({
        error: error,
      });
    });
}


export function initRegionsDB(req, res) {
  let fn = `[${req.requestId}]${ns}[initRegionsDB]`;

  logger.info(fn, 'begin')

  let promise = Promise.resolve();

  promise.then(async () => {
    const options = {};
    let regions = await initRegions(options);
    let countries = await initCountries(options);
  //   res.status(200).json({
  //     countries
  //  })
  })
    .then(() => {
      res.status(200).json({
        status: true,
      });
    })
    .catch((error) => {
      console.error(error);
      logger.error(fn, error);
      res.status(500).json({
        error: error,
      });
    });
}