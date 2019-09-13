const ns = '[OfferConfigWizardContainer]';
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
import { initCartInfoByOffer, addItemToCart, removeItemFromCart, initCartWithQuote } from '../../../redux-state/features/cart/actions';
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
import OfferPanelContainer from './OfferPanelContainer';
import OfferContentContainer from './OfferContentContainer';
import { selectedOffer } from '../../../redux-state/features/status/reducers';

const DEFAULT_OFFER = 'uc'
const mapStateToProps = (state, props) => {  
  let { selectedOffer } = state.status  
  let { match } = props;
  const { currentRegion = { } } = state.status.regions;
  let identifier = props.identifier || match.params.offerIdentifier || DEFAULT_OFFER // $('#offer-identifier').val()
  let offer = getOfferByIdentifier(state, { identifier });  
  let parentOffer = offer && offer.parent ? getOfferByIdentifier(state, { identifier: offer.parent.identifier }) || (offer && offer.parent) : null;
  let salesModel = offer ? getOfferDefaultSalesModel(state, { offerId: offer._id }) : null;
  let cart = (offer) ? getCartInfo(state, { offer }) : {};  
  let cartItem = getCurrentCartItemInfo(state, { offer, salesModel });
  let conflictingCartItem = null;
  if (!cartItem) {
    conflictingCartItem = getConflictingCartItemWithSameSalesModel(state, { offer, salesModel });
  }

  let primaryItemQuantity = getCartPrimarySalesModelQty(state, { offer }) 
  let subscription = cart && cart.subscriptions && cart.subscriptions.length && cart.subscriptions[0] || null
  // logger.info(ns, 'identifier:', identifier, offer, 'conflictingCartItem', conflictingCartItem);
  return {
    currentRegion:currentRegion.data,
    region: getViewerRegion(),
    offer,
    parentOffer,
    salesModel,
    identifier,    
    fetching: selectedOffer.fetching,    
    currency: salesModel && salesModel.currency,
    // onetime: cart.onetime, 
    subscription,
    primaryItemQuantity,
    useCartData: selectedOffer.useCartData,
    cartItem,
    conflictingCartItem
  }
};

const mapDispatchToProps = {
  fetchOffer, 
  selectOfferByIdentifier,
  selectOffer,
  initCartInfoByOffer,
  initCartWithQuote,
  initMainSubMenu,
  setSelectedOfferCartDataSelection,
  removeItemFromCart,
  setSalesModelAsActive,
  fetchCurrentRegionInfo,
  preloadCurrentRegion
};

class OfferConfigWizardContainer extends Component {
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
        url: `/${region.toLowerCase()}/shop/${parentOffer.identifier}`,
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
    let { conflictingCartItem, match, quoteId, useCartData, currentRegion: newCurrentRegion } = nextProps;
    let { currentRegion } = this.props;
    logger.info(fn, this.props.offer, nextProps.offer);
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

    if (this.props.parentOffer
      && nextProps.parentOffer
      && !this.props.parentOffer.loaded) {
      // this.props.fetchOffer(nextProps.parentOffer.identifier);
    }

