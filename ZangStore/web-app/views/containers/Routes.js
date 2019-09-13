import React from 'react';
import {Route, Switch, Redirect, IndexRedirect, HashRouter, Router} from 'react-router-dom';

import OfferShoppingWizardContainer, { OfferConfigWizardContainer, OfferRegionAutoDetectContainer } from './OfferShoppingWizardContainer';
import CartContainer from './Cart';
import App from './App';
import UserAreaContainer from './UserAreaContainer'
import Quotes, { QuoteEditContainer, QuoteViewContainer }  from './Quotes'

//basename={'shop'}
export default props => (  
  <Switch   >   
    <Route           
      path="/shop/configure/:offerTag"
      render={props => <App content={OfferRegionAutoDetectContainer} {...props} />} />
    
    <PrivateRoute           
      path="/quotes/new/:offerIdentifier"
      content={QuoteEditContainer} 
    />} /> 

   
    <PrivateRoute           
      path="/quotes/:quoteId/action/:action"
      content={QuoteViewContainer}      
      />} />

    <Route           
      path="/quotes/:quoteId"
      render={props => <App content={QuoteViewContainer} {...props} />} />


    <PrivateRoute           
      path="/quotes/"
      content={Quotes} 
      />} /> 
     

    <PrivateRoute           
      path="/partners/:partnerId/agents/:agentId/quotes/new/:offerIdentifier"
      content={QuoteEditContainer} 
      />} /> 

    <PrivateRoute           
      path="/partners/:partnerId/agents/:agentId/quotes/view/:quoteId"
      content={QuoteViewContainer} 
      />} /> 

    <PrivateRoute           
      path="/partners/:partnerId/agents/:agentId/quotes"
      content={Quotes} 
    />} />     
     
     
    <PrivateRoute           
      path="/:region/shop/configure/:offerIdentifier"
      content={OfferConfigWizardContainer}      
      />} />    

    <PrivateRoute           
      path="/:region/shop/cart"
      content={CartContainer}      
      />} />
{/*     
    <Route           
      path="/:region/shop/:offerIdentifier"
      render={props => <App content={OfferShoppingWizardContainer} {...props} />} /> */}
    
  </Switch>  
);


function PrivateRoute({ content, authed, ...rest }) {
  ///authed === true
        //? <UserAreaContainer><Component {...props} /></UserAreaContainer>
        //: <Component {...props} />
        //<Redirect to={{ pathname: '/login', state: { from: props.location } }} />
  return (
    <Route
      {...rest}
      render={
        (props) => <UserAreaContainer><App content={content} {...props} /></UserAreaContainer>        
      }/>
  )
}