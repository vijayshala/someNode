import React from 'react';
import {Route, Switch, Redirect, IndexRedirect, HashRouter, Router} from 'react-router-dom';

import OfferShoppingWizardContainer, { OfferConfigWizardContainer } from './OfferShoppingWizardContainer';

import CartContainer from './Cart';
import App from './App';
//basename={'shop'}
export default props => (
  <Switch  >
    <Route           
      path="/shop/configure/:offerIdentifier"
      render={props => <App content={OfferConfigWizardContainer} {...props} />} />
    
    <Route           
      path="/shop/cart"
      render={props => <App content={CartContainer} {...props} />} />
       
  </Switch>
);



function PrivateRoute ({component: Component, authed, ...rest}) {
  return (
    <Route
      {...rest}
      render={(props) => authed === true
        ? <Component {...props} />
        : <Redirect to={{pathname: '/login', state: {from: props.location}}} />}
    />
  )
}