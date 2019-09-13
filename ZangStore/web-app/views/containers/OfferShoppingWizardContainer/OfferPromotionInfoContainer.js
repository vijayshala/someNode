const ns = '[OfferPromotionInfoContainer]';
import logger from 'js-logger'
import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import { formatCurrency } from '../../../common/currencyFormatter'

//constants
import { PRODUCT_TAG_USER_TYPES, PRODUCT_TAG_ADDON_BY_USER_TYPES, PRODUCT_TAG_DISCOUNT } from '../../../redux-state/features/salesmodels/constants';

//actions
import {  addItemToCart } from '../../../redux-state/features/cart/actions';

//selectors
import {  getSelectedOffer,  getOfferDefaultSalesModel } from '../../../redux-state/features/offers/selectors';
import { getCartInfo, getCartItemInfo, getSalesModelItemsPriceFromCart } from '../../../redux-state/features/cart/selectors';
import {  getSalesModelItemsByTag, getPrimarySalesItem } from '../../../redux-state/features/salesmodels/selectors';

//containers

//components
import { OfferPromotionInfo } from '../../components/OfferShoppingWizard';

const mapStateToProps = (state, props) => { 
  let fn = `${ns}[mapStateToProps]`
  let { offer, salesModel, tagName } = props;  

  let userTypesCartSubItems = getSalesModelItemsPriceFromCart(state, {  
    currency: salesModel.currency,  
    offer,
    salesModel,
    tagName: tagName || PRODUCT_TAG_USER_TYPES,    
  });

  let discountSalesModelItems = getSalesModelItemsByTag(state, {    
    salesModelId: salesModel._id,
    tagName: tagName || PRODUCT_TAG_DISCOUNT
  });

  return {        
    currency: salesModel.currency,
    userTypesCartSubItems,
    discountSalesModelItems    
  }
};

const mapDispatchToProps = {
  addItemToCart,  
};

class OfferPromotionInfoContainer extends Component {
  constructor(props) {
    super(props); 
  }

  componentWillReceiveProps(nextProps) {

  }

  componentWillUpdate(nextProps) {

  }

  async componentDidMount() {
   
  }

  componentWillUnmount() {}

  render() {    
    let { 
      currency,
      offer, 
      salesModel, 
      userTypesCartSubItems,
      discountSalesModelItems  
    } = this.props;
    if (!offer || !salesModel || !discountSalesModelItems || !discountSalesModelItems.length) {
      return null;
    }   
      
    let discounts = discountSalesModelItems.map(item => {
      return {
        label: global.localizer.get('PROMOTION_DETAIL_INFO')
          .replace('{0}', userTypesCartSubItems.totalQty)
          .replace('{1}', formatCurrency(Math.abs(userTypesCartSubItems.totalQty * item.price), { code: currency })),
        price: Math.abs(item.price),
        quantity: userTypesCartSubItems.totalQty,
      }
    })

    return (
      <OfferPromotionInfo {...{ discounts }} />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OfferPromotionInfoContainer);