const ns = '[CartContainer]';
import logger from 'js-logger'
import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';

//constants
// import { PRODUCT_TAG_DEVICES, PRODUCT_TAG_ADDON_FEATURES, PRODUCT_TAG_DID_MAIN } from '../../../redux-state/features/salesmodels/constants';

//actions
import { preloadOffer } from '../../../redux-state/features/offers/actions';
import {  fetchCart, preloadCart, initCartBuble, removeItemFromCart, sendCartSummary } from '../../../redux-state/features/cart/actions';
import { initMainSubMenu } from '../../../redux-state/features/ui/actions';
//selectors
// import { getTopLevelOffer } from '../../../redux-state/features/offers/selectors';
import { getViewerRegion } from '../../../redux-state/features/viewer/selectors';

//components
import { CartBody } from '../../components/Cart';
import { linkGo } from '../../components/Link';
import ModalWindow from '../../components/ModalWindow';
import Loader from '../../components/Loader';

//containers
import CartItemContainer from './CartItemContainer';

const DEFAULT_CART = 'default'
const mapStateToProps = state => {  
  let { cartByOffer } = state.status    
  let { cart } = state.entities;

  return {
    region: getViewerRegion(),
    cart: cartByOffer[DEFAULT_CART]
      && cartByOffer[DEFAULT_CART].cartId
      && cart[cartByOffer[DEFAULT_CART].cartId],
    
    fetching: cartByOffer[DEFAULT_CART]
      && cartByOffer[DEFAULT_CART].fetching,
    
    loaded: cartByOffer[DEFAULT_CART]
      && cartByOffer[DEFAULT_CART].loaded,
    
    loading: cartByOffer.cartEmailSent
  }
};

const mapDispatchToProps = {  
  fetchCart,
  preloadOffer,
  preloadCart,
  initMainSubMenu,
  initCartBuble,
  removeItemFromCart,
  sendCartSummary
};

class CartContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      warnUserOnRemove: false,
      selectedCartItem: null
    }
  }

  componentWillReceiveProps(nextProps) {
    logger.info(ns, '[componentWillReceiveProps]', nextProps);
    this.props.initCartBuble();
  }

  componentWillUpdate(nextProps) {
    logger.info(ns, '[componentWillUpdate]', nextProps);
  }

  componentWillMount() {
    $('.top-container').addClass('white-bk');
    $('.submenus').addClass('white-bk');
    if (!this.props.cart || !this.props.loaded) {
      this.props.fetchCart();
    }   
    this.props.initMainSubMenu();    
    this.props.initCartBuble();
  }

  componentWillUnmount() {
    $('.submenus').removeClass('white-bk');
    $('.top-container').removeClass('white-bk');
  }

  render() {
    let { selectedCartItem } = this.state;
    let { cart = {}, fetching, region, loading  } = this.props;    
    if (!cart._id || fetching) {
      return <Loader className="offer-panel-container loader-container"/>;
    }
    // let selectedCategory='clouduc-small'
    let { onetime, subscriptions = [], currency='USD' } = cart;
    
    let cartItems = (cart.items || []).map((cartItemId, index) => {      
      return <CartItemContainer
        key={`cart-item-${cartItemId}`}
        {...{
          region, cart, cartItemId, onRemove: (cartItem) => {            
            this.setState({ warnUserOnRemove: true, selectedCartItem: cartItem });
        } }} />
    })

    let itemTitle = selectedCartItem && selectedCartItem.title ?
      selectedCartItem.title.resource ? global.localizer.get(selectedCartItem.title.resource)
        : selectedCartItem.title.text
      : '';  

    return (
      <CartBody {...{
        loading, cartItems, onetime, subscriptions, currency, disableCheckout: !cart.items.length, onCheckout: (e) => {
          location.href =(`/${region.toLowerCase()}/shop/cart/checkout`);
          //linkGo('/shop/cart/checkout');
        },
        onQuoteSummary: (e) =>  {
          this.props.sendCartSummary();
        }
      }}>        
      <ModalWindow {...{
            title:  global.localizer.get('REMOVE_ITEM_FROM_CART_WARNING').replace('{0}', itemTitle),
            //subTitle: this.state.modalwindowSubTitle,            
            show: this.state.warnUserOnRemove,
            okButton: {
              label: global.localizer.get('REMOVE'),
              onClick: () => {             
                let cartItem = this.state.selectedCartItem;
                logger.info(ns, 'onRemove', cartItem);
                this.props.removeItemFromCart(cartItem.offer.identifier, cartItem.salesModel, cartItem.salesModelItem, cartItem.attribute, 'default');
                this.setState({ warnUserOnRemove: false, selectedCartItem: null });               
              }
            },
            cancelButton: {
              label:  global.localizer.get('CANCEL'),
              onClick: () => {
                this.setState({ warnUserOnRemove: false, selectedCartItem: null });
              }
            }
          }} >            
          </ModalWindow>  
      </CartBody>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CartContainer));