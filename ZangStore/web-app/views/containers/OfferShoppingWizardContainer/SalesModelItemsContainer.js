const ns = '[SalesModelItemsContainer]';
import logger from 'js-logger'
import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';

//constants
import { PRODUCT_TAG_SYSTEM_ADDON } from '../../../redux-state/features/salesmodels/constants';

//actions
import {  addItemToCart } from '../../../redux-state/features/cart/actions';

//selectors
import {  getSelectedOffer,  getOfferDefaultSalesModel } from '../../../redux-state/features/offers/selectors';
import { getCartInfo, getCartItemInfo, getCartSubItemsByTag } from '../../../redux-state/features/cart/selectors';
import { getPrimarySalesItem, getPrimarySalesItemAttributesByTag } from '../../../redux-state/features/salesmodels/selectors';

//containers
import SalesModelItemContainer from './SalesModelItemContainer';


//components
import { SellableSalesModelItems } from '../../components/OfferShoppingWizard';

//utils
import { getBillingPeriodLabel } from '../../../redux-state/utils';

const mapStateToProps = (state, props) => { 
  let fn = `${ns}[mapStateToProps]`
  let { offer, salesModel, salesModelItem} = props; 
  return {}
};

const mapDispatchToProps = {
  addItemToCart,  
};

class SalesModelItemsContainer extends Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    let {
      className = '',
      currency,
      offer,
      salesModel,      
      salesModelItems,
      hideUnused,
      SLMItemContainer,
      attributesTagName,
      forcePrepopulate
    } = this.props;

    if (!offer || !salesModel || !salesModelItems ||
      salesModelItems && !salesModelItems.length) {
      return null;
    }

    className = className || salesModelItems.length >= 3 ? 'three-columns' : 'two-columns';
    // logger.info(ns, 'salesModelItems', salesModelItems, '----');

    let sellableItems = salesModelItems
    .filter(slmItem=> (hideUnused && slmItem.quantity>0) || !hideUnused)  
      .map((slmItem, index) => {
      let key = `sales-model-item-container-${index}`
      return (
        <SLMItemContainer {...{
          key,
          offer,
          salesModel,
          forcePrepopulate,
          tagName: attributesTagName,
          ...slmItem
        }} />
      )
    })
    
    return salesModelItems.length ? (
      <SellableSalesModelItems className={className}>{sellableItems}</SellableSalesModelItems>
    ) : null;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SalesModelItemsContainer);