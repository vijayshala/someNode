const ns = '[offers/reducers]';
import logger from 'js-logger'
import { omit } from 'lodash';
import { ACTION_TYPES } from './constants';
import { ACTION_TYPES as SALESMODELS_ACTION_TYPES } from '../salesmodels/constants';
import { ACTION_TYPES as CART_ACTION_TYPES } from '../cart/constants';
import { ACTION_TYPES as QUOTES_ACTION_TYPES} from '../quotes/constants';
import { Map } from 'immutable';

import CartRulesMiddleware from '../cart/cartRulesMiddleware'
import { updateState } from '../../utils'

export default (state = {}, action) => {
  const { type, payload = {}, meta } = action;
  switch (type) {    
    case SALESMODELS_ACTION_TYPES.SET_DEFAULT_SALESMODEL: 
      let { offer, salesModel } = payload;
      let salesModels = state[offer._id].salesModels.map(slModel => {
        return { ...slModel, isDefault: slModel.salesModel == salesModel._id }
      });
      // logger.info(ns, '=============', {offer, salesModels, salesModel})
      return {
        ...state,
        [offer._id]:{...state[offer._id], salesModels: [...salesModels]}
      }
      break;  
    case ACTION_TYPES.UPDATE_OFFER_SUCCESS:    
      return {
        ...state,
        [payload.result]: payload.entities.offers[payload.result]
      };   
    
    case CART_ACTION_TYPES.FETCH_CART_SUCCESS:
      return updateState(state, payload.entities.offers);
      break;

    case ACTION_TYPES.FETCH_OFFER_SUCCESS:
    case ACTION_TYPES.FETCH_TOPLEVEL_OFFER_SUCCESS:
    case QUOTES_ACTION_TYPES.FETCH_QUOTE_SUCCESS:  
      let entities = payload.entities || {};      
      CartRulesMiddleware.addOfferEntities(entities.offers, entities.salesModels)  
      for (var id in payload.entities.offers) {
        payload.entities.offers[id].loaded = payload.entities.offers[id].title && action.loaded || false;
      }
      return updateState(state, payload.entities.offers);
    
  }
  return state;
};
