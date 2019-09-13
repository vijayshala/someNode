const ns = '[offers/actions]';
import { schema, normalize } from 'normalizr';
import { ACTION_TYPES } from './constants';
import { COUNTRY, STATE } from './schema'
import { CALL_API } from '../../middleware/api';
import logger from 'js-logger'

import { getViewerRegion } from '../viewer/selectors';

import { fetchCountryInfo } from '../countries/actions';
export function preloadCurrentRegion(data) {
  let fn = `${ns}[preloadCurrentRegion]`;
  
  return {
    type: ACTION_TYPES.FETCH_CURRENT_REGIONS_SUCCESS,
    payload: data,    
    loaded: true
  }
}


export function fetchAllRegionInfo(partnerId) {
  let fn = `${ns}[fetchAllRegionInfo]`;

  return (dispatch, getState) => {
    logger.info(fn, 'begin');
    return dispatch({
      [CALL_API]: {
        endpoint: `regions/partners/${partnerId}` ,
        options: { method: 'GET' },
        types: [
          ACTION_TYPES.FETCH_ALL_REGIONS,
          ACTION_TYPES.FETCH_ALL_REGIONS_SUCCESS,
          ACTION_TYPES.FETCH_ALL_REGIONS_ERROR
        ],
        normalizer: (response, state) => {
          return response
        },
        meta: {}
      }
    })
  }

}


export function fetchCurrentRegionInfo(options) {
  let fn = `${ns}[fetchCurrentRegionInfo]`;
  return (dispatch, getState) => {
    //(query && getfetchOffersTypes(query.producttype)) || 
    let region = options.region || getViewerRegion();
    logger.info(fn, 'region:', region)
    return dispatch({
      [CALL_API]: {
        endpoint: `regions/code/${encodeURIComponent(region)}`,
        types: [
          ACTION_TYPES.FETCH_CURRENT_REGIONS,
          ACTION_TYPES.FETCH_CURRENT_REGIONS_SUCCESS,
          ACTION_TYPES.FETCH_CURRENT_REGIONS_ERROR
        ],
        options: { method: 'GET' },
        normalizer: (response) => {
          dispatch(fetchCountryInfo(response.data.countryISO));
          return response;
        },
        meta: {
          region
        }
        // query: query,
        // types: types,      
        // normalizer: (response, state) => {

        // }
      }
    });
  }
}