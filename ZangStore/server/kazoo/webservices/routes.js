const { Router } = require('express');
const { servicePlan, provision, getProvisionStatus } = require('./controller');
const BaseController = require('../../../api/controllers/BaseController');

const router = new Router();

router.post('/serviceplan', BaseController.authorizeAdminApiKazoo, servicePlan);
router.post('/provision/:id', BaseController.authorizeAdminApiKazoo, provision);
router.get('/provision/:id', BaseController.authorizeAdminApiKazoo, getProvisionStatus);

module.exports = router;
