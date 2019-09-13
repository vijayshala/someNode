const ns = '[StepSelectDIDContainer]';
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
import { SelectMainPhoneNumber } from '../../components/OfferShoppingWizard';
import Price from '../../components/Price';
import { Step } from '../../components/Stepper';
import ModalWindow from '../../components/ModalWindow';

//utils
import { getBillingPeriodLabel, getLableFromDescriptions, translateResourceField } from '../../../redux-state/utils';
import {  getMainDIDSelected } from '../../../redux-state/features/salesmodels/utils';

const mapStateToProps = (state, props) => { 
  let fn = `${ns}[mapStateToProps]`  
  let { offer, salesModel, tagName } = props;  
  let { cartByOffer, selectedOffer } = state.status;
  let { salesModelItemAttributes } = state.entities;  
  let { currentRegion = { } } = state.status.regions;
  // let cart = (offer) ? getCartInfo(state, { offer }) : {};  
  // let salesModelItem = getPrimarySalesItem(state, {salesModelId: salesModel._id})
  // let cartPrimaryItem = (offer && salesModel && salesModelItem) ? getCartItemInfo(state, { offer, salesModel, salesModelItem }) : null;  

  let {
    totalQty,
    salesModelItems,
    oneTimeTotal,
    reccuringSubTotal,
    numOfSalesModelItemsSelected,
    selectedSalesModelItemName
  } = getSalesModelItemsPriceFromCart(state, {
      currency: salesModel.currency,
      offer,
      salesModel,
      tagName: tagName || PRODUCT_TAG_DID_MAIN
    });
  

  return {     
    currency: salesModel.currency,
    totalQty,
    salesModelItems,
    oneTimeTotal,
    reccuringSubTotal,
    numOfSalesModelItemsSelected,
    selectedSalesModelItemName,
    currentRegion: currentRegion.data,
    selectedAttributes: cartByOffer[selectedOffer.identifier] && cartByOffer[selectedOffer.identifier].selectedAttributes || {},    
    // primaryQuantity: cartPrimaryItem && cartPrimaryItem.quantity || 1,
    subscription: salesModel.subscription,
  }
};

const mapDispatchToProps = {
  addItemToCart,  
  setStepStatus
};

