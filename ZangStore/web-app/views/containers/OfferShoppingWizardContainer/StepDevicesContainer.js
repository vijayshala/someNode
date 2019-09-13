const ns = '[StepDevicesContainer]';
import logger from 'js-logger'
import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import { formatCurrency } from '../../../common/currencyFormatter'
import { getViewerRegion } from '../../../redux-state/features/viewer/selectors';

// new localization container

//constants
import { PRODUCT_TAG_DEVICES } from '../../../redux-state/features/salesmodels/constants';

//actions
import {  addItemToCart } from '../../../redux-state/features/cart/actions';

//selectors
import {  getSelectedOffer,  getOfferDefaultSalesModel } from '../../../redux-state/features/offers/selectors';
import { getCartInfo, getSalesModelItemsPriceFromCart } from '../../../redux-state/features/cart/selectors';
import {  getSalesModelItemsByTag } from '../../../redux-state/features/salesmodels/selectors';

//containers

//components
import { SellableItemsHorizaontalScroll } from '../../components/OfferShoppingWizard';
import Price from '../../components/Price';
import { Step } from '../../components/Stepper';

const mapStateToProps = (state, props) => { 
  let fn = `${ns}[mapStateToProps]`
  let { offer, salesModel, tagName } = props;  

  let curDevicesCartItems = getSalesModelItemsPriceFromCart(state, {
    currency: salesModel.currency,  
    offer,
    salesModel,
    tagName: tagName || PRODUCT_TAG_DEVICES
  });

  return {
    currency: salesModel.currency,
    curDevicesCartItems,
    region: getViewerRegion(),
  }
};

const mapDispatchToProps = {
  addItemToCart,  
};

class StepDevicesContainer extends Component {
  constructor(props) {
    super(props); 
    this.state = {
      isStepViewedOnce: false
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

  updateQtyItemToCart(quantity, salesModelItem) {
    let fn = `${ns}[updateQtyItemToCart]`
    let { 
      offer, 
      salesModel      
    } = this.props;
    logger.info(fn, 'quantity', quantity, 'salesModelItem:', salesModelItem);    
    this.props.addItemToCart({
        offerIdentifier: offer.identifier,
        quantity,
        salesModel,
        salesModelItem
      });
  }
  
  render() {
    let { isStepViewedOnce } = this.state;
    let {
      currency,
      offer,
      salesModel,
      curDevicesCartItems = {},
      
      stepNumber,
      title,
      hideTitle,
      openState = false,
      completed = false,
      region
      
    } = this.props;

    let {
      salesModelItems,
      totalQty,
      oneTimeTotal,
      reccuringSubTotal,
      numOfSalesModelItemsSelected,
      selectedSalesModelItemName
    } = curDevicesCartItems;

    if (!offer || !salesModel || !salesModelItems ||
      salesModelItems && !salesModelItems.length) {
      return null;
    }   
    logger.info(ns, 'salesModelItems', salesModelItems);
  
    let addons = salesModelItems.map(slmItem => {      
      return {
        ...slmItem,
        onChange:(quantity)=>{
          // logger.info(ns, 'attribute', attribute, 'quantity:', quantity );
          this.updateQtyItemToCart(quantity || 0, slmItem.salesModelItem)
        }
      }
    }) 

    
    let params = {
      title: title || global.localizer.get('SELECT_YOUR_DEVICES'), 
      hideTitle: hideTitle,
      open: openState,
      completed,
      stepNumber,
      content: <div>
        <SellableItemsHorizaontalScroll {...{
                addons
        }} />
        {(region.toUpperCase() == 'DE' ? <p style={{paddingTop:'10px'}} dangerouslySetInnerHTML={{__html: global.localizer.get('TENOVIS_DIRECT')}}></p> : null)}
        
      </div>,
      col1: {
        line1:  global.localizer.get('ITEM_UNITS').replace('{qty}', totalQty),
        line2: numOfSalesModelItemsSelected>1
        ? global.localizer.get('MIXED')
        : selectedSalesModelItemName
      },
      col2: {
        line1: '+ ' + formatCurrency(oneTimeTotal, { code: currency }),        
        line2: global.localizer.get('ONE_TIME'),        
      },
      col3: {
        line1: '',        
        line2: '',
      },
      onNext: ()=>{
        this.props.onNext(stepNumber+1);
      },
      // onBack: () => {
      //   this.props.onNext(stepNumber - 1);
      // },
      onSelect: ()=>{
        if (isStepViewedOnce) {
          this.props.onSelect(stepNumber);
        }
      },    
    }
   
    return (
      <Step {...params } />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StepDevicesContainer);