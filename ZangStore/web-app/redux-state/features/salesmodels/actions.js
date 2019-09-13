const ns = '[offers/actions]';
import { includes } from 'lodash';
import { normalize } from 'normalizr';

import { CALL_API } from '../../middleware/api';
import {
  ACTION_TYPES
} from './constants';
import Schemas, {normalizeSalesmodel} from './schema';

export function fetchSalesModelByIdentifier(identifier) {
  return {
    [CALL_API]: {
      endpoint: `salesmodels/${identifier}/`,
      options: { method: 'GET' },
      types: [
        ACTION_TYPES.FETCH_SALESMODEL,
        ACTION_TYPES.FETCH_SALESMODEL_SUCCESS,
        ACTION_TYPES.FETCH_SALESMODEL_FAILURE
      ],
      normalizer: normalizeSalesmodel,
      meta: {
        loaded: true,
        identifier: identifier
      }
    }
  };
}

export function setSalesModelAsActive(offer, salesModel) {
  let fn = `${ns}[setSalesModelAsActive]`
  return (dispatch, getState) => {
    const state = getState();
    let { salesModels, salesModelItems } = state.entities
    
    
    return dispatch(
      false//!salesModel.items || salesModel.items && !salesModel.items.length
        ? {
          [CALL_API]: {
            endpoint: `salesmodels/${salesModel.identifier}/`,
            options: { method: 'GET' },
            types: [
              ACTION_TYPES.FETCH_SALESMODEL,
              ACTION_TYPES.FETCH_SALESMODEL_SUCCESS,
              ACTION_TYPES.FETCH_SALESMODEL_FAILURE
            ],
            normalizer: normalizeSalesmodel,
            meta: {
              identifier: salesModel.identifier
            }
          }
        }
        : {
          type: ACTION_TYPES.SET_DEFAULT_SALESMODEL,
          payload: { offer, salesModel }
        });
  }
}
