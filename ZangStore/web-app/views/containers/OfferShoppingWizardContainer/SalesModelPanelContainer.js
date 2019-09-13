const ns = '[SalesModelPanelContainer]';
import logger from 'js-logger'
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

//actions
import { fetchSalesModelByIdentifier } from '../../../redux-state/features/salesmodels/actions';
import { initCartInfoByOffer } from '../../../redux-state/features/cart/actions';

//selectors
import { getSalesModelByIdentifier,  getSalesModelStatus, getPrimarySalesItem } from '../../../redux-state/features/salesmodels/selectors';
import { getOfferDefaultSalesModel } from '../../../redux-state/features/offers/selectors';
import { getCartInfo, getCartPrimarySalesModelQty } from '../../../redux-state/features/cart/selectors';

//components
import {SalesModelPanel} from '../../components/OfferShoppingWizard';
import Loader from '../../components/Loader';


const mapStateToProps = (state, props) => {  
  let fn = `${ns}[mapStateToProps]`
  let { offersByCategory } = state.status
  let { salesModel, selected, offer } = props;   
  let salesModelItem = getPrimarySalesItem(state, { salesModelId: salesModel._id })
  let salesModelStatus = getSalesModelStatus(state, salesModel.identifier)  
  return {
    fetching: salesModelStatus.fetching,    
    salesModel,
    salesModelItem,
  }

  //TOTO: can be used for compare chart
  // let salesModelStatus = getSalesModelStatus(state, salesModel.identifier)  
  // let cart = getCartInfo(state, props)  
  // let primaryItemQuantity = getCartPrimarySalesModelQty(state, props) 
  // let subscription = cart && cart.subscriptions && cart.subscriptions.length && cart.subscriptions[0] || null
  // logger.info(fn, { salesModel, cart, subscription });
  // return {
  //   fetching: salesModelStatus.fetching,    
  //   salesModel, 
  //   cart,
  //   subscription,
  //   primaryItemQuantity
  // }
};

const mapDispatchToProps = {
  fetchSalesModelByIdentifier, 
  initCartInfoByOffer  
};

class SalesModelPanelContainer extends Component {
  constructor(props) {
    super(props);

  }

  componentWillReceiveProps(nextProps) {
    let fn = `${ns}[componentWillReceiveProps]`;
    logger.info(fn, 'nextProps:', nextProps)
    if (this.props.salesModel._id != nextProps.salesModel._id
    && !nextProps.salesModel.items) {
      // this.props.fetchSalesModelByIdentifier(nextProps.salesModel.identifier);
    }
    else if (
      // !this.props.salesModel && nextProps.salesModel ||
      nextProps.salesModel && this.props.salesModel &&       
      (
        this.props.salesModel._id != nextProps.salesModel._id
        || !this.props.salesModel.items && nextProps.salesModel.items)
      // / && this.props.salesModel.items.length!= nextProps.salesModel.items.length
    ) {      
      logger.info(ns, '[componentWillReceiveProps]', this.props.salesModel, nextProps.salesModel)
      //TODO: since decopled wizard and panels view we don't init cart
      //this may be needed when we introduce compare
      // this.props.initCartInfoByOffer(nextProps.offer.identifier, nextProps.salesModel);
    }

  }

  componentWillUpdate(nextProps) {}

  componentDidMount() {
    let fn = `${ns}[componentDidMount]`
    logger.info(fn, 'salesModel:', this.props)
    if (this.props.salesModel && !this.props.salesModel.loaded) {
      this.props.fetchSalesModelByIdentifier(this.props.salesModel.identifier);
    }
    
    if (this.props.salesModel && this.props.salesModel.loaded) {
      //TODO: since decopled wizard and panels view we don't init cart
      //this may be needed when we introduce compare
      // this.props.initCartInfoByOffer(this.props.offer.identifier, this.props.salesModel);  
    }    
  }

  componentWillUnmount() {

  }


  render() {
    let fn = `${ns}[render]`
    let { offer, salesModel, cart, fetching, error, colOrder, viewState, selectedCategory, subscription, salesModelItem } = this.props;    
    // fetching = true;\
    
    if (fetching || error || !salesModel || !salesModel.loaded) {
      return <Loader className="offer-panel-container loader-container"/>;
    }
    var subTotal = salesModelItem.price;// subscription && subscription.subTotal || 0;    
    // var primaryItemQuantity = this.props.primaryItemQuantity || 1;
    // subTotal = (subTotal / primaryItemQuantity ).formatDollars(2);
    let className = `offer-panel-container ${colOrder} `//${this.props.viewState}
    // console.log(fn, '================', subtotal,  fetching)
    return (
      <div className={className}>
        <div className="offer-panel-container-overlay"></div>
        <SalesModelPanel {...{
          offer, salesModel, colOrder, viewState, subTotal: subTotal, onSelect: () => {            
            this.props.selectOffer();        
        } }}>      
        </SalesModelPanel>        
      </div>  
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SalesModelPanelContainer));;