const ns = '[offer.controller]'
import logger from 'applogger'
import async from 'async'
// import {
//   getOffer,
//   getOffers,
//   getOffersByCategory
// } from './offer.backend'

import {
  getShoppingWizardDefaultsBySlug,
  getWizardConfigDefaultOffer
} from './shoppingwizarddefaults.backend'

import {
  isSiteAdmin
} from '../user/user.constants'

// export function controllerGetOffersByCategory(req, res) {
//   let fn = `[${req.requestId}]${ns}[controllerGetOffersByCategory]`
//   let category = req.params.category
//   logger.info(fn, 'category:', category);
//   let promise = Promise.resolve();
//   promise.then(async () => {
//     try {
//       let offers = await getOffersByCategory(req, category);
//       logger.info(fn, 'offers:', offers);
//       res.status(200).json({
//         error: false,
//         data: offers
//       });
//     } catch (error) {
//       res.status(500).json({
//         error: error,
//       });
//     }
//   })
// }

export function getWizardDefaults(req, res) {
  let fn = `[${req.requestId}]${ns}[getWizardDefaults]`
  let SLUG = req.params.slug ? req.params.slug : ''
  let promise = Promise.resolve();
  promise.then(async () => {
    // try {
    logger.info(fn, 'slug:', {
      // plans,
      SLUG
    });
    let wizardConfig = await getShoppingWizardDefaultsBySlug(req, SLUG);
    // let plans = await getProductsByBaseSku(req, SLUG);
    logger.info(fn, 'wizardConfig:', wizardConfig);
    res.status(200).json({
      data: wizardConfig,      
    });
    // } catch (error) {
    //   res.status(500).json({
    //     error: error,
    //   });
    // }
  })
}




// export function addProductInfo(req, res) {
//   let fn = `[${req.requestId}]${ns}[addProductInfo]`
//   if (!isSiteAdmin(req.userInfo)) {
//     return res.status(403).json({
//       error: {
//         code: 'unauthorized',
//         message: 'not authorized to add offer'
//       },
//     });
//   }

//   let promise = Promise.resolve();
//   promise.then(async () => {
//     try {
//       let offer = await getOffer(req, {
//         slug: SLUG
//       });
//       logger.info(fn, 'offer:', offer);
//       res.status(200).json({
//         error: false,
//         data: offer
//       });
//     } catch (error) {
//       res.status(500).json({
//         error: error,
//       });
//     }
//   })
// }
