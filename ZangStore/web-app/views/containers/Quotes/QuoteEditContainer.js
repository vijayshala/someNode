const ns = '[QuoteEditContainer]';
import logger from 'js-logger'
import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';

//constants
import { PRODUCT_TAG_DEVICES, PRODUCT_TAG_ADDON_FEATURES, PRODUCT_TAG_DID_MAIN } from '../../../redux-state/features/salesmodels/constants';

//actions
import { fetchTopLevelOffer, selectOfferByIdentifier, fetchOffer, setSelectedOfferCartDataSelection, selectOffer } from '../../../redux-state/features/offers/actions';
import { setSalesModelAsActive } from '../../../redux-state/features/salesmodels/actions';
import { initCartInfoByOffer, addItemToCart, removeItemFromCart } from '../../../redux-state/features/cart/actions';
import { initMainSubMenu } from '../../../redux-state/features/ui/actions';


//selectors
import {  getOfferById,  getOfferDefaultSalesModel, getTopLevelOffer,  getOfferByIdentifier } from '../../../redux-state/features/offers/selectors';
import {  getCartInfo, getCurrentCartItemInfo, getCartPrimarySalesModelQty, getConflictingCartItemWithSameSalesModel  } from '../../../redux-state/features/cart/selectors';


//components
import { OfferConfigrator, OfferContentHeader } from '../../components/OfferShoppingWizard';
import { StepperContainer } from '../../components/Stepper';
import Loader from '../../components/Loader';
import ModalWindow from '../../components/ModalWindow';
import { linkGo } from '../../components/Link';
import QuoteComposeAccountInfo from '../../components/Quotes/QuoteComposeAccountInfo/QuoteComposeAccountInfo';
import QuoteComposeAgentInfo from '../../components/Quotes/QuoteComposeAgentInfo/QuoteComposeAgentInfo';

//containers
import QuoteConfigContainer from './QuoteConfigContainer';
import QuoteContactInfoContainer from './QuoteContactInfoContainer';
import QuoteCompanyInfoContainer from './QuoteCompanyInfoContainer';
import QuoteBillingInfoContainer from './QuoteBillingInfoContainer';

import { selectedOffer } from '../../../redux-state/features/status/reducers';

const DEFAULT_OFFER = 'uc'
const mapStateToProps = (state, props) => {  
  let { selectedOffer } = state.status  
  let {match} = props
  let identifier = props.identifier || match.params.offerIdentifier || DEFAULT_OFFER // $('#offer-identifier').val()
  return {}
};

const mapDispatchToProps = {

};

class QuoteEditContainer extends Component {
  constructor(props) {
    super(props);  
  }


  componentWillReceiveProps(nextProps) {
    
  }

  componentDidMount() {    
    
  }

  componentWillUnmount() {

  }

  render() {
    let { match } = this.props;
    let { offerIdentifier } = match.params;
    return (
      <div className="container2">
        {/* <QuoteAccountInfoContainer identifier="uc-solution"/>
        <QuoteAgentInfoContainer identifier="uc-solution"/> */}
        <QuoteConfigContainer identifier={offerIdentifier} />
      </div> 
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(QuoteEditContainer));