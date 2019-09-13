var ns = '[UserRoutes]';
var express = require('express');
var router = express.Router();
var BaseController = require('../controllers/BaseController');
var UserController = require('../controllers/UserController');
import config from '../config';

const AuthorizeAdmin = (req, res, next) => {
  if(req.params.id !== 'me'){
     return BaseController.authorizeAdmin(req, res, next)
  }
  next()
}

/* GET home page. */
router.get('/', [BaseController.authenticate, BaseController.authorizeAdmin, UserController.getUsers]);
router.get('/:id/edit', [BaseController.authenticate, BaseController.authorizeAdmin, UserController.editUser]);
router.get('/:id/level', [BaseController.authenticate, BaseController.authorizeAdmin, UserController.changeAccessLevel])

router.get('/:id/info', BaseController.authenticate, AuthorizeAdmin, UserController.getUserInformation)
router.get('/:id/orders/:slug', BaseController.authenticate, AuthorizeAdmin, UserController.getUserOrdersBySlug)
router.get('/:id/orders', BaseController.authenticate, AuthorizeAdmin, UserController.getUserOrdersBySlug)
router.get('/:id/plans', BaseController.authenticate, AuthorizeAdmin, UserController.getUserSubscriptionsBySlug)

//if (config.environment != 'production') {
  router.post('/:id/reset', BaseController.authenticate, BaseController.authorizeDev, UserController.resetAllPurchases)
  //router.get('/:id/resetpartner', BaseController.authenticate, BaseController.authorizeDev, UserController.resetAllMyPartners)
//}



module.exports = router;
