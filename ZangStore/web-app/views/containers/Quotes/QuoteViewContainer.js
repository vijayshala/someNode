const ns = '[QuoteViewContainer]';
import logger from 'js-logger'
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

//constants
import { QUOTE_CART } from '../../../redux-state/features/cart/constants';
import { QUOTE_DAYS_TO_EXPIRATION } from '../../../redux-state/features/quotes/constants';

//actions
import { initCartInfoByOffer, removeItemFromCart, initCartWithQuote, resetCartInfo } from '../../../redux-state/features/cart/actions';
import { gotoLogin } from '../../../redux-state/features/viewer/actions'
import { fetchQuote } from '../../../redux-state/features/quotes/actions';
import { fetchOffer, setSelectedOfferCartDataSelection } from '../../../redux-state/features/offers/actions';
//selectors
import { getTopLevelCartItem, getConflictingCartItemWithSameSalesModel } from '../../../redux-state/features/cart/selectors';
import { getViewerRegion } from '../../../redux-state/features/viewer/selectors';


//components
import { QuoteViewBody, QuoteError } from '../../components/Quotes';
import { linkGo } from '../../components/Link';
import Loader from '../../components/Loader';
import ModalWindow from '../../components/ModalWindow';

//containers
import QuoteViewItemContainer from './QuoteViewItemContainer';
import QuoteConfigContainer from './QuoteConfigContainer';
import { OfferConfigWizardContainer } from '../OfferShoppingWizardContainer';

import { addDays } from '../../../redux-state/utils'

const mapStateToProps = (state, props) => {
  let { cartByOffer } = state.status
  let { user } = state.viewer
  let { cart } = state.entities;
  let cartMainItem = getTopLevelCartItem(state, { identifier: QUOTE_CART });
  let conflictingCartItem = cartMainItem && getConflictingCartItemWithSameSalesModel(state, {
    offer: cartMainItem.offer,
    salesModel: cartMainItem.salesModel
  });
  return {
    region: getViewerRegion(),
    user: user.data || null,
    cartMainItem,
    conflictingCartItem,
    cart: cartByOffer[QUOTE_CART]
      && cartByOffer[QUOTE_CART].cartId
      && cart[cartByOffer[QUOTE_CART].cartId],
    error: cartByOffer[QUOTE_CART]
      && cartByOffer[QUOTE_CART].error,
    fetching: cartByOffer[QUOTE_CART]
      && cartByOffer[QUOTE_CART].fetching,
    loaded: cartByOffer[QUOTE_CART]
      && cartByOffer[QUOTE_CART].loaded,
  }
};

const mapDispatchToProps = {
  fetchQuote,
  fetchOffer,
  initCartInfoByOffer,
  resetCartInfo,
  initCartWithQuote,
  removeItemFromCart,
  setSelectedOfferCartDataSelection,
  gotoLogin
};

class QuoteViewContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      configuratorReady: false,
      warnUserOnRemove: false,
      selectedCartItem: null
    }
  }

  componentWillReceiveProps(nextProps) {
    let { match } = this.props;
    logger.info(ns, '[componentWillReceiveProps]', nextProps);
    let isPartnerView = match.params.partnerId || match.params.agentId;
    if (!isPartnerView) {
      if (!this.props.cartMainItem && nextProps.cartMainItem) {
        logger.info(ns, 'load offer data');
        // this.props.fetchOffer(nextProps.cartMainItem.offer.identifier, { loaded: true, populate: 'salesmodel' });
      }
      if (nextProps.cartMainItem
        && nextProps.cartMainItem.offer
        // && !this.props.cartMainItem.salesModel.loaded
        // && nextProps.cartMainItem.salesModel.loaded
        && match.params && match.params.action == 'configurequote') {
        this.setState({ configuratorReady: true });
        logger.info(ns, '-----------------configure quote');
        //TODO: need to set cart and redirect configurator
      }
    }
  }

  componentWillUpdate(nextProps) {

  }

  componentWillMount() {
    let { match } = this.props
    let isPartnerView = match.params.partnerId || match.params.agentId;
    if (!this.props.cart || !this.props.loaded) {
      this.props.fetchQuote(this.props.match.params.quoteId);
    }

    if (match.params && match.params.action == 'configurequote') {
      this.props.setSelectedOfferCartDataSelection('use-quote');
    }

    if (!isPartnerView) {
      $('.top-container').addClass('white-bk');
      $('.submenus').addClass('white-bk');
    }

  }


  componentWillUnmount() {
    this.props.resetCartInfo({ offerIdentifier: QUOTE_CART });
    $('.submenus').removeClass('white-bk');
    $('.top-container').removeClass('white-bk');
  }

  render() {
    let { selectedCartItem, configuratorReady } = this.state;
    let { cart = {}, fetching, error, match, cartMainItem, user } = this.props;
    if (error && ((error.status == 404) || (error.status == 500))) {
      return <QuoteError message={global.localizer.get('QUOTE_NOT_FOUND')} />
    }

    // return empty div if _id is undefined
    if (!cart._id || fetching) {
      return <div></div>;
    }
    let isPartnerView = match.params.partnerId || match.params.agentId;

    //expiration should be done 30 days after
    if (!isPartnerView && cart.expireOn && addDays(new Date(cart.expireOn), QUOTE_DAYS_TO_EXPIRATION) < Date.now()) {
      return <QuoteError message={global.localizer.get('QUOTE_HAS_BEEN_EXPIRED')} />
    }


    let backLink = null;
    if (isPartnerView) {
      let backLinkUrl = `/partners/${match.params.partnerId}/agents/${match.params.agentId}/quotes`;
      backLink = { url: backLinkUrl, isExternal: false, label: global.localizer.get('BACK_TO_QUOTES') }
    }

    // let selectedCategory='clouduc-small'
    //QuoteConfigContainer  OfferConfigWizardContainer
    let { onetime, subscriptions = [], currency = 'USD' } = cart;
    if (match.params && match.params.action == 'configurequote') {
      if (cartMainItem
        && cartMainItem.offer
        && configuratorReady) {
        return <OfferConfigWizardContainer identifier={cartMainItem.offer.identifier} />
      }
      else {
        return <h1>ERROR</h1>;
      }
    }

    let cartItems = (cart.items || []).map((cartItemId, index) => {
      return <QuoteViewItemContainer
        key={`cart-item-${cartItemId}`}
        {...{
          cart, cartItemId, onRemove: (cartItem) => {
            this.setState({ warnUserOnRemove: true, selectedCartItem: cartItem });
          }
        }} />
    })

    let itemTitle = selectedCartItem && selectedCartItem.title ?
      selectedCartItem.title.resource ? global.localizer.get(selectedCartItem.title.resource)
        : selectedCartItem.title.text
      : '';

    return (
      <div>
        {
          ((!cart._id) && (!fetching)) ?
            (<QuoteError message={global.localizer.get('QUOTE_NOT_FOUND')} />) :

            <QuoteViewBody {...{
              cart,
              backLink,
              hideConfigureBtn: isPartnerView,
              cartItems, onetime, subscriptions, currency, disableCheckout: !cart.items.length,
              onConfigure: (e) => {
                logger.info(ns, 'cartMainItem:', cartMainItem)
                if (cartMainItem) {
                  //if no user then we need to set cookie
                  //rediret to login with quote view.
                  if (!user) {
                    let nextUrl = location.href;
                    nextUrl += !match.params.action ? '/action/configurequote' : '';
                    this.props.gotoLogin(nextUrl);
                    return;
                  }
                  //this.props.initCartWithQuote();
                  if (cartMainItem.offer && cartMainItem.salesModel && !cartMainItem.salesModelItem && !cartMainItem.attribute) {
                    /* this.props.removeItemFromCart(cartMainItem.offer.identifier, cartMainItem.salesModel, null, null, 'default'); */
                    {/* this.props.setSelectedOfferCartDataSelection('use-quote'); */ }
                    linkGo(`/quotes/${cart._id}/action/configurequote/`);
                    ///${cart.region.toLowerCase()}
                    {/* linkGo('/shop/configure/' + cartMainItem.offer.identifier); */ }
                  }
                }
              }
            }} />
        }
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(QuoteViewContainer));