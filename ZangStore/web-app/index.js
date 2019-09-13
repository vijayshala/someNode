const ns = '[web-app]'
import React from 'react'
import ReactDOM from 'react-dom'
// import * as $ from "jquery";
import logger from 'js-logger'
import Root from './views/containers/Root';
import { configureStore } from './redux-state/store/configureStore';
import './common/exported-utils';
(function (window) {
  let fn = `${ns}[initUCShoppingWizard]`
  var environment = document.querySelector('meta[name="environment"]').getAttribute('content');
  
  logger.useDefaults();
  console.warn('logger:', environment);
  // logger.info(fn, 'begin');
  $(document).ready(() => {
    
    if ($('.offer-wizard-app')[0]) {
      const store = configureStore();
      ReactDOM.render(
        <Root store={store} />, $('.offer-wizard-app')[0]);
    }

    if (environment === 'production') {
      // Ray: commenting out this since the onetrust js has conflicts with jquery
      // loadJS('/public_nocache/javascripts/common/onetrust-cookie-1.0.js', yourCodeToBeCalled, document.body);
    }
    

  });


  var loadJS = function (url, implementationCode, location) {
    //url is URL of external file, implementationCode is the code
    //to be called from the file, location is the location to 
    //insert the <script> element

    var scriptTag = document.createElement('script');
    scriptTag.src = url;

    scriptTag.onload = implementationCode;
    scriptTag.onreadystatechange = implementationCode;

    location.appendChild(scriptTag);
  };
  var yourCodeToBeCalled = function () {
    
    //your code goes here
  }

  //  let promise = Promise.resolve(); promise.then(async () => { try {     let
  // defaults = await initUCShoppingWizard({       slug: 'ucoffer'     });
  // logger.info(fn, 'defaults:', defaults);   } catch (error) { logger.error(fn,
  // error)   } })
}(window))
