const ns = '[cart/reducers]';
import logger from 'js-logger'
import { combineReducers } from 'redux';
import { ACTION_TYPES } from './constants';
import { ACTION_TYPES as QUOTES_ACTION_TYPES } from '../quotes/constants';
import { getEmptyCart } from './utils';

const cartDefaultState = {fetching: false, data: {...getEmptyCart()}}


export const cartItems = (state = {}, action) => {
  const { type, payload, meta } = action;
  switch (type) {
    case ACTION_TYPES.RESET_CART_INFO:
    case ACTION_TYPES.CLEAR_CART:
      let items = payload && payload.cart && payload.cart.items || []
      // logger.info(ns, 'cartItems items:', items)
      return Object.keys(state)
        .filter(key => items.indexOf(key)<0)
        .reduce((result, current) => {
          result[current] = state[current];
          return result;
      }, {});

    default:
      if(payload && payload.entities && payload.entities.cartItems) {
        return { ...state, ...payload.entities.cartItems };
      }
      return state;
  }
}

export const cart = (state = {}, action) => {
  const { type, payload, meta } = action;
  let cart = null;
  let shippingAddress = null;
  switch (type) {        
    case ACTION_TYPES.UPDATE_CART_ACCOUNT_INFO:
      if (payload._id) {
        cart = state[payload._id] || {}
        let contact = payload.contact || cart.contact || {}
        let billingAddress = payload.billingAddress || cart.billingAddress || {}
        shippingAddress = payload.shippingAddress || cart.shippingAddress || {}
        let company = payload.company || cart.company || {}

        if(payload.sameAsBilling) {
          shippingAddress = {...billingAddress}
        }

        return {
          ...state, [payload._id]: {
            ...cart,
            contact: { ...contact },
            billingAddress: { ...billingAddress },
            shippingAddress: {...shippingAddress},
            company: { ...company }
          }
        }
      }
      return state;
    case ACTION_TYPES.UPDATE_CART_PARTNER_INFO:
      if(payload._id) {
        let cart = state[payload._id] || {}
        let partner = payload.partnerId || cart.partner || {}
        let partnerAgent = payload.partnerAgentId || cart.partnerAgent || {}
        return { ...state, [payload._id]: {...state[payload._id], partner, partnerAgent}}
      } 
    case ACTION_TYPES.RESET_CART_INFO:
      return Object.keys(state)
        .filter(key => key != payload.cart._id)
        .reduce((result, current) => {
          result[current] = state[current];
          return result;
        }, {});
    case ACTION_TYPES.CLEAR_CART:
      if(payload.cart && payload.cart._id) {
        return {...state, [payload.cart._id]: {...getEmptyCart(), _id: payload.cart._id}}
      }
      return state;      
    default:
      if(payload && payload.entities && payload.entities.cart) {
        return { ...state, ...payload.entities.cart };
      }
      return state;
  }
  return state;
}

// export const cartByOffer = (state = { }, action) => {
//   let fn = `${ns}[cart]`
//   const { type, payload, offerIdentifier='default'} = action;
//   switch (type) {    
//     case CART_ACTION_TYPES.INIT_CART_SUCCESS:
//       logger.info(fn, payload)
//       if (payload) {
//         return {
//           ...state, [offerIdentifier]: {
//             fetching: false,
//             cartId: payload.result
//           }
//         }
//       }
//       return state;
//     default:
//       return state;
//   }
// };

