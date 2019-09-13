const ns = '[quotes/action]';
import logger from 'js-logger'
import { includes } from 'lodash';
import { CALL_API } from '../../middleware/api';
import { API_ROOT } from '../constants'
import {
  ACTION_TYPES
} from './constants';

import { normalizeQuotes } from '../quotes/schema';
import { getCartInfo } from '../cart/selectors';
import { convertCartToJson, sanitizeCartPayload } from '../cart/actions'


export function fetchPartnerQuotes(partnerId) {
  let fn = `${ns}[fetchPartnerQuotes]`
  return (dispatch, getState) => {
    const state = getState();
    logger.info(fn, 'begin');
    return dispatch({
      [CALL_API]: {
        endpoint: `partners/${partnerId}/quotes`,
        options: { method: 'GET' },
        types: [
          ACTION_TYPES.FETCH_PARTNER_QUOTES,
          ACTION_TYPES.FETCH_PARTNER_QUOTES_SUCCESS,
          ACTION_TYPES.FETCH_PARTNER_QUOTES_FAILURE
        ],
        normalizer: (response, state) => {
          return response
        },
        meta: {
          partnerId
        }
      }
    })
  }
}

export function fetchPartnerAgentQuotes({ partnerId, agentId, url }, nextUrl) {
  let fn = `${ns}[fetchPartnerAgentQuotes]`
  return (dispatch, getState) => {
    const state = getState();
    let sUrl = ''
    if (nextUrl) {
      sUrl = nextUrl
    } else {
      sUrl = url ? url.replace(API_ROOT, '')
        : partnerId && agentId
          ? `partners/${partnerId}/agents/${agentId}/quotes`
          : `partners/${partnerId}/quotes`
    }

    return dispatch({
      [CALL_API]: {
        endpoint: sUrl,
        options: { method: 'GET' },
        types: [
          ACTION_TYPES.FETCH_PARTNER_AGENT_QUOTES,
          ACTION_TYPES.FETCH_PARTNER_AGENT_QUOTES_SUCCESS,
          ACTION_TYPES.FETCH_PARTNER_AGENT_QUOTES_FAILURE
        ],
        normalizer: (response, state) => {
          return normalizeQuotes(response)
        },
        meta: {
          partnerId,
          agentId
        }
      }
    })
  }
}

export function fetchPartnerRegions(partnerId, regions) {
  let fn = `${ns}[fetchPartnerRegions]`
  return (dispatch, getState) => {
    const state = getState();
    logger.info(fn, 'begin');
    return dispatch({
      [CALL_API]: {
        endpoint: `partners/${partnerId}/regions`,
        options: { method: 'GET' },
        query: { regions: JSON.stringify(regions) },
        types: [
          ACTION_TYPES.FETCH_PARTNER_REGION,
          ACTION_TYPES.FETCH_PARTNER_REGION_SUCCESS,
          ACTION_TYPES.FETCH_PARTNER_REGION_FAILURE
        ],
        normalizer: (response, state) => {
          return response
        },
        meta: {
          partnerId
        }
      }
    })
  }
}