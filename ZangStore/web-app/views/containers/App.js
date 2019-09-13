const ns = '[APP]';
import logger from 'js-logger'
import React from 'react';
import {connect} from 'react-redux';
import DevTools from '../../redux-state/utils/DevTools';

// import ModalManagerContainer from './Modals'; import introJSCss from
// '../../../src/views/assets/css/introjs.css';
//actions
import { preloadOffer } from '../../redux-state/features/offers/actions';
import { preloadCart } from '../../redux-state/features/cart/actions';
import { preloadUser } from '../../redux-state/features/viewer/actions';
import { preloadConfigs } from '../../redux-state/features/status/actions';
import { preloadCurrentRegion } from '../../redux-state/features/regions/actions';
// import { preloadCountries, preloadStates } from '../../redux-state/features/countries/actions';

//components
import Main from '../components/Main';

//containers
import MainSubMenuContainer from './MainSubMenuContainer'
const mapStateToProps = (state, props) => {  
  return {}
};
const mapDispatchToProps = {
  preloadOffer,
  preloadCart,
  preloadUser,
  // preloadCountries,
  // preloadStates,
  preloadConfigs,
  preloadCurrentRegion
};

class App extends React.Component {
  constructor(props) {
    super(props)
    this.preloadData();
  }

  preloadData() {
    let preloadedData = $('#preloadedData').val();
    preloadedData = preloadedData ? JSON.parse(preloadedData) : '';
    logger.info(ns, 'preploadedData', preloadedData)
    if (preloadedData) {
      //preload-data should be used only once...  !may change later
      $('#preloadedData').val('');
      if (preloadedData.offer) {
        this.props.preloadOffer(this.props.identifier, preloadedData.offer);
      }

      if (preloadedData.cart) {
        this.props.preloadCart(preloadedData.cart);
      }

      if (preloadedData.currentRegion) {
        this.props.preloadCurrentRegion({data: preloadedData.currentRegion});
      }

      if (preloadedData.user) {
        this.props.preloadUser(preloadedData.user);
      }      
      // if (preloadedData.countries) {
      //   this.props.preloadCountries(this.props.identifier, preloadedData.countries);
      // }
      // if (preloadedData.states) {
      //   this.props.preloadStates(this.props.identifier, preloadedData.states);
      // }
      if (preloadedData.configurations) {
        this.props.preloadConfigs(preloadedData.configurations);
      }

      $('.page-loader').hide();
      return;
    }
    else {
      $('.page-loader').hide();
    }
  }

  componentWillUnmount() {
    logger.warn(ns, 'componentWillUnmount....')
  }

  render() {
    const {
      content: Content,
      ...rest
    } = this.props;
    return (
      <Main>
        <MainSubMenuContainer />
        <Content {...rest}/>        
      </Main>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
// <ModalManagerContainer {...rest} /> {process.env.NODE_ENV !== 'production' &&
// }