    // if (!this.props.offer && nextProps.offer && nextProps.offer.loaded
    //   || !this.props.identifier && nextProps.offer
    //   || this.props.offer && !this.props.offer.loaded && nextProps.offer.loaded
    // ) {      
    //   selectOffer = true;
    // }
    
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
          if (!nextProps.cartItem) {
            if (conflictingCartItem) {
              if (nextProps.useCartData == 'use-cart') {
                this.props.setSalesModelAsActive(conflictingCartItem.offer, conflictingCartItem.salesModel);
                this.props.initCartInfoByOffer({
                  offerIdentifier: conflictingCartItem.offer.identifier,
                  salesModel: conflictingCartItem.salesModel,
                  cartKey: 'default'
                });
              }
              else {
                this.setState({
                  warnUser: !nextProps.useCartData || false,
                  ...this.initModalWindowLabels(nextProps.conflictingCartItem)
                })
              }
            }
            else {
              if (nextProps.useCartData != 'use-cart') {
                this.props.setSelectedOfferCartDataSelection('use-new');
                this.props.initCartInfoByOffer(
                  {
                    offerIdentifier: nextProps.offer.identifier,
                    salesModel: nextProps.salesModel,
                    forcePrepopulate: true
                  }
                );
              }
            }
          }
          else {
            this.setState({
              warnUser: !nextProps.useCartData || false,
              ...this.initModalWindowLabels(nextProps.cartItem)
            })
            if (nextProps.useCartData == 'use-cart') {
              this.props.setSalesModelAsActive(nextProps.offer, nextProps.salesModel);
              this.props.initCartInfoByOffer({
                offerIdentifier: nextProps.offer.identifier,
                salesModel: nextProps.salesModel,
                cartKey: 'default'
              });
            }
          }          
        }  
        this.initMainSubMenu(nextProps.parentOffer);
      } 
    }


    if (this.props.salesModel && !this.props.salesModel.items
      && nextProps.salesModel && nextProps.salesModel.items) {
      // this.props.initCartInfoByOffer(nextProps.offer, nextProps.salesModel);
    }
  }

  componentDidMount() {    
    let fn = `${ns}[componentDidMount]`
    // if (this.props.identifier != nextProps.identifier)
    // {
    //   this.props.fetchTopLevelOffer(nextProps.identifier)
    // }
    if (!this.props.offer || this.props.offer && !this.props.offer.loaded) {
      logger.info(fn, 'fetching offer');
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
      logger.info(fn, 'this.props.salesModel:', this.props.offer.identifier, this.props.salesModel);
      if (this.props.useCartData == 'use-quote') {
        this.props.initCartWithQuote();
      }
      else {
        if (!this.props.cartItem) {
          if (this.props.conflictingCartItem) {
            this.setState({
              warnUser: !this.props.useCartData || false,
              ...this.initModalWindowLabels(this.props.conflictingCartItem)
            })
          }
          else {
            this.props.setSelectedOfferCartDataSelection('use-new');
            this.props.initCartInfoByOffer({
              offerIdentifier: this.props.offer.identifier,
              salesModel: this.props.salesModel,
              forcePrepopulate: true
            });
          }
        }
        else {
          this.setState({
            warnUser: this.props.cartItem && !this.props.useCartData || false,
            ...this.initModalWindowLabels(this.props.cartItem)
          })
        }
      }
      

      this.initMainSubMenu(this.props.parentOffer);      
    }
  }

  componentWillUnmount() {
    this.props.setSelectedOfferCartDataSelection('');
    this.props.selectOffer({_id: '', identifier: ''});
  }

  render() {
    let {
      region,
      offer,
      currency,
      onetime,
      subscription,
      primaryItemQuantity = 1,
      useCartData,
      cartItem,
      conflictingCartItem,
    } = this.props;
    if (!offer || !offer.loaded) {
      return <Loader className="offer-panel-container loader-container"/>;
    }

    // console.log(ns, 'subscription:', subscription, 'primaryItemQuantity:', primaryItemQuantity, 'cartItem', cartItem, 'useCartData', useCartData)
    var subTotalPerUser = subscription && subscription.total || 0;        
    subTotalPerUser = (subTotalPerUser / primaryItemQuantity);
    

    let stepsConfig = [
      {
        number: 1,
        title: global.localizer.get('HOW_MANY_USERS'),
        component: 'StepPrimarySalesItemContainer',
        hideTitle: true,
        completed: false
      },
      {
        number: 2,
        title: global.localizer.get('SELECT_MAIN_NUMBER'),
        component: 'StepSelectDIDContainer',
        tagName: PRODUCT_TAG_DID_MAIN,
        completed: false
      },
      {
        number: 3,
        title: global.localizer.get('ADD_ON_ADDITIONAL_FEATURES'),
        component: 'StepSelectAddonsContainer',
        tagName: PRODUCT_TAG_ADDON_FEATURES,
        completed: false
      },
      {
        number: 4,
        title: global.localizer.get('SELECT_YOUR_DEVICES'),
        component: 'StepDevicesContainer',
        tagName: PRODUCT_TAG_DEVICES,
        completed: false
      },
      {
        number: 4,
        title: global.localizer.get('SELECT_YOUR_DEVICES'),
        component: 'StepUsersDeviceSelectionContainer',
        tagName: PRODUCT_TAG_DEVICES,
        completed: false
      },
    ];
    let showHeader = false;
    let headerTitle = offer.title;
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

{/* <OfferContentHeader {...{
          title: offer.title,
          perUser: {
            hide: true,
            currency,
            total: subTotalPerUser,
            info: global.localizer.get('PER_USER')
          }
        }} /> */}
    return (
      <OfferConfigrator>
        {showHeader ? <OfferContentHeader {...{
          title: headerTitle,
          perUser: {
            hide: true            
          }
        }} /> : null}

        <OfferContentContainer stepsConfig={ stepsConfig } />
          <ModalWindow {...{
            title:  this.state.modalwindowTitle,
            subTitle: this.state.modalwindowSubTitle,            
            show: this.state.warnUser,
            okButton: {
              label: this.state.modalwindowOkLabel,
              onClick: () => {                
                //initialize selection with cart data
                this.props.setSelectedOfferCartDataSelection('use-cart');
                if (conflictingCartItem) {
                  if (conflictingCartItem.offer.identifier != this.props.offer.identifier) {
                    linkGo(`/${region.toLowerCase()}/shop/configure/${conflictingCartItem.offer.identifier}`, true);
                  }
                  else {
                    logger.warn(ns, 'choosing same offer but different salesmodel', conflictingCartItem);
                    this.props.setSalesModelAsActive(conflictingCartItem.offer, conflictingCartItem.salesModel);
                    this.props.initCartInfoByOffer({
                      offerIdentifier: conflictingCartItem.offer.identifier,
                      salesModel: conflictingCartItem.salesModel,
                      cartKey: 'default'
                    });
                  }    
                }
                else {                  
                  this.props.initCartInfoByOffer({
                    offerIdentifier: this.props.offer.identifier,
                    salesModel: this.props.salesModel,
                    cartKey: 'default'
                  });
                }
                this.setState({ warnUser: false });                
              }
            },
            cancelButton: {
              label: this.state.modalwindowCancelLabel,
              onClick: () => {
                //clear the cart                   
                if (conflictingCartItem) {
                  this.props.removeItemFromCart(conflictingCartItem.offer.identifier, conflictingCartItem.salesModel, null, null, 'default');
                }
                else if (cartItem) {
                  this.props.removeItemFromCart(cartItem.offer.identifier, cartItem.salesModel, null, null, 'default');
                }
                this.props.setSelectedOfferCartDataSelection('use-new');
                this.props.initCartInfoByOffer({
                  offerIdentifier: this.props.offer.identifier,
                  salesModel: this.props.salesModel,
                  forcePrepopulate: true                  
                }); 
                this.setState({ warnUser: false });
              }
            }
          }} >            
          </ModalWindow>
      </OfferConfigrator>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(OfferConfigWizardContainer));