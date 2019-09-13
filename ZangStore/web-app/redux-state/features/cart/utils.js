const ns = '[cart/utils]';
import logger from 'js-logger'
import ID from '../../../common/id'
import CartRulesMiddleware from './cartRulesMiddleware'

export const initialOfferCartItemState = {
  level: 0,
  salesModel: null,
  salesModelItem: null,  
  attribute: null,    
  title: { text: '', resource: '' },
  shortTitle: { text: '', resource: '' },
  quantity: 0,
  price: 0,
  isOneTimeCharge: false,
}

const onetimeTotal= {
  subTotal: 0,
  discount: 0,
  tax: 0,
  shipping: 0,
  total: 0
}
const subscriptionTotal= {
  identifier: '',

  contractLength: 0,
  contractPeriod: 'month',
  billingInterval: 0,
  billingPeriod: 'month',
  trialLength: 0,
  trialPeriod: 'month',

  subTotal: 0,
  discount: 0,
  tax: 0,
  shipping: 0,
  total: 0
} 

export function getEmptyCart() {
  return { _id: ID(), items: [], onetime: {...onetimeTotal}, subscriptions: [...subscriptionTotal] }
}
  
export const initialOfferCartState = {
  items: [],
  onetime: {...onetimeTotal}, 
  subscriptions: [{...subscriptionTotal}]
}
  
export function initCartData(state, offerIdentifier, salesModel) {
  let fn = `${ns}[initCartData]`
  let {salesModelItems} = state.entities;
  logger.info(fn, offerIdentifier, salesModel)
  let cart = getEmptyCart();
  cart.items = [];  
  let level = 0;
  let mainCartItem = {
    ...initialOfferCartItemState,   
    _id: ID(),     
    salesModel: {
      _id: salesModel._id,
      identifier: salesModel.identifier
    },
    title: salesModel.title,
    quantity: 1    
  }
  cart.items.push(mainCartItem);
  for (var itemId of salesModel.items) {
    let salesModelItem = salesModelItems[itemId]
    logger.info(fn, offerIdentifier, 'salesModelItem', salesModelItem);
    if (salesModelItem.defaultQuantity > 0) {
      // let price = salesModelItem.salePrice ? salesModelItem.salePrice : salesModelItem.regularPrice;      
      let cartItem = {
        ...initialOfferCartItemState, 
        _id: ID(),
        level: 1,       
        salesModel: {
          _id: salesModel._id,
          identifier: salesModel.identifier
        },
        salesModelItem: {
          _id: salesModelItem._id,
          identifier: salesModelItem.identifier
        },
        // product: {
        //   _id: salesModelItem.product._id,
        //   identifier: salesModelItem.product.identifier
        // },        
        title: salesModelItem.title,
        shortTitle: salesModelItem.shortTitle,
        quantity: salesModelItem.defaultQuantity,
        regularPrice: salesModelItem.regularPrice,        
        price: salesModelItem.price,
        isOneTimeCharge: salesModelItem.isOneTimeCharge  || false
      };

      if (cartItem.isOneTimePrice) {
        cart.onetime.subTotal += (cartItem.quantity * cartItem.price);
      }
      else {
        cart.subscription.subTotal += (cartItem.quantity * cartItem.price);
      }

      logger.info(fn, offerIdentifier,'cartItem', cartItem)
      cart.items.push(cartItem)
    }
  }
  cart.onetime.total = cart.onetime.subTotal
  cart.subscription.total = cart.subscription.subTotal
  logger.info(fn, offerIdentifier,'cart', cart)
  return cart;
}


export function hasCartItemByTag(cart, tag, notTag) {
  let fn = `${ns}[hasCartItemByTag]`
  logger.warn(fn, 'begin', { cart, tag });
  if (!cart || !tag) {
    logger.warn(fn, 'invalid params', { cart, tag });
  }

  notTag = notTag ? notTag : '';

  for (var item of (cart.items || [])) {
    if (item.salesModel && item.salesModel.tags && item.salesModel.tags.indexOf(tag) > -1 && item.salesModel.tags.indexOf(notTag) === -1) {
      return item;
    }
    if (item.salesModelItem && item.salesModelItem.tags && item.salesModelItem.tags.indexOf(tag) > -1 && item.salesModelItem.tags.indexOf(notTag) === -1) {
      return item;
    }
    if (item.attributes && item.attributes.tags && item.attributes.tags.indexOf(tag) > -1 && item.attributes.tags.indexOf(notTag) === -1) {
      return item;
    }
  }
  return null;
}