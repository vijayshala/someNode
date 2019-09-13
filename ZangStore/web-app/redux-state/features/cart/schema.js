const ns = '[cart/schema]';
import { schema, normalize } from 'normalizr';
import logger from 'js-logger'
import { omit } from 'lodash';
import ID from '../../../common/id'

import { SALESMODEL, SALESMODEL_ITEM, SALESMODEL_ATTRIBUTE_ITEM } from '../salesmodels/schema'
import { OFFER } from '../offers/schema'

const CART_ITEM = new schema.Entity('cartItems', {
  offer: OFFER,
  salesModel: SALESMODEL,
  salesModelItem: SALESMODEL_ITEM,
  attribute: SALESMODEL_ATTRIBUTE_ITEM
}, {
  idAttribute: '_id',
  // processStrategy: entity => ({
  //   parent: entity._id,    
  // })
});


const CART = new schema.Entity('cart', { items: [CART_ITEM] }, { idAttribute: '_id' });

function sanitizeCartData(cart = {}) {
  let fn = `${ns}[sanitizeCartData]`
  cart._id = cart._id || ID();
  let items = (cart.items || []).map(item=>{
    item._id = item._id || ID(); 
    // logger.info(fn, 'item', item.attribute);
    item.selectedOptions = item.attribute && (item.attribute.helper || item.attribute.value)
      ? {
        value: item.attribute.value,
        helper: item.attribute.helper
      }
      : item.salesModelItem && (item.salesModelItem.helper || item.salesModelItem.value) ? {
        value: item.salesModelItem.value,
        helper: item.salesModelItem.helper
      }
        : null;
    // logger.info(fn, 'item', item);
    return item;
  })
  cart.items = items;
  return cart
}

export function normalizeCart(response, state) {   
  let fn = `${ns}[normalizeCart]`
  let res = null;
  if (response.data) {
    res = normalize(sanitizeCartData(response.data), CART);
  }    
  logger.info(fn, response, res)
  return res;
}

export default {  
  CART: CART,  
  CART_ITEM: CART_ITEM,
  CART_ITEMS: [CART_ITEM]
};
