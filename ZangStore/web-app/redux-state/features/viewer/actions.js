const ns = '[viewer/actions]';
import logger from 'js-logger'
import { CALL_API } from '../../middleware/api';
import { ACTION_TYPES } from './constants';


export const fetchViewer = () => ({
  [CALL_API]: {
    endpoint: 'users/me',
    authenticated: true,
    options: { method: 'GET' },
    types: [
      ACTION_TYPES.FETCH_USER,
      ACTION_TYPES.FETCH_USER_SUCCESS,
      ACTION_TYPES.FETCH_USER_FAILURE
    ]
  }
});

export function preloadUser(cart) {
  return {
    type: ACTION_TYPES.FETCH_USER_SUCCESS,
    payload: { data: cart },
    loaded: true,
  }
}


export function gotoLogin(nextUrl) {
  let fn = `${ns}[gotoLogin]`
  return (dispatch, getState) => {
    const state = getState();
    let { configurations } = state.status;    
    nextUrl = nextUrl || location.href;
    let loginUrl = configurations.urls.identityProviderURL + "/account/login?next={0}" + configurations.urls.identityProviderLoginView
    let redirectUrl = loginUrl.replace('{0}', escape(nextUrl));
    logger.log('redirectUrl url', redirectUrl);
    location.href = redirectUrl;
    dispatch({
      type: 'redirecting_to_login',
      redirectUrl
    })
  }
}

export const signin = () => (dispatch, getState) => {  
  return Promise.all([dispatch(fetchViewer())]);
};