class StepSelectDIDContainer extends Component {
  constructor(props) {
    super(props); 
    this.state = {
      selectedDIDType: '',
      showNumberSelectionModal: false,
      selectedNumber: '',
      numberInfo: '',
      isStepViewedOnce: false,
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

  async componentDidMount() {
   
  }

  componentWillUnmount() {}


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

  onDIDTypeSelected(selectedDIDType = '', showNumberSelectionModal = true) {
    let fn = `${ns}[onDIDTypeSelected]`
    logger.info(fn, 'state.selectedDIDType', this.state.selectedDIDType, selectedDIDType);
    let selectedNumber = this.state.selectedNumber
    let numberInfo = this.state.numberInfo
    if (this.state.selectedDIDType != selectedDIDType) {
      //need to reset the selected qty to new;
      this.removePreviousDIDSelection(this.state.selectedDIDType);
      selectedNumber = '';
      numberInfo=''
    }
    this.setState({ selectedDIDType, showNumberSelectionModal, selectedNumber, numberInfo });

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
    let { selectedDIDType, showNumberSelectionModal, selectedNumber, isStepViewedOnce  } = this.state;
    let { 
      offer, 
      salesModel,
      totalQty,
      salesModelItems,
      oneTimeTotal,
      reccuringSubTotal,
      numOfSalesModelItemsSelected,
      selectedSalesModelItemName,

      selectedAttributes,
      primaryQuantity,
      stepNumber,
      title,
      hideTitle,
      hideNext,
      openState = false,
      completed = false,
      autoComplete = false,
      subscription, 
      currency,
      currentRegion
    } = this.props;

    if (!offer || !salesModel || !salesModelItems ||
      salesModelItems && !salesModelItems.length) {
      return null;
    }   
    // logger.info(ns, 'salesModelItems', salesModelItems);
    let selectedDID = null;
    let phoneSelectionOptions = salesModelItems.map(slmItem => {   
      let salesModelItem = slmItem.salesModelItem
      // logger.info(ns, 'slmItem', slmItem, selectedDIDType);
      if (slmItem.quantity>0 || salesModelItem.identifier == selectedDIDType) {
        selectedDID = salesModelItem;
        selectedDIDType = salesModelItem.identifier;
        selectedNumber=''
        if (slmItem.selectedOptions && slmItem.selectedOptions.helper && slmItem.selectedOptions.helper.number) {
          selectedNumber = slmItem.selectedOptions.helper.number
        }
      }
      let shortDescription = getLableFromDescriptions(salesModelItem, 'default')
      let notes = getLableFromDescriptions(salesModelItem, 'notes')
      let infoOnly = selectedDID && selectedDID.tags && selectedDID.tags.indexOf(PRODUCT_TAG_NO_CONFIG) > -1; 
      return {
        ...slmItem,
        label: translateResourceField(salesModelItem.title), 
        subLabel: translateResourceField(shortDescription),          
        hint: translateResourceField(notes),          
        value: salesModelItem.identifier,
        selected: selectedDIDType == salesModelItem.identifier && (selectedNumber || infoOnly) || false,
        onSelect: (value) => {
          let infoOnly = salesModelItem && salesModelItem.tags && salesModelItem.tags.indexOf(PRODUCT_TAG_NO_CONFIG) > -1; 
          if (infoOnly) {
            this.updateQtyItemToCart(1, salesModelItem, { helper: { number: '' } })
          }
          this.onDIDTypeSelected(value);
        }
      }
    }) 
    let infoOnly = selectedDID && selectedDID.tags && selectedDID.tags.indexOf(PRODUCT_TAG_NO_CONFIG) > -1;
    let canCountinue = selectedNumber || infoOnly;
    // logger.info(ns, 'selectedDIDType:', selectedDIDType, phoneSelectionOptions, 'selectedNumber', selectedNumber);
    let col2Line1 = ''
    let col2Line2 = ''
    //let footNote = translateResourceField(getLableFromDescriptions(salesModel, 'ui.footnote.step.devices.label')) || ''
    //let footNote = global.localizer.get('ORDER_OFFICE_TRANSFER_INSTRUCTIONS').replace(/\{SUPPORT_EMAIL\}/g, constants.SUPPORT_EMAILS.CLOUD_SUPPORT).replace('{LNP_FORM_LINK}', 'https://storage.googleapis.com/avayastore/downloads/Avaya-Blank-LOA-Form.pdf').replace('{RODAA_LINK}', 'https://storage.googleapis.com/avayastore/downloads/Avaya-RODAA-Form.pdf');
    let footNote = '';//global.localizer.get('ORDER_OFFICE_TRANSFER_INSTRUCTIONS');
    if (selectedDID) {
      col2Line1 = selectedDID.isOneTimeCharge
        ? '+ ' + formatCurrency(oneTimeTotal, { code: currency })
        : '+ ' + formatCurrency(reccuringSubTotal, { code: currency })
      
      col2Line2 = selectedDID.isOneTimeCharge
        ? global.localizer.get('ONE_TIME')
        : subscription ? getBillingPeriodLabel(subscription.billingPeriod) : ''
    }
    let shortTitle = translateResourceField(getLableFromDescriptions(selectedDID, 'short-title'));
    let col1Line1= selectedNumber ? selectedNumber : shortTitle
    let col1Line2 = selectedNumber ? shortTitle : ''

    // logger.info(ns, 'selectedDID', selectedDID, shortTitle);
    let params = {
      title: title || global.localizer.get('SELECT_MAIN_NUMBER'),
      hideTitle: hideTitle,
      footNote: footNote,
      open: openState,
      completed,
      stepNumber,
      hideNext,
      autoComplete,
      disableNext: (canCountinue) ? false : true,
      content: <SelectMainPhoneNumber {...{
        phoneSelectionOptions
      }} />,
      col1: {        
        line1: col1Line1,
        line2: col1Line2,
      },
      col2: {
        line1: canCountinue && selectedDID && selectedDID.isOneTimeCharge && selectedDID.price>0 ? col2Line1 : '',
        line2: canCountinue && selectedDID && selectedDID.isOneTimeCharge && selectedDID.price>0 ? col2Line2: '',
      }, 
      col3: {
        line1: canCountinue && selectedDID && !selectedDID.isOneTimeCharge && selectedDID.price>0 ? col2Line1: '',
        line2: canCountinue && selectedDID && !selectedDID.isOneTimeCharge && selectedDID.price>0 ? col2Line2: '',
      }, 
      onNext: () => {
        if (canCountinue) {
          this.props.onNext(stepNumber + 1);  
        }        
      },
      onBack: () => {
        this.props.onNext(stepNumber - 1);
      },
      onSelect: () => {
        if (isStepViewedOnce) {
          this.props.onSelect(stepNumber);
        }
      },
    }
    
   
    return (
      <div>
        <Step {...params} />
        {selectedDID && showNumberSelectionModal && !infoOnly
          ? <ModalWindow {...{
            title: selectedDID.title && selectedDID.title.text,
            // subTitle: selectedDID.shortTitle && selectedDID.shortTitle.text,
            hint: selectedDID.description && selectedDID.description.text,
            show: showNumberSelectionModal,
            okButton: {
              label: global.localizer.get('SELECT'),
              onClick: () => {
                let selectedNumber = this.state.numberInfo ? this.state.numberInfo.replace('_', '') : ''
                logger.info(ns, 'selectedNumber', selectedNumber);
                if (selectedNumber || infoOnly)  {
                  this.setState({
                    showNumberSelectionModal: false,
                    selectedNumber: selectedNumber
                  });
                  this.updateQtyItemToCart(1, selectedDID, { helper: { number: selectedNumber } })
                  if (autoComplete) {
                    {/* this.props.onNext(stepNumber + 1);   */}
                    this.props.setStepStatus(offer.identifier, stepNumber, {completed:true});
                  }                  
                }                
              }
            },
            cancelButton: {
              label: global.localizer.get('CANCEL'),
              onClick: () => {
                this.setState({showNumberSelectionModal: false, numberInfo: ''});
                // this.updateQtyItemToCart(1, selectedDID, { helper: { number: '' } })
              }
            }
          }} >
            <DIDNumberSelectionContainer
              ref={(numberSelectionContainer) => { this.numberSelectionContainer = numberSelectionContainer }}
              {...{
                selectedDIDType,
                currentRegion,
                infoOnly,
                provider: salesModel && salesModel.product && salesModel.product.identifier,
                onChange: numberInfo => {
                  logger.info(ns, 'numberInfo', numberInfo);
                  this.setState({
                    numberInfo: numberInfo
                  })
                }
              }} />
          </ModalWindow>
          : null}  
      </div>  
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(StepSelectDIDContainer));


