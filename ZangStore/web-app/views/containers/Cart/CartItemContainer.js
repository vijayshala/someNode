const ns = '[CartItemContainer]';
import logger from 'js-logger'
import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';


//constants
// import { PRODUCT_TAG_DEVICES, PRODUCT_TAG_ADDON_FEATURES, PRODUCT_TAG_DID_MAIN } from '../../../redux-state/features/salesmodels/constants';

//actions
// import { fetchTopLevelOffer, preloadOffer } from '../../../redux-state/features/offers/actions';
import { addItemToCart } from '../../../redux-state/features/cart/actions';
import { setSelectedOfferCartDataSelection } from '../../../redux-state/features/offers/actions';

//selectors
// import { getTopLevelOffer } from '../../../redux-state/features/offers/selectors';


//components
import { CartItem } from '../../components/Cart';
import { linkGo } from '../../components/Link';
//containers
// import CartItemContainer from './CartItemContainer';

const mapStateToProps = (state, props) => {  
  let { cart, cartItemId } = props;  
  let { cartItems, offers, salesModels, salesModelItems, salesModelItemAttributes } = state.entities;
  let cartItem = cartItems[cartItemId] || {};
  let salesModel = salesModels[cartItem.salesModel];
  return {
    cartItem: {      
      ...cartItem,
      currency: cart.currency,
      offer: offers[cartItem.offer],
      salesModel: salesModel,
      salesModelItem: salesModelItems[cartItem.salesModelItem],
      attribute: salesModelItemAttributes[cartItem.attribute],
    }    
  }
};

const mapDispatchToProps = {  
  setSelectedOfferCartDataSelection,
  addItemToCart
};

class CartItemContainer extends Component {
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
  editCartItem() {
    
  }

  updateQtyItemToCart(cartItem, quantity) {
    let fn = `${ns}[updateQtyItemToCart]`
    let {
      offer,
      salesModel,
      salesModelItem, 
      attrribute,
      selectedOptions
    } = cartItem;
    logger.info(fn, 'quantity', quantity, {
      offer,
      salesModel,
      salesModelItem,
      attrribute,
      selectedOptions
    });
    this.props.addItemToCart(
      {
        offerIdentifier: offer.identifier,
        quantity, salesModel,
        salesModelItem,
        attrribute,
        selectedOptions,
        cartOfferIdentifer: 'default'
      }
    );  
  }


  render() {
    let { cartItem, onRemove, region } = this.props;    
    if (!cartItem) {
      return null;
    }
    logger.info(ns, 'cartItem', cartItem);
    return (
      <CartItem {...{
        cartItem,
        currency: cartItem.currency,
        isRemoveable: cartItem.level==0,
        onRemove,
        onEdit: (e) => {
          e.preventDefault();
          if (cartItem.offer && cartItem.salesModel && !cartItem.salesModelItem && !cartItem.attribute) {
            this.props.setSelectedOfferCartDataSelection('use-cart');             
            linkGo(`/${region.toLowerCase()}/shop/configure/${cartItem.offer.identifier}`);             
          }          
        },
        onChange: (val) => {
          this.updateQtyItemToCart(cartItem, val.x);
        }
      }}>          
      </CartItem>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CartItemContainer);