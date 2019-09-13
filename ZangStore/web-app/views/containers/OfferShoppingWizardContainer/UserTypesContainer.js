const ns = '[UserTypesContainer]';
import logger from 'js-logger'
import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';

//constants
import { PRODUCT_TAG_SYSTEM_ADDON } from '../../../redux-state/features/salesmodels/constants';

//actions
import {  addItemToCart } from '../../../redux-state/features/cart/actions';

//selectors
import {  getSelectedOffer,  getOfferDefaultSalesModel } from '../../../redux-state/features/offers/selectors';
import { getCartInfo, getCartItemInfo, getCartSubItemsByTag } from '../../../redux-state/features/cart/selectors';
import { getPrimarySalesItem, getPrimarySalesItemAttributesByTag } from '../../../redux-state/features/salesmodels/selectors';

//containers
import SalesModelItemContainer from './SalesModelItemContainer';


//components
import { SellableSalesModelItems } from '../../components/OfferShoppingWizard';
import Price from '../../components/Price';
import { Step } from '../../components/Stepper';

//utils
import { getBillingPeriodLabel } from '../../../redux-state/utils';

const mapStateToProps = (state, props) => { 
  let fn = `${ns}[mapStateToProps]`
  let { offer, salesModel, salesModelItem} = props; 
  return {}

  // let {
  //   attributes,
  //   oneTimeTotal,
  //   subTotal,
  //   numOfAddonsSelected,
  //   selectedAddonName
  // } = getCartSubItemsByTag(state, {
  //   offer,
  //     salesModel,
  //     salesModelItem,
  //   tagName: PRODUCT_TAG_SYSTEM_ADDON
  // });

  // return {
  //   salesModelItem,
  //   attributes,
  //   oneTimeTotal,
  //   subTotal,
  //   numOfAddonsSelected,
  //   selectedAddonName
  // }
};

const mapDispatchToProps = {
  addItemToCart,  
};

class UserTypesContainer extends Component {
  constructor(props) {
    super(props); 
  }

  componentWillReceiveProps(nextProps) {

  }

  componentWillUpdate(nextProps) {
    // if (   this.props.match.params.productSlug ===
    // nextProps.match.params.productSlug &&   this.props.topic && !nextProps.topic
    // ) {   nextProps.history.replace(`/spaces/dashboard`); }
  }

  async componentDidMount() {
   
  }

  componentWillUnmount() {

  }


  
  render() {    
    let { 
      currency,
      offer, 
      salesModel,
      totalQty,
      salesModelItems,
      oneTimeTotal,
      reccuringSubTotal,
      numOfSalesModelItemsSelected,
      selectedSalesModelItemName,

      
    } = this.props;

    if (!offer || !salesModel || !salesModelItems ||
      salesModelItems && !salesModelItems.length) {
      return null;
    }   
    logger.info(ns, 'salesModelItems', salesModelItems);
  
    let addons = salesModelItems.map(slmItem => {      
      return {
        ...slmItem,
        
      }
    }) 

    let sellableItems = salesModelItems.map((slmItem, index) => {
      let key = `user-type-container-${index}`
      return (
        <SalesModelItemContainer {
          ...{
            key,
            offer,
            salesModel,
          ...slmItem          
          }
        } />
      )
    })
    
    return addons.length ? (
      <SellableSalesModelItems>{sellableItems}</SellableSalesModelItems>  
    ): null;
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UserTypesContainer));