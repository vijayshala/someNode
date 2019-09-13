const ns = '[SelectSalesModelItemsContainer]';
import logger from 'js-logger';
import constants from '../../../../config/constants';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { formatCurrency } from '../../../common/currencyFormatter'

//cons tants
// import { DID_TYPE_EXISTING, DID_TYPE_TOLLFREE, DID_TYPE_LOCAL } from '../../../redux-state/utils/general.constants'
import {  PRODUCT_TAG_DID_MAIN, PRODUCT_TAG_NO_CONFIG } from '../../../redux-state/features/salesmodels/constants';

//actions
import { addItemToCart } from '../../../redux-state/features/cart/actions';
import { setStepStatus } from '../../../redux-state/features/status/actions';

//selectors
import {  getSelectedOffer,  getOfferDefaultSalesModel } from '../../../redux-state/features/offers/selectors';
import { getCartItemInfo, getCartInfo, getSalesModelItemsPriceFromCart } from '../../../redux-state/features/cart/selectors';
import {  getPrimarySalesItem, getPrimarySalesItemAttributesByTag } from '../../../redux-state/features/salesmodels/selectors';

//containers
import { DIDNumberSelectionContainer } from '../DIDNumberSelection'

//components
import { SelectSalesModelItems } from '../../components/OfferShoppingWizard';
import Price from '../../components/Price';
import { Step } from '../../components/Stepper';
import ModalWindow from '../../components/ModalWindow';

//utils
import { getBillingPeriodLabel, getLableFromDescriptions, translateResourceField } from '../../../redux-state/utils';
import {  getMainDIDSelected } from '../../../redux-state/features/salesmodels/utils';

const mapStateToProps = (state, props) => { 
  let fn = `${ns}[mapStateToProps]`  
  return {     
  }
};

const mapDispatchToProps = {
  addItemToCart,  
  setStepStatus
};

class SelectSalesModelItemsContainer extends Component {
  constructor(props) {
    super(props); 
    this.state = {
      selectedSMItemIdentifier: '',
    }
  }


  updateQtyItemToCart(quantity, salesModelItem, selectedOptions) {
    let fn = `${ns}[updateQtyItemToCart]`
    let { 
      offer, 
      salesModel
    } = this.props;
    logger.info(fn, 'quantity', quantity, 'salesModelItem:', salesModelItem, 'selectedOptions:', selectedOptions);    
    this.props.addItemToCart({
      offerIdentifier: offer.identifier,
      quantity,
      salesModel,
      salesModelItem,
      selectedOptions
    });
  }

  onSelectSMItem(selectedSMItemIdentifier = '', showNumberSelectionModal = true) {
    let fn = `${ns}[onSelectSMItem]`
    logger.info(fn, 'state.selectedSMItemIdentifier', this.state.selectedSMItemIdentifier, selectedSMItemIdentifier);
    let selectedNumber = this.state.selectedNumber
    let numberInfo = this.state.numberInfo
    if (this.state.selectedSMItemIdentifier != selectedSMItemIdentifier) {
      //need to reset the selected qty to new;
      this.removePreviousDIDSelection(this.state.selectedSMItemIdentifier);
      selectedNumber = '';
      numberInfo=''
    }
    this.setState({ selectedSMItemIdentifier, showNumberSelectionModal, selectedNumber, numberInfo });

  }

  removePreviousDIDSelection(attributeIdentifier) {
    let { 
      salesModelItems,
      didTypesCartSubItems,
      selectedAttributes,
    } = this.props;
    let prevSalesModelItem = getMainDIDSelected({
      salesModelItems,
      didTypesCartSubItems,
      attributeIdentifier
    });
    if (prevSalesModelItem) {
      this.updateQtyItemToCart(0, prevSalesModelItem);
    }
  }
  
  render() {
    let { selectedSMItemIdentifier } = this.state;
    let { 
      className = '',
      currency,
      totalUsers,
      offer,
      salesModel,      
      salesModelItems,
    } = this.props;

    if (!offer || !salesModel || !salesModelItems ||
      salesModelItems && !salesModelItems.length) {
      return null;
    }   
    // logger.info(ns, 'salesModelItems', salesModelItems);
    let phoneSelectionOptions = salesModelItems.map(slmItem => {   
      let salesModelItem = slmItem.salesModelItem
      // logger.info(ns, 'slmItem', slmItem, selectedSMItemIdentifier);
      if (slmItem.quantity>0 || salesModelItem.identifier == selectedSMItemIdentifier) {
        selectedSMItemIdentifier = salesModelItem.identifier;
      }
      let shortDescription = getLableFromDescriptions(salesModelItem, 'default')
      let notes = getLableFromDescriptions(salesModelItem, 'notes');
      // let { currency, quantity = 0, salesModelItem = {} } = options;
      let isLockedQuantity = salesModelItem && salesModelItem.tags && salesModelItem.tags.indexOf('quantity-match-item') > -1;
      // logger.info(ns, 'salesModelItem', salesModelItem, 'isLockedQuantity', isLockedQuantity);
      return {
        ...slmItem,
        label: translateResourceField(salesModelItem.title), 
        // subLabel: translateResourceField(shortDescription),          
        hint: translateResourceField(notes),          
        value: salesModelItem.identifier,
        showPrice: salesModelItem && salesModelItem.tags && salesModelItem.tags.indexOf('hide') === -1,
        price: salesModelItem.price, //isLockedQuantity ? Math.max(totalUsers * salesModelItem.price, salesModelItem.price) : salesModelItem.price,
        priceLabel: global.localizer.get('PER_USER'),
        selected: selectedSMItemIdentifier == salesModelItem.identifier || false,
        onSelect: (value) => {
          this.updateQtyItemToCart(1, salesModelItem, { helper: { number: '' } })
          this.onSelectSMItem(value);
        }
      }
    }) 

    return (<SelectSalesModelItems {...{
      phoneSelectionOptions
    }} />);
  
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SelectSalesModelItemsContainer));


