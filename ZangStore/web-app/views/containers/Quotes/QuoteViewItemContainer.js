const ns = '[QuoteViewItemContainer]';
import logger from 'js-logger'
import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';


//constants
// import { PRODUCT_TAG_DEVICES, PRODUCT_TAG_ADDON_FEATURES, PRODUCT_TAG_DID_MAIN } from '../../../redux-state/features/salesmodels/constants';

//actions
// import { fetchTopLevelOffer, preloadOffer } from '../../../redux-state/features/offers/actions';
// import { addItemToCart } from '../../../redux-state/features/cart/actions';
// import { setSelectedOfferCartDataSelection } from '../../../redux-state/features/offers/actions';

//selectors
// import { getTopLevelOffer } from '../../../redux-state/features/offers/selectors';


//components
import { QuoteViewItem } from '../../components/Quotes';
import { linkGo } from '../../components/Link';
//containers
// import QuoteViewItemContainer from './QuoteViewItemContainer';

const mapStateToProps = (state, props) => {  
  let { cart, cartItemId } = props;  
  let { cartItems, offers, salesModels, salesModelItems, salesModelItemAttributes } = state.entities;
  let cartItem = cartItems[cartItemId] || {};
  let salesModel = salesModels[cartItem.salesModel];
  return {
    cartItem: {      
      ...cartItem,
      currency: salesModel.currency,
      offer: offers[cartItem.offer],
      salesModel: salesModel,
      salesModelItem: salesModelItems[cartItem.salesModelItem],
      attribute: salesModelItemAttributes[cartItem.attribute],
    }    
  }
};

const mapDispatchToProps = {  

};

class QuoteViewItemContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {
 
  }

  componentWillUpdate(nextProps) {

  }

  componentDidMount() {
    
  }

  componentWillUnmount() {}

  render() {
    let { cartItem, cart } = this.props;    
    if (!cartItem) {
      return null;
    }
    // logger.info(ns, 'cartItem', cartItem);
    return (
      <QuoteViewItem {...{
        cartItem,
        currency: cart.currency
      }}>          
      </QuoteViewItem>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(QuoteViewItemContainer);