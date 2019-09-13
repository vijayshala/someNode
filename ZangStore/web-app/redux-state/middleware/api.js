const ns = '[middleware/api]';
import logger from 'js-logger'
import { normalize } from 'normalizr';
import {FetchRest} from './fetchRest';
import { API_ROOT } from '../features/constants'


export const CALL_API = 'CALL_API';

const fetchRest = new FetchRest();

const callApi = (state, endpoint, normalizer, options, query) => {
  const fullUrl = endpoint.indexOf(API_ROOT) === -1 ? API_ROOT + endpoint : endpoint;
  logger.info(ns, 'fullUrl', fullUrl, 'endpoint:', endpoint);
  return fetchRest.fetch(fullUrl, options, query).then(response => {
    const res = normalizer ? normalizer(response, state) : response;    
    return res;
  })  
};

export default store => next => action => {
  const callAPI = action[CALL_API];
  if (typeof callAPI === 'undefined') {
    return next(action);
  }

  let { endpoint } = callAPI;
  const { normalizer, types, options, query, meta } = callAPI;

  const [requestType, successType, errorType] = types;
  let state = store.getState();
  if (typeof endpoint === 'function') {
    endpoint = endpoint(state);
  }

  if (typeof endpoint !== 'string') {
    throw new Error('Specify a string endpoint URL.');
  }
  if (!Array.isArray(types) || types.length !== 3) {
    throw new Error('Expected an array of three action types.');
  }
  if (!types.every(type => typeof type === 'string')) {
    throw new Error('Expected action types to be strings.');
  }

  const actionWith = data => {
    const finalAction = Object.assign({}, action, data);
    delete finalAction[CALL_API];
    return finalAction;
  };

  next(actionWith({ type: requestType, ...meta, payload: {} }));

  return callApi(state, endpoint, normalizer, options, query).then(
    response =>
      next(
        actionWith({
          ...meta,
          payload: response,
          type: successType
        })
      ),
    error => {
      logger.error(ns, error, {
        ...meta,
        type: errorType,
        error: error || 'UNKNOWN_ERROR'
      })
      next(
        actionWith({
          ...meta,
          type: errorType,
          error: error || 'UNKNOWN_ERROR'
        })
      )
    }
  );
};
