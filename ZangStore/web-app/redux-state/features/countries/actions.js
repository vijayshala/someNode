const ns = '[offers/actions]';
import { schema, normalize } from 'normalizr';
import { CALL_API } from '../../middleware/api';
import { ACTION_TYPES } from './constants';
import { COUNTRY, STATE } from './schema'

export function preloadCountries(identifier, data) {
  return {
    type: ACTION_TYPES.FETCH_COUNTRIES_SUCCESS,
    payload: normalize(data, [COUNTRY]),    
    loaded: true
  }
}

export function preloadStates(identifier, data) {
  return {
    type: ACTION_TYPES.FETCH_STATES_SUCCESS,
    payload: normalize(data, [STATE]),
    loaded: true
  }
}


export function fetchCountryInfo(code) {
  let fn = `${ns}[fetchCountryInfo]`;  
  return {
    [CALL_API]: {
      endpoint: `regions/countries/code/${encodeURIComponent(code)}`,
      types: [
        ACTION_TYPES.FETCH_COUNTRIES,
        ACTION_TYPES.FETCH_COUNTRIES_SUCCESS,
        ACTION_TYPES.FETCH_COUNTRIES_ERROR
      ],
      options: { method: 'GET' },
      normalizer: (response, state)=> {
        return normalize([response.data], [COUNTRY]);
      },
      meta: {
        code
      }
    }
  };
}
