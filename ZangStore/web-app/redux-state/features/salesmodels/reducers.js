const ns = '[salesmodel/reducers]';
import logger from 'js-logger'
import { omit } from 'lodash';
import { ACTION_TYPES } from './constants';
import { ACTION_TYPES as OFFER_ACTION_TYPES } from '../offers/constants';
import { ACTION_TYPES as CART_ACTION_TYPES } from '../cart/constants';
import { ACTION_TYPES as QUOTES_ACTION_TYPES} from '../quotes/constants';
import { Map } from 'immutable';

import { updateState } from '../../utils'
import CartRulesMiddleware from '../cart/cartRulesMiddleware'

export const salesModelItemAttributes = (state = {}, action) => {
  const { type, payload, meta } = action;
  switch (type) {      
    case CART_ACTION_TYPES.FETCH_CART_SUCCESS:
    case QUOTES_ACTION_TYPES.FETCH_QUOTE_SUCCESS:    
      return updateState(state, payload.entities.salesModelItemAttributes);
      break;
    
    case OFFER_ACTION_TYPES.FETCH_OFFER_SUCCESS:
    case OFFER_ACTION_TYPES.FETCH_TOPLEVEL_OFFER_SUCCESS:
    case ACTION_TYPES.FETCH_SALESMODEL_SUCCESS:  
      if(payload && payload.entities && payload.entities.salesModelItemAttributes) {
        return { ...state, ...payload.entities.salesModelItemAttributes };
      }
  }
  return state;
}


export const salesModelItems = (state = {}, action) => {
  const { type, payload, meta} = action;
  switch (type) {      
    case CART_ACTION_TYPES.FETCH_CART_SUCCESS:
    case QUOTES_ACTION_TYPES.FETCH_QUOTE_SUCCESS:    
      return updateState(state, payload.entities.salesModelItems);
      break;

    case OFFER_ACTION_TYPES.FETCH_OFFER_SUCCESS:
    case OFFER_ACTION_TYPES.FETCH_TOPLEVEL_OFFER_SUCCESS:
    case ACTION_TYPES.FETCH_SALESMODEL_SUCCESS:  
      if(payload && payload.entities && payload.entities.salesModelItems) {
        return { ...state, ...payload.entities.salesModelItems };
      }
  }
  return state;
}


export const salesModels = (state = {}, action) => {
  const { type, payload, meta, loaded=false } = action;
  switch (type) {      
    case QUOTES_ACTION_TYPES.FETCH_QUOTE_SUCCESS:
    case CART_ACTION_TYPES.FETCH_CART_SUCCESS:
      return updateState(state, payload.entities.salesModels);
      break;
    
    case OFFER_ACTION_TYPES.FETCH_OFFER_SUCCESS:
      return mergeSalesModels(state, payload, loaded); 
    
    case OFFER_ACTION_TYPES.FETCH_TOPLEVEL_OFFER_SUCCESS:
      return mergeSalesModels(state, payload, loaded);
    
    case ACTION_TYPES.FETCH_SALESMODEL_SUCCESS:
      return mergeSalesModels(state, payload, loaded);
      break;
  }
  return state;
};

function mergeSalesModels(state, payload, loaded) {
  if(payload && payload.entities && payload.entities.salesModels) {
    CartRulesMiddleware.addSalesModelEntities(payload.entities.salesModels, payload.entities.salesModelItems, payload.entities.salesModelItemAttributes)    
    for (var id in payload.entities.salesModels) {
      payload.entities.salesModels[id].loaded = payload.entities.salesModels[id].title && loaded || false;
    }
    return updateState(state, payload.entities.salesModels);
  }
  return state;
}



