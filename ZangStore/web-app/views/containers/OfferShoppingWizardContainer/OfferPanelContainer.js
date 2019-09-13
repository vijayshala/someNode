const ns = '[OfferPanelContainer]';
import logger from 'js-logger'
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

//actions
import { selectOffer } from '../../../redux-state/features/offers/actions';
import { fetchSalesModelByIdentifier } from '../../../redux-state/features/salesmodels/actions';
// import {  createCart } from '../../../redux-state/features/cart/actions';

//selectors
import {  getOfferById,  getOfferDefaultSalesModel } from '../../../redux-state/features/offers/selectors';
import {  getCartByCategory, getCartCategoryTotalUsers } from '../../../redux-state/features/cart/selectors';

//components
// import {OfferPanel} from '../../components/OfferShoppingWizard';
import Loader from '../../components/Loader';


//containers
import SalesModelPanelContainer from './SalesModelPanelContainer'

const mapStateToProps = (state, props) => {  
  let { selectedOffer } = state.status;
  let { offerId, selected } = props;   
  let { salesModels } = state.entities;
  let offer = getOfferById(state, props);
  let slModels = (offer.salesModels || []).map(slModel => {
    return salesModels[slModel.salesModel];
  })
  let salesModel = getOfferDefaultSalesModel(state, props);  
  logger.info(ns, '=====offer', offer, 'salesModel', salesModel)  
  return {    
    offer,    
    salesModel,
    salesModels: slModels,
    selectedOffer
  }
};

const mapDispatchToProps = {       
  selectOffer,
  fetchSalesModelByIdentifier
};

class OfferPanelContainer extends Component {
  constructor(props) {
    super(props);

  }

  componentWillReceiveProps(nextProps) {

  }

  componentWillUpdate(nextProps) {}

  componentDidMount() {
    let fn = `${ns}[componentDidMount]`
    let { salesModels } = this.props;
    logger.info(fn, 'offerId:', this.props.offerId);    
    //need to load all none
    for (var salesModel of salesModels) {
      logger.info(fn, 'salesModel:', salesModel);    
      if (!salesModel.loaded) {
        // this.props.fetchSalesModelByIdentifier(salesModel.identifier);    
      }
      
    }
        
  }

  componentWillUnmount() {

  }
  selectOffer() {
    let fn = `${ns}[selectOffer]`
    logger.info(fn, this.props.offer.identifier);
    this.props.selectOffer(this.props.offer);
  }
  render() {
    let fn = `${ns}[render]`
    let { offer, salesModel, selectedOffer, error, colOrder } = this.props;   
    // logger(fn, 'selectedOffer:', selectedOffer, '', ) 
    let viewState = '';// !selectedOffer.identifier ? '' :  (offer.identifier==selectedOffer.identifier ) ? 'selected' : 'unselected'
    // fetching = true;
    if (error || !salesModel) {
      return <Loader className="offer-panel-container loader-container"/>;
    }
    
    let className = `offer-panel-container ${colOrder} ${viewState}`
    
    return (
      <SalesModelPanelContainer {...{
        offer, salesModel, colOrder, viewState, selectOffer: ()=>{
          this.selectOffer();
        }}}>      
      </SalesModelPanelContainer>     
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(OfferPanelContainer));;

{/* <div className={className}>
<div className="offer-panel-container-overlay"></div>
<SalesModelPanelContainer {...{
  offer, salesModel, colOrder, viewState, selectOffer: ()=>{
    this.selectOffer();
  }}}>      
</SalesModelPanelContainer>        
</div> */}