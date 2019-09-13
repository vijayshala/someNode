const ns = 'StepUsersDeviceSelectionContainer';
import logger from 'js-logger'
import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import { formatCurrency } from '../../../common/currencyFormatter'

// new localization container
import Localizer from '../Localizer/Localizer';

//constants
import { PRODUCT_TAG_USER_TYPES, PRODUCT_TAG_DEVICES } from '../../../redux-state/features/salesmodels/constants';

//actions
import {  addItemToCart } from '../../../redux-state/features/cart/actions';

//selectors
import {  getSelectedOffer,  getOfferDefaultSalesModel } from '../../../redux-state/features/offers/selectors';
import { getCartInfo, getCartItemInfo, getCartSubItemsByTag, getSalesModelItemsPriceFromCart } from '../../../redux-state/features/cart/selectors';
import {  getPrimarySalesItem } from '../../../redux-state/features/salesmodels/selectors';

//containers
import UserDevicesSelectionContainer from './UserDevicesSelectionContainer';
import SalesModelItemsContainer from './SalesModelItemsContainer'
// import UserTypesContainer from './UserTypesContainer';

//components
import { Step } from '../../components/Stepper';

//utils
import { getBillingPeriodLabel } from '../../../redux-state/utils';
import { UserTypeDevicesSelection } from '../../components/OfferShoppingWizard';

const DEFAULT_OFFER = 'uc'
const mapStateToProps = (state, props) => { 
  let fn = `${ns}[mapStateToProps]`
  let { offer, salesModel, tagName } = props;  
  // let cart = (offer) ? getCartInfo(state, { offer }) : {};
  logger.warn(fn, props);
  let userTypesCartSubItems = getSalesModelItemsPriceFromCart(state, {
    currency: salesModel.currency,  
    offer,
    salesModel,
    tagName: tagName || PRODUCT_TAG_USER_TYPES,
    attributesTagName: PRODUCT_TAG_DEVICES,
    totalCalculationMode: 'include-attributes-only',
  });

  logger.info(fn, { offer, salesModel, userTypesCartSubItems });
  return {    
    currency: salesModel.currency,
    userTypesCartSubItems
  }
};

const mapDispatchToProps = {
  addItemToCart,  
};

class StepUsersDeviceSelectionContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {      
      isStepViewedOnce: false
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.openState == true) {
      this.setState({ isStepViewedOnce: true });
    }
  }

  componentWillUpdate(nextProps) {
    // if (   this.props.match.params.productSlug ===
    // nextProps.match.params.productSlug &&   this.props.topic && !nextProps.topic
    // ) {   nextProps.history.replace(`/spaces/dashboard`); }
  }

  componentDidMount() {
    if (this.props.openState == true) {
      this.setState({ isStepViewedOnce: true });
    } 
  }

  componentWillUnmount() { }
  
  render() {
    let { isStepViewedOnce } = this.state;
    let {
      offer,
      salesModel,
      userTypesCartSubItems,
      stepNumber,
      openState = false,
      completed = false,
      hideNext,
      currency,
    } = this.props;
    if (!offer || !salesModel) {
      return null;
    }
    let reccuringSubTotal = (userTypesCartSubItems.reccuringSubTotal || 0);//cartItem.quantity * cartItem.price + 
    let params = {
      title: global.localizer.get('SELECT_YOUR_DEVICES'),
      hideTitle: false,
      open: openState,
      completed,
      hideNext,
      disableNext:!userTypesCartSubItems.totalQty,
      onNext: () => {
        this.props.onNext(stepNumber + 1);       
      },
      onSelect: () => {
        if (isStepViewedOnce) {
          this.props.onSelect(stepNumber);
        }
      },
      stepNumber,
      content: <SalesModelItemsContainer {...{
        className: 'user-devices-sellable-items three-columns',
        hideUnused: true,
        offer,
        salesModel,
        SLMItemContainer: UserDevicesSelectionContainer,
        attributesTagName: PRODUCT_TAG_DEVICES,
        ...userTypesCartSubItems,
      }} ></SalesModelItemsContainer>,
      col1: {
        // line1: global.localizer.get('DEVICES_COUNT').replace('{qty}', userTypesCartSubItems.numOfAttributesSelected)
        line1: <Localizer number={userTypesCartSubItems.numOfAttributesSelected} 
                          msg={'DEVICES_COUNT_NEW'} />
      },
      col2: {
        line1: '+ ' + formatCurrency(userTypesCartSubItems.oneTimeTotal, { code: currency }),
        line2: global.localizer.get('ONE_TIME'),      
      },
      col3: {
        line1: '',
        line2: ''
      },
      onClick: (step) => {
      
      }
    }
   
    return (
      <Step {...params} />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StepUsersDeviceSelectionContainer);
