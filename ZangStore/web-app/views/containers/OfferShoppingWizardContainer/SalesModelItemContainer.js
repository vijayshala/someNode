const ns = '[SalesModelItemContainer]';
import logger from 'js-logger'
import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';

//constants
import { PRODUCT_TAG_ADDON_BY_USER_TYPES } from '../../../redux-state/features/salesmodels/constants';

//actions
import {  addItemToCart } from '../../../redux-state/features/cart/actions';

//selectors
import {  getSelectedOffer,  getOfferDefaultSalesModel } from '../../../redux-state/features/offers/selectors';
import { getCartInfo, getCartItemInfo, getCartSubItemsByTag } from '../../../redux-state/features/cart/selectors';
import { getPrimarySalesItem, getPrimarySalesItemAttributesByTag } from '../../../redux-state/features/salesmodels/selectors';

//containers

//components
import { SellableSalesModelItem, SellableAttributes } from '../../components/OfferShoppingWizard';

//utils
import { getBillingPeriodLabel } from '../../../redux-state/utils';

const mapStateToProps = (state, props) => { 
  let fn = `${ns}[mapStateToProps]`
  let { offer, salesModel, salesModelItem, tagName} = props; 
  let curItemCartSubItems = tagName ? getCartSubItemsByTag(state, {
    offer,
    salesModel,
    salesModelItem,
    tagName
  }) : {};

  return {
    curItemCartSubItems,
  }
};

const mapDispatchToProps = {
  addItemToCart,  
};

class SalesModelItemContainer extends Component {
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

  updateQtyItemToCart(quantity, salesModelItem, attribute) {
    let fn = `${ns}[updateQtyItemToCart]`
    let { 
      offer, 
      salesModel,
      forcePrepopulate
    } = this.props;
    logger.info(fn, 'quantity', quantity, 'salesModelItem:', salesModelItem);    
    // this.props.addItemToCart(offer.identifier, parseInt(quantity), salesModel, salesModelItem, attribute);
    this.props.addItemToCart({
      offerIdentifier: offer.identifier,
      quantity,
      salesModel,
      salesModelItem,
      attribute,
      selectedOptions: attribute? {helper: {prepopulated:false, follow: ''}} : null,
      forcePrepopulate: !attribute && forcePrepopulate ? true : false
    });   
  }
  
  render() {    
    let { 
      currency,
      offer, 
      salesModel,
      salesModelItem,
      quantity,
      curItemCartSubItems = {},  
      ItemComponent = SellableSalesModelItem,
    } = this.props;

    let {
      attributes=[],
      oneTimeTotal,
      subTotal,
      numOfAddonsSelected,
      selectedAddonName      
    } = curItemCartSubItems

    if (!offer || !salesModel || !salesModelItem) {
      return null;
    }   
    logger.info(ns, 'salesModelItem', this.props);
  
    let addons = attributes.map(attr => {
      return {
        ...attr, 
        maxQuantity: quantity,
        // showQuantityInput: true,
        onChange: (attrQuantity) => {
          logger.info(ns, 'attribute', attr, 'quantity:', attrQuantity);
          if (attrQuantity > quantity) {
            logger.warn(ns, 'max quantity reached', attr, attrQuantity);
            return
          }
          this.updateQtyItemToCart(attrQuantity, salesModelItem, attr.addon)
        }
      }
    }); 
    return (
      <SellableSalesModelItem {...this.props} onChange={(quantity) => {
        // logger.info(ns, 'attribute', attribute, 'quantity:', quantity );
        this.updateQtyItemToCart(quantity || 0, salesModelItem)
      }}>
        {addons.length > 0 ?
          <SellableAttributes {...{
            addons
          }} /> : null}
      </SellableSalesModelItem>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SalesModelItemContainer);