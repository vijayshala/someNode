const ns = '[quotes/reducers]';
import logger from 'js-logger'
import { ACTION_TYPES } from './constants';
import { updateState } from '../../utils'

export const countries = (state = {}, action) => {
  const { type, payload = {}, meta } = action;
  switch (type) {    
    case ACTION_TYPES.FETCH_COUNTRIES_SUCCESS:
      return updateState(state, payload.entities.countries);    
  }
  return state;
};

export const states = (state = {}, action) => {
  const { type, payload = {}, meta } = action;
  switch (type) {    
    case ACTION_TYPES.FETCH_COUNTRIES_SUCCESS:
      return updateState(state, payload.entities.states); 
    
    case ACTION_TYPES.FETCH_STATES_SUCCESS:
      return updateState(state, payload.entities.states);    
  }
  return state;
};