const ns = '[OfferContentTotalContainer]';
import logger from 'js-logger'
import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';

//actions
import { createCart, initCartInfoByOffer } from '../../../redux-state/features/cart/actions';
import { createQuote } from '../../../redux-state/features/quotes/actions';
import { setSalesModelAsActive } from '../../../redux-state/features/salesmodels/actions';
// import { fetchShoppingWizardDefaults } from '../../../redux-state/features/offers/actions';

//selectors
import {  getSelectedOffer,  getOfferDefaultSalesModel, getOfferPlans } from '../../../redux-state/features/offers/selectors';
import { getCartInfo, getCartPrimarySalesModelQty, getCartOntimeSubtotalWithoutDiscount } from '../../../redux-state/features/cart/selectors';
import { getViewerRegion } from '../../../redux-state/features/viewer/selectors';

//containers
import OfferPromotionInfoContainer from './OfferPromotionInfoContainer'
//components
import { OfferTotal, SalesModelSelect, PaymentFrequencyOptions } from '../../components/OfferShoppingWizard';
import { linkGo } from '../../components/Link';

//utils
import { getBillingPeriodLabel } from '../../../redux-state/utils';

const mapStateToProps = (state, props) => { 
  let fn = `${ns}[mapStateToProps]`
  let { offer, salesModel } = props;
  let { cartByOffer, selectedOffer } = state.status;  
  let cart = (offer) ? getCartInfo(state, { offer }) : {};  

  let offerSalesModels = getOfferPlans(state, { offer })

  let offerIdentifier = offer.identifier
  let cartOffer = cartByOffer[offerIdentifier] || {};
  let primaryItemQuantity = getCartPrimarySalesModelQty(state, { offer }) 
  let subTotals = getCartOntimeSubtotalWithoutDiscount(state, { offer });
  let stepperOptions = offer && cartByOffer[offer.identifier] && cartByOffer[offer.identifier].stepperOptions;
  let { currentRegion = { } } = state.status.regions;
  logger.info(fn, { cart, offerIdentifier });
  return { 
    // cartId: cart._id,
    region: cart.region || getViewerRegion(),
    currency: salesModel.currency,
    creating: cartOffer.creating,
    error: cartOffer.error,
    onetime: cart.onetime, 
    subscriptions: cart.subscriptions || [],
    offerIdentifier,
    offerSalesModels,
    primaryItemQuantity,
    useCartData: selectedOffer.useCartData,
    subTotals,
    stepperOptions,
    currentRegion: currentRegion.data
  }
};

const mapDispatchToProps = {
  createCart, 
  createQuote,
  initCartInfoByOffer,
  setSalesModelAsActive
};

class OfferContentTotalContainer extends Component {
  constructor(props) {
    super(props);

  }

  componentWillReceiveProps(nextProps) {
    let fn = `${ns}[componentWillReceiveProps]`
    let { cartMode, useCartData, region, currentRegion, stepperOptions } = this.props;
    if (this.props.creating && !nextProps.creating && !nextProps.error) {
      if (useCartData == 'new-quote') {
        //redirection is done by the container
      }
      else if (useCartData == 'use-quote') {
        location.href =`/${region.toLowerCase()}/shop/cart/checkout`;
      }
      else {
        linkGo(`/${region.toLowerCase()}/shop/cart`);
      }      
      return;
    } 
    else {
      if (!nextProps.creating
        && !currentRegion
        && nextProps.currentRegion
        && useCartData == 'use-quote' && !stepperOptions.totalSteps
      ) {
        logger.warn(fn, 'this quote does not have any steps auto complete', { stepperOptions, useCartData });
        this.handleCheckout();
      }
    }
  }

  componentWillUpdate(nextProps) {
    // if (   this.props.match.params.productSlug ===
    // nextProps.match.params.productSlug &&   this.props.topic && !nextProps.topic
    // ) {   nextProps.history.replace(`/spaces/dashboard`); }
  }

  componentDidMount() {
    let fn = `${ns}[componentDidMount]`
    let { stepperOptions, useCartData, currentRegion } = this.props;
    if (useCartData == 'use-quote' && !stepperOptions.totalSteps && currentRegion) {
      logger.warn(fn, 'this quote does not have any steps auto complete', { stepperOptions, useCartData });
      this.handleCheckout();
    }
  }

  componentWillUnmount() { }
  
  handleCheckout() {
    let fn = `${ns}[handleCheckout]`
    let { cartMode, useCartData } = this.props;
    logger.info(fn, 'offerIdentifier', this.props.offerIdentifier);
    if (useCartData == 'new-quote') {
      //create / update quote
      this.props.createQuote(this.props.offerIdentifier);
    }
    else if (useCartData == 'use-quote') {
      this.props.createCart(this.props.offerIdentifier);
    }
    else {
      this.props.createCart(this.props.offerIdentifier);
    }    
  }

  render() {
    let fn = `${ns}[render]`
    let {
      currency,
      onetime,
      subscriptions,
      offer,
      salesModel,
      offerSalesModels,
      primaryItemQuantity,
      subTotals,
      cartMode,
      useCartData
    } = this.props;   

    let frequencyOptions = [
      {
        label: global.localizer.get('PAY_MONTHLY'),
        value: 'month',
        selected: true,
        onSelect: (value) => {
          // this.onDIDTypeSelected(value)
        }
      }
      // , {
      //   label: global.localizer.get('PAY_ANNUALLY'),
      //   subLabel: global.localizer.get('COMING_SOON'),
      //   disabled: true,
      //   value: 'year',
      //   selected: false,
      //   onSelect: (value) => {
      //     // this.onDIDTypeSelected(value)
      //   }
      // }
    ]
    let checkoutLabel = (useCartData == 'use-cart') ? 'UPDATE_CART' : 'ADD_TO_CART';    
    checkoutLabel = (cartMode == 'quote') ? 'SAVE_QUOTE' : checkoutLabel
    checkoutLabel = (useCartData == 'use-quote') ? 'PROCEED_TO_CHECKOUT' : checkoutLabel
    logger.info('useCartData:', useCartData, 'cartMode:', cartMode)

    return (
      <OfferTotal {...{
        promotions: <OfferPromotionInfoContainer {...{ offer, salesModel }} />,
        hideTotals: useCartData == 'use-quote',
        hidePlans: useCartData == 'use-quote',
        primaryItemQuantity,
        subTotals,
        onetime, subscriptions, currency,
        disableCheckout: this.props.disableCheckout,
        creating: this.props.creating,
        checkoutLabel,
        region: this.props.currentRegion,
        onCheckout: () => {
          this.handleCheckout();
        },
        onSalesModelChange: (selectedItem) => {
          logger.info(fn, 'selectedItem:', selectedItem);
          this.props.setSalesModelAsActive(offer, selectedItem.salesModel);
          this.props.initCartInfoByOffer({
            offerIdentifier:offer.identifier, 
            salesModel: selectedItem.salesModel,
            switchPrepopulatedItems: true,
            //forcePrepopulate: true,
            ignoreDefaultQty: true,
            reuseCartCustomerInfo: useCartData == 'new-quote',
          });
        },
        frequencyOptions,
        offerSalesModels,
        selectedSalesModel: salesModel.identifier
      }} />
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(OfferContentTotalContainer));