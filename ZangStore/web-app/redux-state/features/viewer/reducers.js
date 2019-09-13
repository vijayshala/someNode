const ns = '[viewer/reducers]';
import logger from 'js-logger'

import { combineReducers } from 'redux';
import { ACTION_TYPES } from './constants';
import { Map } from 'immutable';

const user = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case ACTION_TYPES.FETCH_USER:
      return { ...state, fetching: true, errorMessage: '' };
    case ACTION_TYPES.FETCH_USER_SUCCESS:
      return {
        ...payload,
        fetching: false,
        errorMessage: ''
      };
    case ACTION_TYPES.FETCH_USER_FAILURE:
      return {
        ...state,
        fetching: false,
        errorMessage: action.error
      };
    default:
      return state;
  }
};


export default combineReducers({
  user,
});
