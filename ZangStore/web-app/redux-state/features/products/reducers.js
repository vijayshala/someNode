const ns = '[salesmodel/reducers]';
import logger from 'js-logger'
import { omit } from 'lodash';
import { ACTION_TYPES } from './constants';
import { Map } from 'immutable';


export const products = (state = {}, action) => {
  const { type, payload, meta } = action;
  switch (type) {      
    default:
      if(payload && payload.entities && payload.entities.products) {
        return { ...state, ...payload.entities.products };
      }
      return state;
  }
};
