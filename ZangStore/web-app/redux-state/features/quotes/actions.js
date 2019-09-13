const ns = '[quotes/action]';
import logger from 'js-logger'
import { includes } from 'lodash';
import { CALL_API } from '../../middleware/api';
import {
  ACTION_TYPES
} from './constants';
import { validateCart } from '../cart/validateCart'
import { normalizeCart } from '../cart/schema';
import { getCartInfo } from '../cart/selectors';
import { convertCartToJson, sanitizeCartPayload } from '../cart/actions'

export function fetchQuote(quoteId) {
  let fn = `${ns}[fetchQuote]`
  return (dispatch, getState) => {
    const state = getState();
    logger.info(fn, 'begin');
    return dispatch({
      [CALL_API]: {
        endpoint: `quotes/${quoteId}` ,
        options: { method: 'GET' },
        types: [
          ACTION_TYPES.FETCH_QUOTE,
          ACTION_TYPES.FETCH_QUOTE_SUCCESS,
          ACTION_TYPES.FETCH_QUOTE_FAILURE
        ],
        meta: {
          offerIdentifier:'quote'
        },
        normalizer: (response) => {
          let { offers } = state.entities;        
          logger.info(fn, 'normalizer: response', response); 
          let normalCart = normalizeCart(response, state);
          logger.info(fn, 'normalCart', normalCart); 
          return normalCart;
        }
      }
    })
  }  
}

export function createQuote(offerIdentifier) {
  let fn = `${ns}[createQuote]`;   
  return (dispatch, getState) => {    
    const state = getState();    
    let { currentRegion = { } } = state.status.regions;
    let cartStatus = state.status.cartByOffer[offerIdentifier] || { }
    let cart = getCartInfo(state, { offer: { identifier: offerIdentifier } });
    let warnings = validateCart(cart, cartStatus.shippingSameAsBilling, currentRegion);
    if (warnings && warnings.length) {
      return dispatch({
        type: ACTION_TYPES.CREATE_QUOTE_FAILURE,
        offerIdentifier,
        payload: { warnings }
      })
    }

    let updatedCart = sanitizeCartPayload(convertCartToJson({state, cart, offerIdentifier}))
    logger.info(fn, 'updatedCart:', updatedCart);
    return dispatch({
      [CALL_API]: {
        endpoint: 'quotes/',
        options: {
          method: 'POST',
          body: JSON.stringify(updatedCart)
        },
        types: [
          ACTION_TYPES.CREATE_QUOTE,
          ACTION_TYPES.CREATE_QUOTE_SUCCESS,
          ACTION_TYPES.CREATE_QUOTE_FAILURE
        ],
        meta: {
          offerIdentifier
        },
        normalizer: (response) => {
          let normalCart = normalizeCart(response, state);
          logger.info(fn, 'normalCart', normalCart); 
          return {
            warnings: response.warnings || [],
            ...normalCart
          };
        }
      }
    });
  }
}