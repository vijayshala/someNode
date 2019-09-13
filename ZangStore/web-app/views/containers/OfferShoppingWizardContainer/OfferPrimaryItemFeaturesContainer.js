const ns = '[OfferPrimaryItemFeaturesContainer]';
import logger from 'js-logger'
import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

//constants
import { PRODUCT_TAG_STANDARD_FEATURES } from '../../../redux-state/features/salesmodels/constants';

//actions
import {  addItemToCart } from '../../../redux-state/features/cart/actions';

//selectors
import {  getSelectedOffer,  getOfferDefaultSalesModel } from '../../../redux-state/features/offers/selectors';
import { getCartItemInfo } from '../../../redux-state/features/cart/selectors';
import { getPrimarySalesItem, getPrimarySalesItemAttributesByTag } from '../../../redux-state/features/salesmodels/selectors';


//containers

//components
import { OfferFeaturesList } from '../../components/OfferShoppingWizard';
import SectionTitle from '../../components/SectionTitle';
import Price from '../../components/Price';

const mapStateToProps = (state, props) => { 
  let fn = `${ns}[mapStateToProps]`  
  let { offer, salesModel } = props;  
  let sellableAttributes = getPrimarySalesItemAttributesByTag(state, {
    salesModelId: salesModel._id,
    tagName: PRODUCT_TAG_STANDARD_FEATURES
  });

  return {        
    sellableAttributes
  }
};

const mapDispatchToProps = {
   
};

class OfferPrimaryItemFeaturesContainer extends Component {
  constructor(props) {
    super(props); 
  }

  componentWillReceiveProps(nextProps) {
       
  }

  componentWillUpdate(nextProps) {
    
  }

  componentDidMount() {
   
  }

  componentWillUnmount() {}

  render() {
    let {       
      sellableAttributes      
    } = this.props;
    if (!sellableAttributes || !sellableAttributes.length) {
      return null;
    }   

    let features = sellableAttributes.map(attribute=>{
      return {
        label: attribute.title && attribute.title.resource ? global.localizer.get(attribute.title.resource) : attribute.title.text
      }
    }) 

   
    return (
      <div>
        <SectionTitle label={global.localizer.get('STANDARD_FEATURES')}   />
        <OfferFeaturesList features={features} />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OfferPrimaryItemFeaturesContainer);