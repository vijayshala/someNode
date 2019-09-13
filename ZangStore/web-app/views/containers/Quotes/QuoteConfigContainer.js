const ns = '[QuoteConfigContainer]';
import logger from 'js-logger'
import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';

//constants
import { PRODUCT_TAG_DEVICES, PRODUCT_TAG_ADDON_FEATURES, PRODUCT_TAG_DID_MAIN } from '../../../redux-state/features/salesmodels/constants';

//actions
import { fetchTopLevelOffer, selectOfferByIdentifier, fetchOffer, setSelectedOfferCartDataSelection, selectOffer } from '../../../redux-state/features/offers/actions';
import { setSalesModelAsActive } from '../../../redux-state/features/salesmodels/actions';
import {
  initCartInfoByOffer,
  initCartWithQuote,
  addItemToCart,
  removeItemFromCart,
  updatePartnerInfo,
  resetCartInfo,
} from '../../../redux-state/features/cart/actions';
import { initMainSubMenu } from '../../../redux-state/features/ui/actions';
import { fetchCurrentRegionInfo, preloadCurrentRegion } from '../../../redux-state/features/regions/actions';

//selectors
import {  getOfferById,  getOfferDefaultSalesModel, getTopLevelOffer,  getOfferByIdentifier } from '../../../redux-state/features/offers/selectors';
import {  getCartInfo, getCurrentCartItemInfo, getCartPrimarySalesModelQty, getConflictingCartItemWithSameSalesModel  } from '../../../redux-state/features/cart/selectors';
import { getViewerRegion } from '../../../redux-state/features/viewer/selectors';


//components
import { OfferConfigrator, OfferContentHeader } from '../../components/OfferShoppingWizard';
import { StepperContainer } from '../../components/Stepper';
import Loader from '../../components/Loader';
import ModalWindow from '../../components/ModalWindow';
import { linkGo } from '../../components/Link';

//containers
import OfferPanelContainer from '../OfferShoppingWizardContainer/OfferPanelContainer';
import OfferContentContainer from '../OfferShoppingWizardContainer/OfferContentContainer';
import QuoteContentContainer from './QuoteContentContainer'
import { selectedOffer } from '../../../redux-state/features/status/reducers';
import { QUOTE_CART } from '../../../redux-state/features/cart/constants';

const DEFAULT_OFFER = 'uc'
const mapStateToProps = (state, props) => {  
  let { selectedOffer, cartByOffer } = state.status;
  const { currentRegion = { } } = state.status.regions;
  let {match} = props
  let identifier = props.identifier // $('#offer-identifier').val()
  let offer = getOfferByIdentifier(state, { identifier });  
  let parentOffer = offer && offer.parent ? getOfferByIdentifier(state, { identifier: offer.parent.identifier }) || (offer && offer.parent) : null;
  let salesModel = offer ? getOfferDefaultSalesModel(state, { offerId: offer._id }) : null;
  let cart = (offer) ? getCartInfo(state, { offer }) : {};  
  let cartItem = getCurrentCartItemInfo(state, { offer, salesModel });
  let cartOffer = cartByOffer[identifier] || {};

  let subscription = cart && cart.subscriptions && cart.subscriptions.length && cart.subscriptions[0] || null
  logger.info(ns, 'identifier:', identifier, offer);

  return {
    currentRegion:currentRegion.data,
      // (currentRegion && currentRegion.data && offer && offer.allowed_regions
      // && offer.allowed_regions.indexOf(currentRegion.data.shortCode)>-1) ? currentRegion.data : null,
    region: getViewerRegion(),
    quoteId: cart._id,
    creating: cartOffer.creating,
    error: cartOffer.error,
    warnings: cartOffer.warnings,
    offer,
    parentOffer,
    salesModel,
    identifier,    
    fetching: selectedOffer.fetching,    
    currency: salesModel && salesModel.currency,
    // onetime: cart.onetime, 
    subscription,
    useCartData: selectedOffer.useCartData,
    cartItem,
    conflictingCartItem:null,
  }
};

const mapDispatchToProps = {
  fetchOffer, 
  selectOfferByIdentifier,
  selectOffer,
  initCartInfoByOffer,
  initCartWithQuote,
  resetCartInfo,
  initMainSubMenu,
  setSelectedOfferCartDataSelection,
  removeItemFromCart,
  setSalesModelAsActive,
  updatePartnerInfo,
  fetchCurrentRegionInfo,
  preloadCurrentRegion
};

class QuoteConfigContainer extends Component {
  constructor(props) {
    super(props);  
    this.state = {
      warnUser: false,
      ...this.initModalWindowLabels()
    };
  }

