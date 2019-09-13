const ns = '[status/reducers]';
import logger from 'js-logger'
import { combineReducers } from 'redux';
import { ACTION_TYPES } from './constants';


const mainSubMenu = (state = { backLink: {}, menuItems: [], html: {}, fetching: false}, action) => {
  const { type, payload, pathname='' } = action;
  switch (type) {
    case ACTION_TYPES.FETCH_PAGE_SUBMENUS:      
      return {
        ...state,
        fetching: true
      } 
    case ACTION_TYPES.FETCH_PAGE_SUBMENUS_SUCCESS:
      return {
        ...state,
        fetching: false,
        html: { ...state.html, [pathname.toString()]: { content: payload.html, loaded:true } }
      }
    case ACTION_TYPES.INIT_MAIN_SUBMENU:
      let backLink = payload.backLink || state.backLink;
      let menuItems = payload.menuItems || state.menuItems;
      return {
        ...state,
        backLink: { ...backLink },
        menuItems: [...menuItems],
      }      
  }
  return state;
}

const initialModalState = {
  type: null,
  props: {}
};
const modal = (state = initialModalState, action) => {
  switch (action.type) {
    case ActionTypes.SHOW_MODAL:
      return state.merge({
        type: action.payload.type,
        props: action.payload.props
      });
    case ActionTypes.HIDE_MODAL:
      return initialModalState;
    default:
      return state;
  }
};

export default combineReducers({
  mainSubMenu
});
