const ns = '[quotes/reducers]';
import logger from 'js-logger'
import { ACTION_TYPES } from './constants';
import { ACTION_TYPES as PARTNERS_ACTION_TYPES } from '../partners/constants';
import { updateState } from '../../utils'

export const quotes = (state = {}, action) => {
  const { type, payload = {}, meta } = action;
  switch (type) {    
    case PARTNERS_ACTION_TYPES.FETCH_PARTNER_QUOTES_SUCCESS:
    case PARTNERS_ACTION_TYPES.FETCH_PARTNER_AGENT_QUOTES_SUCCESS:  
      let entities = payload.entities || {};     
      // logger.info(ns, entities);
      return updateState(state, payload.entities.quotes);    
  }
  return state;
};