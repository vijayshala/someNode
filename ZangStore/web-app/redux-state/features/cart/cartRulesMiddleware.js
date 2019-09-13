const ns = '[CartRuleMiddleware]';
import logger from 'js-logger'
const csmrh = require('../../../../server/modules/cart-salesmodel-rules');
class CartRulesMiddleware {
  constructor() {
    this._salesmodels = {};
    this._offers = {};
    this._rulesHandler = null;
    this._cart = {};
    this.init();
  }

  init(cartInfo={}) {
    this._rulesHandler = new csmrh({      
      contact: cartInfo.contact,
      company: cartInfo.company,
      billingAddress: cartInfo.billingAddress,
      shippingAddress: cartInfo.shippingAddress,
    });
  }

  initSalesModels() {
    this._salesmodels = {};
    this._offers = {}
  }

  addOfferEntities(offers = {}, salesModels={}) {
    let fn = `${ns}[addOfferEntities]`; 
    let newOffers = Object.keys(offers).map(key => {
      let offer = {...offers[key]};
      let items = offer.items || [];
      let slModels = items.map(itmKey=>{
        let slItem = salesModels[itmKey]        
        return {...slItem}
      })
      return {...offer, salesModels:[...slModels]}
    });
    logger.info(fn, 'newOffers', newOffers);
    this.addOffers(newOffers);    
  }

  addOffers(offrers=[]) {
    let fn = `${ns}[addOffers]`;
    for(let offer of offrers){
      this._offers[offer.identifier] = offer;
    }
    var _offers = Object.keys(this._offers).map(key => {
      return this._offers[key];
    });
    logger.info(fn, '_offers', this._offers, _offers);
    this._rulesHandler.initOffersMapping(_offers);
  }

  addSalesModelEntities(salesModels = {}, salesModelItems = {}, salesModelItemAttributes = {}) {
    let fn = `${ns}[addSalesModelEntities]`; 
    let newSalesModels = Object.keys(salesModels).map(key => {
      let slModel = {...salesModels[key]};
      let items = slModel.items || [];
      let slItems = items.map(itmKey=>{
        let slItem = salesModelItems[itmKey]
        let attribs = slItem.attributes || [];
        let lstAttribs = attribs.map(attrbKey=>{
          return salesModelItemAttributes[attrbKey];
        })
        return {...slItem, attributes:[...lstAttribs]}
      })
      return {...slModel, items:[...slItems]}
    });
    logger.info(fn, 'newSalesModels', newSalesModels);
    this.addSalesModels(newSalesModels);
  }

  addSalesModels(salesModels=[]) {
    let fn = `${ns}[addSalesModels]`;
    for(let salesModel of salesModels){
      this._salesmodels[salesModel.identifier] = salesModel;
    }
    var _sl = Object.keys(this._salesmodels).map(key => {
      return this._salesmodels[key];
    });
    logger.info(fn, '_salesmodels', this._salesmodels, _sl);
    this._rulesHandler.initSalesModelsMapping(_sl);
  }

  initCart(region = 'us', currency = 'USD') {
    this._cart = this._rulesHandler.initCart(region, currency);   
    return this._cart;
  }

  addItem(quantity, offerIdentifier, salesModel, saleModelItem, attribute, options) {
    this._cart = this._rulesHandler.addItem(
      this._cart, 
      quantity,
      offerIdentifier,
      salesModel && salesModel.identifier, 
      saleModelItem && saleModelItem.identifier, 
      attribute && attribute.identifier,
      options);
      return this._cart;
  }

  updateCart() {
    this._cart = this._rulesHandler.update(this._cart);
    return this._cart;
  }

  sanitizeCart(cart) {
    return this._rulesHandler.sanitize(cart);
  }

  // addItemToCart(item) {
  //   let fn = `${ns}[addItemToCart]`;        
  //   this._cart = this.addItem(
  //     this._cart, 
  //     item.quantity, 
  //     item.salesModel && item.salesModel.identifier, 
  //     item.saleModelItem && item.saleModelItem.identifier, 
  //     item.attribute && item.attribute.identifier
  //   );
  //   return;
  // }
}


export default new CartRulesMiddleware();