  initModalWindowLabels(cartItem = {}) {
    let solutionTitle = cartItem.title ?
      cartItem.title.resource ?
        global.localizer.get(cartItem.title.resource) :
        cartItem.title.text :
      ''
    return {
      modalwindowTitle: global.localizer.get('EXISTING_CONFIG_WARNING').replace('{0}', solutionTitle),
      modalwindowSubTitle: global.localizer.get('DO_YOU_WANT_TO_DISCARD_CURRENT_CONFIG'),
      modalwindowOkLabel: global.localizer.get('EDIT_MY_CONFIGURATION'),
      modalwindowCancelLabel: global.localizer.get('DISCARD')
    }
  }

  initMainSubMenu(parentOffer) {
    let fn = `${ns}[initMainSubMenu]`
    let { region } = this.props;
    logger.info(fn, 'parentOffer:', parentOffer);
    return;
    // && parentOffer.loaded
    if (parentOffer && parentOffer.identifier) {
      this.props.initMainSubMenu({
        url: `/${region}/shop/${parentOffer.identifier}`,
        label: parentOffer.title
          ? parentOffer.title.resource
            ? global.localizer.get(parentOffer.title.resource)
            : parentOffer.title.text
          : global.localizer.get('BACK') || 'back'
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    let fn = `${ns}[componentWillReceiveProps]`
    let { match, quoteId, useCartData, currentRegion: newCurrentRegion } = nextProps;
    let { currentRegion } = this.props;
    logger.info(fn, this.props, nextProps);
    if (this.props.creating && !nextProps.creating
      && !nextProps.error
      && (!nextProps.warnings || !nextProps.warnings.length)
      && quoteId) {
      if (useCartData == 'new-quote') {
        linkGo(`/partners/${match.params.partnerId}/agents/${match.params.agentId}/quotes/view/${quoteId}`);
      }     
    }
    let { conflictingCartItem } = nextProps;
    
    let selectOffer = false;
    if (this.props.offer && nextProps.offer && nextProps.offer
      && this.props.offer._id != nextProps.offer._id) {
      if (!nextProps.offer.loaded) {
        this.props.fetchOffer(nextProps.identifier, { loaded: true, populate: 'salesmodel' });
      }  
      else {
        selectOffer = true;
      }
    }

    if (
      !this.props.offer && nextProps.offer && nextProps.offer.loaded
      || !this.props.identifier && nextProps.offer
      || this.props.offer && !this.props.offer.loaded && nextProps.offer.loaded
    ) {   
      //offer is loaded
      if (nextProps.offer.loaded && !currentRegion) {
        //load currentRegion;
        this.props.fetchCurrentRegionInfo({
          region: nextProps.offer.allowed_regions[0]
        });
      }
      else {
        selectOffer = true;
      }      
    }
    else {
      if (this.props.offer && this.props.offer.loaded && !currentRegion && newCurrentRegion) {
        selectOffer = true;
      }
    }
    
    if (selectOffer) {
      this.props.selectOfferByIdentifier(nextProps.identifier);
      logger.info(fn, 'load offer', nextProps.salesModel);
      if (nextProps.salesModel && nextProps.salesModel.loaded) {
        if (nextProps.useCartData == 'use-quote') {
          this.props.initCartWithQuote();
        }
        else {
          this.initCartInfoByOffer(nextProps.offer, nextProps.salesModel, nextProps.parentOffer);
        }
      } 
    }


    if (this.props.salesModel && !this.props.salesModel.items
      && nextProps.salesModel && nextProps.salesModel.items) {
      // this.props.initCartInfoByOffer(nextProps.offer, nextProps.salesModel);
    }
  }


  initCartInfoByOffer(offer, salesModel, parentOffer) {
    this.props.setSelectedOfferCartDataSelection('new-quote');
    this.props.initCartInfoByOffer(
      {
        offerIdentifier: offer.identifier,
        salesModel: salesModel,
        forcePrepopulate: true                
      }
    );
    this.props.updatePartnerInfo({
      cartOfferIdentifer: this.props.identifier,
      partnerId: this.props.match.params.partnerId,
      partnerAgentId: this.props.match.params.agentId
    });
    this.initMainSubMenu(parentOffer);
  }


  componentDidMount() {    
    let fn = `${ns}[componentDidMount]`
    // if (this.props.identifier != nextProps.identifier)
    // {
    //   this.props.fetchTopLevelOffer(nextProps.identifier)
    // }
    if (!this.props.offer || this.props.offer && !this.props.offer.loaded) {
      logger.info(fn, 'fetching offer', this.props.identifier);
      this.props.fetchOffer(this.props.identifier, {populate: 'salesmodel', loaded:true});
    }

    if (this.props.offer && this.props.offer.loaded && !this.props.currentRegion) {
      //load currentRegion;
      this.props.fetchCurrentRegionInfo({
        region: this.props.offer.allowed_regions[0]
      });
    }

    if (this.props.offer && this.props.offer.loaded && this.props.identifier) {      
      logger.info(fn, 'select an offer');
      this.props.selectOfferByIdentifier(this.props.identifier);
      logger.info(fn, 'this.props.salesModel:', this.props.offer.identifier, this.props.salesModel)
      if (this.props.salesModel) {
        if (this.props.useCartData == 'use-quote') {
          this.props.initCartWithQuote();
        }
        else {
          this.initCartInfoByOffer(this.props.offer, this.props.salesModel, this.props.parentOffer);
        }  
      }
      else {
        this.initMainSubMenu(this.props.parentOffer);  
      }            
    }
  }

  componentWillUnmount() {   
    let fn = `${ns}[componentWillUnmount]`;
    logger.info(fn, this.props.offer);
    this.props.resetCartInfo({ offerIdentifier: this.props.offer.identifier });
    this.props.setSelectedOfferCartDataSelection('');
    this.props.preloadCurrentRegion({});
    this.props.selectOffer({ _id: '', identifier: '' });    
  }

  render() {
    let {
      offer,
      currency,
      onetime,
      subscription,
      useCartData,
      cartItem,
      conflictingCartItem,      
      match
    } = this.props;
    if (!offer || !offer.loaded) {
      return <Loader className="offer-panel-container loader-container"/>;
    }
    let isPartnerView = match.params.partnerId || match.params.agentId;
    logger.info(ns, 'isPartnerView:', isPartnerView)
    let actions = [];
    if (isPartnerView) {
      let backLinkUrl = `/partners/${match.params.partnerId}/agents/${match.params.agentId}/quotes`;
      actions = [{ to: backLinkUrl, isExternal: false, label: global.localizer.get('BACK_TO_QUOTES') }]
    }

    let stepsConfig = [
      {
        number: 1,
        title: global.localizer.get('CUSTOMER_INFORMATION'),
        component: 'StepCustomerInfoContainer',
        hideTitle: true,
        completed: true,
        open: true,
        hideNext: true,
      },
      {
        number: 2,
        title: global.localizer.get('HOW_MANY_USERS'),
        component: 'StepPrimarySalesItemContainer',
        hideTitle: true,
        completed: true,
        open: true,
        hideNext: true,
      },
      {
        number: 3,
        title: global.localizer.get('ADD_ON_ADDITIONAL_FEATURES'),
        component: 'StepSelectAddonsContainer',
        tagName: PRODUCT_TAG_ADDON_FEATURES,
        completed: true,
        open: true,
        hideNext: true,
      },
      {
        number: 4,
        title: global.localizer.get('SELECT_YOUR_DEVICES'),
        component: 'StepUsersDeviceSelectionContainer',
        tagName: PRODUCT_TAG_DEVICES,
        completed: true,
        open: true,
        hideNext: true,
      },
    ];

    let showHeader = false;
    let headerTitle = { resource: 'CREATE_QUOTE' };
    if (useCartData == 'use-quote') {
      showHeader = true;
      headerTitle = { resource: 'QUOTE_TO_CART_LAST_STEP' };
      stepsConfig = [
        {
          number: 2,
          title: global.localizer.get('SELECT_MAIN_NUMBER'),
          component: 'StepSelectDIDContainer',
          tagName: PRODUCT_TAG_DID_MAIN,
          openState: true,
          completed: false,
          autoComplete: true,
          hideNext: true         
        }]
    }

    let cartMode = useCartData == 'use-quote'? 'quote-to-checkout' : 'quote'
    logger.info('useCartData:', useCartData, 'cartMode:', cartMode)
    // {
    //   number: 2,
    //   title: global.localizer.get('SELECT_MAIN_NUMBER'),
    //   component: 'StepSelectDIDContainer',
    //   tagName: PRODUCT_TAG_DID_MAIN,
    //   completed: false,
    //   open: true,
    // },
    return (
      <OfferConfigrator >
        <OfferContentHeader {...{
          title: headerTitle,
          actions: actions,
          perUser: {
            hide: true
          }
        }} /> 
        <QuoteContentContainer cartMode={cartMode} stepsConfig={stepsConfig} />         
      </OfferConfigrator>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(QuoteConfigContainer));