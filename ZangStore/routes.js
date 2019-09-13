var logger = require('applogger');
import { AVAILABLE_REGIONS, DEFAULT_REGION, isValidRegion, regionHandler } from './server/region/region.constants'

module.exports = function (app) {



  app.use('/user', require('./routes/UserRoutes'));

  app.use('/partners', require('./routes/PartnerRoutes'));
  app.use('/appauth', require('./routes/AppAuthRoutes'));

  app.use('/:region/legal', regionHandler, require('./server/legal/legal.routes.views'));
  app.use('/legal/cookie-statement', function (req, res) {
    let region = req.region;
    if (!isValidRegion(region)) {
      region = DEFAULT_REGION;
    }
    return res.redirect(`/${encodeURIComponent(region)}/legal/cookie-statement`);
  });

  // redirect if no region passed for headless
  app.use('/legal/headless/:document', function (req, res) {
    let region = req.region;
    if (!isValidRegion(region)) {
      region = DEFAULT_REGION;
    }
    
    return res.redirect(`/${encodeURIComponent(region)}/legal/headless/${req.params.document}`);
  });


  // redirect if no region passed
  app.use('/legal', function (req, res) {
    let region = req.region;
    if (!isValidRegion(region)) {
      region = DEFAULT_REGION;
    }
    return res.redirect(`/${encodeURIComponent(region)}/legal`);
  });

  app.use('/adw', require('./server/adw/adw.routes.views'));

  // new views
  app.use('/fallback', require('./server/fallback/fallback.routes.views'));
  app.use('/orders', require('./server/order/order.routes.views'));
  app.use('/purchased-plans', require('./server/purchased-plan/purchased-plan.routes.views'));
  app.use('/purchase-orders', require('./server/billingaccount/billingaccount.routes.views'));
  app.use('/regions', require('./server/region/region.routes.views'))
  //app.use('/webapp', require('./server/webapp/webapp.routes.views'));

  app.use('/referrallink', require('./server/partner/partner-referral.routes'));

  // app.route('/offers/*')
  // .get(require('./server/webapp/webapp.routes.views'));

  // app.use('/clientapi/products/instanceconfigs', require('./server/productinstanceconfig/productinstanceconfig.routes'));
  app.use('/clientapi/billingaccount', require('./server/billingaccount/billingaccount.routes.api'));
  app.use('/clientapi/products', require('./server/product/product.routes.api'));
  app.use('/clientapi/salesmodels', require('./server/salesmodel/salesmodel.routes.api'));
  app.use('/clientapi/offers', require('./server/offer/offer.routes.api'));
  app.use('/clientapi/cart', require('./server/cart/cart.routes.api'));
  app.use('/clientapi/orders', require('./server/order/order.routes.api'));
  app.use('/clientapi/purchased-plans', require('./server/purchased-plan/purchased-plan.routes.api'));
  app.use('/clientapi/quotes', require('./server/quote/quote.routes.api'));
  app.use('/clientapi/partners', require('./server/partner/partner.routes.api'));
  app.use('/clientapi/users', require('./server/user/user.routes.api'));
  app.use('/clientapi/dids', require('./server/did/did.routes.api'));
  app.use('/clientapi/webapp', require('./server/webapp/webapp.routes.api'));
  app.use('/clientapi/regions', require('./server/region/region.routes.api'));
  app.use('/clientapi/utils', require('./server/utils/utils.routes.api'));
  app.use('/internal/initbilling', require('./server/billing/initDB'));
  app.use('/api/gsmb', require('./server/billing/gsmb/gsmb.routes.api'));
  app.use('/:region/legal/headless', require('./server/legal/legal.routes.api'));

  // load product engine routes
  const productEnginesRegister = require('./server/modules/product-engines/register-routes');
  productEnginesRegister(app);





  app.use('/quotes', require('./server/quote/quote.routes.views'));



  app.use('/shop/configure', regionHandler, require('./server/offer/offer.routes.config.views'));
  app.use('/:region/billingaccount', regionHandler, require('./routes/CreditCardRoutes'));
  app.use('/:region/shop/cart', regionHandler, require('./server/cart/cart.routes.views'));
  app.use('/:region/shop/configure', regionHandler, require('./server/offer/offer.routes.views'));
  // app.use('/:region/quotes', regionHandler, require('./server/quote/quote.routes.views'))  
  app.use('/:region/', regionHandler, require('./server/marketing/marketing.routes.views'))
  //By Wesley: For backwards compatiblity with old partner links we check db and redirect to new partner link
  app.use('/:partnerCode', function (req, res, next) {
    const partnerCode = req.params.partnerCode;

    if (partnerCode && partnerCode.length === 20) {
      const { PartnerAgentBackend } = require('./server/partner/partner-agent.backend');

      const partnerAgentExists = PartnerAgentBackend.findOne({
        code: partnerCode
      }, {
          ignoreNotFoundError: true
        });

      if (partnerAgentExists) {
        return res.redirect(`/referrallink/${encodeURIComponent(partnerCode)}`);
      }
    }

    next();
  });

  app.use('/', function (req, res, next) {
    let region = req.region;
    if (!isValidRegion(region)) {
      region = DEFAULT_REGION;
    }
    return res.redirect(`/${encodeURIComponent(region)}`);///home
  });


}
