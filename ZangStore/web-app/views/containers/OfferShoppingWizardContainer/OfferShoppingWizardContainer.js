const ns = '[OfferShoppingWizardContainer]';
import logger from 'js-logger'
import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';

//constants
import { PRODUCT_TAG_DEVICES, PRODUCT_TAG_ADDON_FEATURES, PRODUCT_TAG_DID_MAIN } from '../../../redux-state/features/salesmodels/constants';

//actions
import { fetchTopLevelOffer, setSelectedOfferCartDataSelection } from '../../../redux-state/features/offers/actions';
import { fetchCart } from '../../../redux-state/features/cart/actions';
import { initMainSubMenu } from '../../../redux-state/features/ui/actions';

//selectors
import {  
  getTopLevelOffer,  getOfferByIdentifier
} from '../../../redux-state/features/offers/selectors';


//components
import { OffersGroup } from '../../components/OfferShoppingWizard';
import { StepperContainer } from '../../components/Stepper';
import TextResource from '../../components/TextResource';
import Loader from '../../components/Loader';
//containers
import OfferPanelContainer from './OfferPanelContainer';
import OfferContentContainer from './OfferContentContainer';

const DEFAULT_OFFER = 'uc'
const mapStateToProps = (state, props) => {  
  let { topLevelOffers } = state.status  
  let {match} = props
  let identifier = props.identifier || match.params.offerIdentifier || DEFAULT_OFFER // $('#offer-identifier').val()
  let topLevelOffer = getTopLevelOffer(state, {identifier});  
  logger.info(ns, 'identifier:', identifier, topLevelOffer)
  return {
    topLevelOffer,
    identifier,
    fetching: topLevelOffers[identifier] && topLevelOffers[identifier].fetching
  }
};

const mapDispatchToProps = {
  fetchTopLevelOffer, 
  fetchCart,
  initMainSubMenu,
  setSelectedOfferCartDataSelection
};

class OfferShoppingWizardContainer extends Component {
  constructor(props) {
    super(props);    
  }

  showContactCustomerCare() {
    let html = `<div class="contact-customer-service">
      <h1>${global.localizer.get('CONTACT_OUR_CUSTOMER_CARE')}</h1>
      <h3>${global.localizer.get('NEED_HELP_INFO')}</h3>
      <p><a href="mailto:cloudcare@avaya.com">cloudcare@avaya.com</a></p>
    </div>`;
    $('.top-container').append($(html));
  }
  componentWillReceiveProps(nextProps) {
    logger.info(ns, '[componentWillReceiveProps]', nextProps) 
  }

  componentWillUpdate(nextProps) {
    if (this.props.identifier != nextProps.identifier)
    {
      this.props.fetchTopLevelOffer(nextProps.identifier)
    }
  }

  async componentDidMount() {    
    if (!this.props.topLevelOffer || !this.props.topLevelOffer.loaded) {
      logger.info(ns, '[didMount] topLevelOffer no loaded', this.props.topLevelOffer);
      this.props.fetchTopLevelOffer(this.props.identifier)
    }

    this.props.initMainSubMenu();  
    this.showContactCustomerCare();
    // this.props.setSelectedOfferCartDataSelection('');
  }

  componentWillUnmount() {
    $('.contact-customer-service').remove();
   }
  

  render() {
    let { topLevelOffer = {}, fetching } = this.props;
    let { children = [] } = topLevelOffer;
    if (fetching) {
      return <Loader className="offer-panel-container loader-container"/>;
    }
    // let selectedCategory='clouduc-small'
    let offersComp = children.map((offerId, index) => {
      let colOrder = (index == 0) ? 'first' : (index == (children.length - 1)) ? 'last' : '';
      return <OfferPanelContainer key={`offer-panel-${index}`}  {...{ offerId, colOrder }}   />
    })

    return (
      <div className="shoping-wizard">
        {topLevelOffer.title ? <TextResource {...{ className: 'header1', ...topLevelOffer.title }} /> : null}
        {topLevelOffer.description ? <TextResource {...{ className: 'header2', ...topLevelOffer.description }} /> : null}
        <OffersGroup>
          {offersComp}
        </OffersGroup>             
        
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(OfferShoppingWizardContainer));