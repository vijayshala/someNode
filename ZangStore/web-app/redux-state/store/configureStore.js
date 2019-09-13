import {createStore, applyMiddleware, compose, combineReducers} from 'redux';
import thunk from 'redux-thunk';
import {createLogger} from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension';

import {routerReducer, routerMiddleware, push} from 'react-router-redux';
import { browserHistory } from 'react-router'
import {createBrowserHistory} from 'history';///createBrowserHistory';

import api from '../middleware/api';

import * as reducers from '../features/reducers';
// console.log('=========reducers', reducers)
import * as DevTools from '../utils/DevTools';

export const history = createBrowserHistory({ basename: '/' });
export function configureStore(preloadedState) {
  // console.log('====================preloadedState', preloadedState);
  const rootReducer = combineReducers({    
    ...reducers,
    routing: routerReducer
  });
  const middleware = routerMiddleware(history);
  let composeEnhancers = compose;
  if (process.env.NODE_ENV !== 'production') {
    composeEnhancers = composeWithDevTools({shouldHotReload: false});
    // const composeWithDevToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({shouldHotReload:false});
    // if (typeof composeWithDevToolsExtension === 'function') {
    //   composeEnhancers = composeWithDevToolsExtension;
    // }
  }
  const store = createStore(rootReducer, preloadedState, composeEnhancers(applyMiddleware(
  // middleware,
  thunk,
  // pushNotifications,
  api, process.env.NODE_ENV !== 'production' && createLogger())
  // process.env.NODE_ENV !== 'production' && DevTools.instrument()
  ));
  return store;
}
