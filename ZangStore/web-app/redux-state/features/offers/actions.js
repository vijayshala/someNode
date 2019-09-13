const ns = '[offers/actions]';
import logger from 'js-logger'
import { includes } from 'lodash';
import { normalize } from 'normalizr';

import { CALL_API } from '../../middleware/api';
import { ACTION_TYPES } from './constants';
import { fetchCurrentRegionInfo } from '../regions/actions';
import Schemas, { normalizeOffer } from './schema';

import {  getOfferByIdentifier } from './selectors';

export const setSelectedOfferCartDataSelection = (useCartData) => {
  return {
    type: ACTION_TYPES.SET_USER_CART_DATA_SELECTION,
    useCartData
  }
}

export function fetchOffers(query) {
  let fn = `${ns}[fetchOffers]`
  return (dispatch, getState) => {
    const types = [
      ACTION_TYPES.FETCH_OFFERS,
      ACTION_TYPES.FETCH_OFFERS_SUCCESS,
      ACTION_TYPES.FETCH_OFFERS_ERROR
    ];//(query && getfetchOffersTypes(query.producttype)) || 

    return dispatch({
      [CALL_API]: {
        endpoint: 'products',
        options: { method: 'GET' },
        query: query,
        types: types,
        normalizer: (response, state) => {
          // let data = response.data || {}
          return normalize(response, Schemas.PRODUCT_ARRAY)
        }
      }
    });
  }
}

export function preloadOffer(identifier, data) {
  return {
    type: ACTION_TYPES.FETCH_TOPLEVEL_OFFER_SUCCESS,
    payload: normalizeOffer({ data }),
    // identifier,
    loaded: true
  }
}

export function fetchOffer(id, options = {}) {
  let fn = `${ns}[fetchOffer]`
  return (dispatch, getState) => {
    var query = '';
    query += options.populate ? 'populate=' + options.populate : '';
    logger.info(ns, 'fetchOffer', query)
    return dispatch({
      [CALL_API]: {
        endpoint: `offers/${id}?${query}`,
        options: { method: 'GET' },
        types: [
          ACTION_TYPES.FETCH_OFFER,
          ACTION_TYPES.FETCH_OFFER_SUCCESS,
          ACTION_TYPES.FETCH_OFFER_FAILURE
        ],
        normalizer: function (response, state) {
          // dispatch(fetchCurrentRegionInfo({ region: response.data.allowed_regions[0] }));
          return normalizeOffer(response, state);
        },
        meta: {
          loaded: options.loaded || false
        }
      }
    });
  }
}

export function fetchOfferBySlug(slug) {
  return {
    [CALL_API]: {
      endpoint: `offers/${slug}/`,
      options: { method: 'GET' },
      types: [
        ACTION_TYPES.FETCH_OFFER,
        ACTION_TYPES.FETCH_OFFER_SUCCESS,
        ACTION_TYPES.FETCH_OFFER_FAILURE
      ],
      normalizer: normalizeOffer,
      meta: {
        slug: slug
      }
    }
  };
}

export function fetchTopLevelOffer(identifier) {
  let fn = `${ns}[fetchTopLevelOffer]`
  return (dispatch, getState) => {
    const state = getState();    
    let offer = getOfferByIdentifier(state, { identifier })
    logger.info(fn, 'identifier:', identifier, 'offer', offer);
    if (offer && offer.title) {
      return dispatch({
        type: ACTION_TYPES.FETCH_TOPLEVEL_OFFER_SUCCESS,
        identifier: identifier,
        payload: { result: offer._id }
      });
    }

    return dispatch({
      [CALL_API]: {
        endpoint: `offers/${identifier}/?populate=children`,
        options: { method: 'GET' },
        types: [
          ACTION_TYPES.FETCH_TOPLEVEL_OFFER,
          ACTION_TYPES.FETCH_TOPLEVEL_OFFER_SUCCESS,
          ACTION_TYPES.FETCH_TOPLEVEL_OFFER_FAILURE
        ],
        normalizer: normalizeOffer,
        meta: {
          identifier: identifier
        }
      }
    })
  }
}  

export function fetchShoppingWizardDefaults(slug) {
  return {
    [CALL_API]: {
      endpoint: `offers/${slug}/wizarddefaults/`,
      options: { method: 'GET' },
      types: [
        ACTION_TYPES.FETCH_OFFERS_WIZARD_DEFAULTS,
        ACTION_TYPES.FETCH_OFFERS_WIZARD_DEFAULTS_SUCCESS,
        ACTION_TYPES.FETCH_OFFERS_WIZARD_DEFAULTS_FAILURE
      ],
      meta: {
        slug: slug
      }
    }
  };
}

export function fetchOffersByCategory(category) {
  return {
    [CALL_API]: {
      endpoint: `offers/category/${category}`,
      options: { method: 'GET' },
      types: [
        ACTION_TYPES.FETCH_OFFERS_BY_CATEGORY,
        ACTION_TYPES.FETCH_OFFERS_BY_CATEGORY_SUCCESS,
        ACTION_TYPES.FETCH_OFFERS_BY_CATEGORY_ERROR
      ],
      schema: Schemas.OFFER_ARRAY,
      meta: {
        category: category
      }
    }
  };
}



export function createOffer(
  product = { id: null, title: '', desription: '', type: PRODUCT_TYPES.GROUP },
  invitees = [],
  startSateTime,
  endDateTime,
  informChannel
) {
  return {
    [CALL_API]: {
      endpoint: 'products',
      options: {
        method: 'POST',
        body: JSON.stringify({ product: { ...product, id: null }, invitees })
      },
      types: [
        ACTION_TYPES.CREATE_OFFER,
        ACTION_TYPES.CREATE_OFFER_SUCCESS,
        ACTION_TYPES.CREATE_OFFER_FAILURE
      ],
      schema: Schemas.CREATE_OFFER
    }
  };
}


export function updateOffer(productId, data = {}) {
  return {
    [CALL_API]: {
      endpoint: `products/${productId}`,
      options: { method: 'POST', body: JSON.stringify(data) },
      types: [
        ACTION_TYPES.UPDATE_OFFER,
        ACTION_TYPES.UPDATE_OFFER_SUCCESS,
        ACTION_TYPES.UPDATE_OFFER_ERROR
      ],
      schema: Schemas.OFFER
    }
  };
}

export function selectOffer(offer) {
  return {
    type: ACTION_TYPES.SELECT_OFFER,
    payload: { offer }
  }
}

export function selectOfferByIdentifier(identifier) {
  let fn = `${ns}[fetchCart]`
  return (dispatch, getState) => {
    const state = getState();
    let offer = getOfferByIdentifier(state, { identifier });
    // logger.warn(fn, 'offer', offer);
    // if (offer.allowed_regions && offer.allowed_regions.length) {
    //   dispatch(fetchCurrentRegionInfo({ region: offer.allowed_regions[0] }));
    // }    
    return dispatch({
      type: ACTION_TYPES.SELECT_OFFER,
      payload: { offer }
    })
  }  
}
