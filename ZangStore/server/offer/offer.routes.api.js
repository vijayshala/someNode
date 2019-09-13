const { Router } = require('express');
const { getOffer, getOffers, getWizardDefaults, getOffersByRegion, getOffersByTag } = require('./offer.controller');

const router = new Router();

router.get('/', getOffers);
router.get('/:slug', getOffer);
router.get('/:slug/wizarddefaults', getWizardDefaults);
router.get('/region/:region', getOffersByRegion);
router.get('/tags/:offerTag', getOffersByTag);


module.exports = router;
