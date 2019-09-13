const ns = '[partner-referral.routes]';

const express = require('express');
const PartnerController = require('../../controllers/PartnerController');

const router = express.Router();

router.get('/:code', PartnerController.SetPartnerConnection);

export default router;