const ns = '[StepPrimarySalesItemContainer]';
import logger from 'js-logger'
import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import { formatCurrency } from '../../../common/currencyFormatter';
import Localizer from '../Localizer/Localizer';

import IntlMessageFormat from 'intl-messageformat';

//constants
import {
  PRODUCT_TAG_SYSTEM_ADDON,
  PRODUCT_TAG_USER_TYPES,
  PRODUCT_TAG_SYSTEM_USAGE_RATES,
  PRODUCT_TAG_ADDON_BY_USER_TYPES
} from '../../../redux-state/features/salesmodels/constants';

//actions
import {  addItemToCart } from '../../../redux-state/features/cart/actions';

//selectors
import {  getSelectedOffer,  getOfferDefaultSalesModel } from '../../../redux-state/features/offers/selectors';
import { getCartInfo, getCartItemInfo, getCartSubItemsByTag, getSalesModelItemsPriceFromCart } from '../../../redux-state/features/cart/selectors';
import {  getPrimarySalesItem } from '../../../redux-state/features/salesmodels/selectors';

//containers
import SalesModelItemsContainer from './SalesModelItemsContainer';
import SalesModelItemContainer from './SalesModelItemContainer';
import SelectSalesModelItemsContainer from './SelectSalesModelItemsContainer';

//components
import { OfferPrimaryItemQtyStep, VolumeDiscounts } from '../../components/OfferShoppingWizard';
import SectionTitle from '../../components/SectionTitle';
import { Step } from '../../components/Stepper';
import ModalWindow from '../../components/ModalWindow';

//utils
import { getBillingPeriodLabel, getLableFromDescriptions, translateResourceField } from '../../../redux-state/utils';

const DEFAULT_OFFER = 'uc'
const mapStateToProps = (state, props) => { 
  let fn = `${ns}[mapStateToProps]`
  let { offer, salesModel, tagName } = props;  
  // let cart = (offer) ? getCartInfo(state, { offer }) : {};
  let salesModelItem = (salesModel) ? getPrimarySalesItem(state, {salesModelId: salesModel._id}) : null;
  let cartItem = (offer && salesModel && salesModelItem) ? getCartItemInfo(state, { offer, salesModel, salesModelItem }) : null;  
  
  let userTypesCartSubItems = getSalesModelItemsPriceFromCart(state, {
    currency: salesModel.currency,  
    offer,
    salesModel,
    tagName: tagName || PRODUCT_TAG_USER_TYPES,
    attributesTagName: PRODUCT_TAG_ADDON_BY_USER_TYPES,
    totalCalculationMode: 'include-attributes',
  });

  let systemAddonsCartSubItems = getSalesModelItemsPriceFromCart(state, {
    currency: salesModel.currency,  
    offer,
    salesModel,
    tagName: tagName || PRODUCT_TAG_SYSTEM_ADDON
  });

  let systemUsageAddonsCartSubItems = getSalesModelItemsPriceFromCart(state, {
    currency: salesModel.currency,  
    offer,
    salesModel,
    tagName: tagName || PRODUCT_TAG_SYSTEM_USAGE_RATES
  });

  // logger.info(fn, { offer, salesModel, salesModelItem, cartItem, systemAddonsCartSubItems, userTypesCartSubItems });
  // logger.info(fn, {systemAddonsCartSubItems });
  return {    
    currency: salesModel.currency,
    salesModelItem,
    cartItem: cartItem || { quantity: 0, price: 0 },
    systemAddonsCartSubItems,
    systemUsageAddonsCartSubItems,
    userTypesCartSubItems
  }
};

const mapDispatchToProps = {
  addItemToCart,  
};

class StepPrimarySalesItemContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isStepViewedOnce: false,
      showVolumeDiscountModal: false
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

  componentDidMount() {
    if (this.props.openState == true) {
      this.setState({ isStepViewedOnce: true });
    }
  }

  componentWillUnmount() { }

  updateQtyItemToCart(quantity) {
    let fn = `${ns}[updateQtyItemToCart]`
    let {
      currency,
      offer,
      salesModel,
      salesModelItem,
      cartItem
    } = this.props;
    logger.info(fn, 'quantity', quantity, {
      offer,
      salesModel,
      salesModelItem,
      cartItem
    });
    this.props.addItemToCart({
      offerIdentifier: offer.identifier,
      quantity,
      salesModel,
      salesModelItem
    });
  }
  
  render() {
    let { isStepViewedOnce, showVolumeDiscountModal } = this.state;
    let {
      offer,
      salesModel,
      salesModelItem,
      cartItem,
      systemAddonsCartSubItems,
      systemUsageAddonsCartSubItems,
      userTypesCartSubItems,
      stepNumber,
      hideNext,
      openState = false,
      completed = false,
      currency,
    } = this.props;
    if (!offer || !salesModel || !salesModelItem) {
      return null;
    }
    let reccuringSubTotal = (userTypesCartSubItems.reccuringSubTotal || 0);//cartItem.quantity * cartItem.price + 
    reccuringSubTotal += (systemAddonsCartSubItems && systemAddonsCartSubItems.reccuringSubTotal || 0)
    reccuringSubTotal += (systemUsageAddonsCartSubItems && systemUsageAddonsCartSubItems.reccuringSubTotal || 0)
    let footNoteLbl = translateResourceField(getLableFromDescriptions(salesModel, 'ui.footnote.step.user-types.label')) || ''
    let footNoteLinkLbl = translateResourceField(getLableFromDescriptions(salesModel, 'ui.footnote.step.user-types.link.label')) || ''
    let footNoteLink = null;

    // testing
    let photos = global.localizer.get('USERS_COUNT_NEW')
    let enNumPhotos = new IntlMessageFormat(photos)
    let output = enNumPhotos.format({numUser: 0});

    // remove volume discount chart if not usa
    if (salesModel.allowed_regions[0] != 'US') {
      footNoteLbl =  null;
    }

    let params = {
      title: global.localizer.get('HOW_MANY_USERS'),
      footNote: footNoteLbl,
      footNoteLink: footNoteLinkLbl ? {
        label: footNoteLinkLbl,
        onClick: () => {
          this.setState({ showVolumeDiscountModal: true });
        }
      } : null,
      hideTitle: false,
      open: openState,
      completed,
      disableNext: !userTypesCartSubItems.totalQty,
      hideNext,
      onNext: () => {
        if (userTypesCartSubItems.totalQty) {
          this.props.onNext(stepNumber + 1);
        }
      },
      onSelect: () => {
        if (isStepViewedOnce) {
          this.props.onSelect(stepNumber);
        }
      },
      stepNumber,
      content: <OfferPrimaryItemQtyStep {...{
        minQuantity: salesModelItem.minQuantity,
        quantity: cartItem.quantity,
        maxQuantity: salesModelItem.maxQuantity,
        onChange: (val) => {
          // this.setState({users: val.x})   
          this.updateQtyItemToCart(val.x);
        }
      }} >
        <SalesModelItemsContainer {...{        
          offer,
          salesModel,
          SLMItemContainer: SalesModelItemContainer,
          ...userTypesCartSubItems,
          attributesTagName: PRODUCT_TAG_ADDON_BY_USER_TYPES,
          totalUserQty: userTypesCartSubItems.totalQty,
          forcePrepopulate: true,
        }} />

        
        {systemUsageAddonsCartSubItems.salesModelItems && systemUsageAddonsCartSubItems.salesModelItems.length
          ? <SectionTitle className="title-divider"
            label={global.localizer.get('USAGE_RATE_ADDONS')}
          /> : null}
          {/* rightLabel={'+ ' + formatCurrency(systemUsageAddonsCartSubItems.reccuringSubTotal, { code: currency })} */}
        {systemUsageAddonsCartSubItems.salesModelItems && systemUsageAddonsCartSubItems.salesModelItems.length ?
          <SelectSalesModelItemsContainer {...{
            SLMItemContainer: SalesModelItemContainer,
            className: 'two-columns', offer, salesModel,
            ...systemUsageAddonsCartSubItems,
            totalUsers: userTypesCartSubItems.totalQty,
          }} /> : null}
        
        {/* {systemAddonsCartSubItems.salesModelItems && systemAddonsCartSubItems.salesModelItems.length
          ? <SectionTitle className="title-divider"
            label={global.localizer.get('SYSTEM_ADDONS')}
            rightLabel={'+ ' + formatCurrency(systemAddonsCartSubItems.reccuringSubTotal, { code: currency })}/> : null}
        {systemAddonsCartSubItems.salesModelItems && systemAddonsCartSubItems.salesModelItems.length ?
          <SalesModelItemsContainer {...{
            SLMItemContainer: SalesModelItemContainer,
            className: 'two-columns', offer, salesModel,
            ...systemAddonsCartSubItems,
            totalUsers: userTypesCartSubItems.totalQty,
          }} /> : null} */}
        
          {systemAddonsCartSubItems.salesModelItems && systemAddonsCartSubItems.salesModelItems.length
          ? <SectionTitle className="title-divider" label={global.localizer.get('SYSTEM_ADDONS')}
          /> : null}
          {/* rightLabel={'+ ' + formatCurrency(systemAddonsCartSubItems.reccuringSubTotal, { code: currency })} */}
        {systemAddonsCartSubItems.salesModelItems && systemAddonsCartSubItems.salesModelItems.length ?
          <SalesModelItemsContainer {...{ SLMItemContainer: SalesModelItemContainer, className: 'two-columns', offer, salesModel, ...systemAddonsCartSubItems }} /> : null}

        {showVolumeDiscountModal
          ? <ModalWindow {...{
            title: '',            
            hint: '',
            show: showVolumeDiscountModal,
            okButton: {
              label: global.localizer.get('CLOSE'),
              onClick: () => {
                this.setState({ showVolumeDiscountModal: false })
              }
            }
          }} >
          <VolumeDiscounts />  
            
          </ModalWindow>
          : null}
      </OfferPrimaryItemQtyStep>,
      col1: {
        line1: <Localizer number={userTypesCartSubItems.totalQty} 
                          msg={'USERS_COUNT_NEW'} />
      },
      col2: {
        line1: '',
        line2: '',
      },
      col3: {
        line1: '+ ' + formatCurrency(reccuringSubTotal, { code: currency }),
        line2: salesModel.subscription ? getBillingPeriodLabel(salesModel.subscription.billingPeriod) : global.localizer.get('ONE_TIME'),
      },
      onClick: (step) => {
      
      }
    }
   
    return (
      <Step p {...params} />
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(StepPrimarySalesItemContainer));