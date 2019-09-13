import React from 'react';
import PropTypes from 'prop-types';
import {Provider} from 'react-redux';
import {BrowserRouter} from 'react-router-dom';
import { ConnectedRouter } from 'react-router-redux';
import { history } from '../../redux-state/store/configureStore'; 
import AuthProvider from './AuthProvider';
// import IntlWrap from './IntlWrap';

const Root = ({store}) => (
  <Provider store={store}>    
    <ConnectedRouter history={history}>      
      <AuthProvider />
    </ConnectedRouter>    
  </Provider>
);

Root.propTypes = {
  store: PropTypes.object.isRequired
};

export default Root;
