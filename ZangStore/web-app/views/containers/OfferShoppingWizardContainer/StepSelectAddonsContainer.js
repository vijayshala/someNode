const ns = '[StepSelectAddonsContainer]';
import logger from 'js-logger'
import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { formatCurrency } from '../../../common/currencyFormatter'

//constants
import {  PRODUCT_TAG_ADDON_FEATURES } from '../../../redux-state/features/salesmodels/constants';

//actions
import {  addItemToCart } from '../../../redux-state/features/cart/actions';

//selectors
import {  getSelectedOffer,  getOfferDefaultSalesModel } from '../../../redux-state/features/offers/selectors';
import { getCartInfo, getCartItemInfo, getCartSubItemsByTag } from '../../../redux-state/features/cart/selectors';
import { getPrimarySalesItem, getPrimarySalesItemAttributesByTag } from '../../../redux-state/features/salesmodels/selectors';

//containers

//components
import { SellableAttributes } from '../../components/OfferShoppingWizard';
import Price from '../../components/Price';
import { Step } from '../../components/Stepper';

//utils
import { getBillingPeriodLabel } from '../../../redux-state/utils';

const mapStateToProps = (state, props) => { 
  let fn = `${ns}[mapStateToProps]`
  let { offer, salesModel } = props;  
  let { cartByOffer, selectedOffer } = state.status;
  let { salesModelItemAttributes } = state.entities;  
  let salesModelItem = getPrimarySalesItem(state, { salesModelId: salesModel._id })
  let cartPrimaryItem = (offer && salesModel && salesModelItem) ? getCartItemInfo(state, { offer, salesModel, salesModelItem }) : null;  
  let {
    attributes,
    oneTimeTotal,
    reccuringSubTotal,
    numOfAddonsSelected,
    selectedAddonName
  } = getCartSubItemsByTag(state, {
    offer,
    salesModel,
    salesModelItem,
    tagName: props.tagName || PRODUCT_TAG_ADDON_FEATURES
  });

  return {
    salesModelItem,
    attributes,
    oneTimeTotal,
    reccuringSubTotal,
    numOfAddonsSelected,
    selectedAddonName,
    primaryQuantity: cartPrimaryItem && cartPrimaryItem.quantity || 1,
  }

};

const mapDispatchToProps = {
  addItemToCart,  
};

class StepSelectAddonsContainer extends Component {
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

  async componentDidMount() {
   
  }

  componentWillUnmount() {}
  handleChange(val) {
    logger.info('==============', val);
    // this.setState({users:val.x});
    this.updateQtyItemToCart(val.x)
  }

  updateQtyItemToCart(quantity, attrribute) {
    let fn = `${ns}[updateQtyItemToCart]`
    let { 
      offer, 
      salesModel,
      salesModelItem,
      cartItem
    } = this.props;
    logger.info(fn, 'quantity', quantity, 'attrribute:', attrribute);    
    this.props.addItemToCart({
      offerIdentifier: offer.identifier,
      quantity,
      salesModel,
      salesModelItem,
      attrribute
    });
  }
  
  render() {
    let { isStepViewedOnce } = this.state
    let { 
      currency,
      offer, 
      salesModel,
      salesModelItem,
      attributes,
      numOfAddonsSelected,
      selectedAddonName,
      reccuringSubTotal,
      oneTimeTotal,
      primaryQuantity,
      stepNumber,
      hideNext,
      title,
      hideTitle,
      openState = false,
      completed = false,
      subscription
    } = this.props;
    if (!offer || !salesModel || !salesModelItem) {
      return null;
    }   
    
    let addons = attributes.map(attr => {
      return {
        ...attr,        
        onChange: (quantity) => {
          // logger.info(ns, 'attribute', attribute, 'quantity:', quantity );
          this.updateQtyItemToCart(quantity?primaryQuantity:0, attr.addon)
        }
      }
    }); 

    if (!addons.length) {
      return null;
    }
    
    let params = {
      title: title || global.localizer.get('ADD_ON_ADDITIONAL_FEATURES'), 
      hideTitle: hideTitle,
      open: openState,
      completed,
      stepNumber,
      hideNext,
      content: <SellableAttributes {...{
                addons
              }} />,
      col1: {
        line1: global.localizer.get(numOfAddonsSelected > 1 ? 'ADDONS_COUNT' : 'ADDON_COUNT').replace('{qty}', numOfAddonsSelected),
        line2: numOfAddonsSelected > 1
          ? global.localizer.get('MULTIPLE_TYPES')
          : selectedAddonName
      },
      col2: {
        line1: '+ ' + formatCurrency(oneTimeTotal, { code: currency }),        
        line2: global.localizer.get('ONE_TIME'),        
      },
      col3: {
        line1: '+ ' + formatCurrency(reccuringSubTotal, { code: currency }),
        line2: subscription ? getBillingPeriodLabel(subscription.billingPeriod) : ''
      },
      onNext: ()=>{
        this.props.onNext(stepNumber+1);
      },
      onBack: () => {
        this.props.onNext(stepNumber - 1);
      },
      onSelect: () => {
        if (isStepViewedOnce) {
          this.props.onSelect(stepNumber);
        }  
      },
    }
   
    return (
      <Step {...params } />
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(StepSelectAddonsContainer));