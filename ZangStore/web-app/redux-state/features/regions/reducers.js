const ns = '[quotes/reducers]';
import logger from 'js-logger'
import { ACTION_TYPES } from './constants';
import { updateState } from '../../utils'

export const countries = (state = {}, action) => {
  const { type, payload = {}, meta } = action;
  switch (type) {    
    case ACTION_TYPES.FETCH_REGIONS_SUCCESS:
      let entities = payload.entities || {};     
      // logger.info(ns, entities);
      return updateState(state, payload.entities.countries);    
  }
  return state;
};
