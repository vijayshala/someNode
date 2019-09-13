const ns = '[status/actions]';
import logger from 'js-logger'
import { CALL_API } from '../../middleware/api';
import { ACTION_TYPES } from './constants';


export function fetchSubMenus(pathname) {
  let fn = `${ns}[fetchSubMenus]`
  return (dispatch, getState) => {
    const state = getState();
    logger.info(fn, 'begin', pathname);
    return dispatch({
      [CALL_API]: {
        endpoint: `webapp/submenus/${encodeURIComponent(pathname)}`,
        options: { method: 'GET',  },
        types: [
          ACTION_TYPES.FETCH_PAGE_SUBMENUS,
          ACTION_TYPES.FETCH_PAGE_SUBMENUS_SUCCESS,
          ACTION_TYPES.FETCH_PAGE_SUBMENUS_FAILURE
        ],
        meta: {
          pathname
        }        
      }
    })
  }  
}

export function initMainSubMenu(backLink = {}, menuItems=[]) {
  let fn = `${ns}[initMainSubMenu]`
  return (dispatch, getState) => {
    const state = getState();    
    return dispatch({
      type: ACTION_TYPES.INIT_MAIN_SUBMENU,
      payload: {
        backLink,
        menuItems
      }
    })
  }
}