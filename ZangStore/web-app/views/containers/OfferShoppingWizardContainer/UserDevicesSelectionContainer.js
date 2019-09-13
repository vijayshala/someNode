const ns = '[UserDevicesSelectionContainer]';
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
// import {  getSelectedOffer } from '../../../redux-state/features/offers/selectors';
import { getCartSubItemsByTag } from '../../../redux-state/features/cart/selectors';
// import { getPrimarySalesItem, getPrimarySalesItemAttributesByTag } from '../../../redux-state/features/salesmodels/selectors';

//containers

//components
import { UserTypeDevice, UserTypeDevices, UserTypeDevicesSelection, SellableItemsHorizaontalScroll } from '../../components/OfferShoppingWizard'
import ModalWindow from '../../components/ModalWindow';
//utils
import { translateResourceField, getLableFromDescriptions } from '../../../redux-state/utils';

const mapStateToProps = (state, props) => { 
  let fn = `${ns}[mapStateToProps]`
  let { offer, salesModel, salesModelItem, tagName} = props; 
  let curItemCartSubItems = tagName ? getCartSubItemsByTag(state, {
    offer,
    salesModel,
    salesModelItem,
    tagName
  }) : {};
// logger.info(fn, 'curItemCartSubItems:', {curItemCartSubItems, tagName})
  return {
    curItemCartSubItems,
  }
};

const mapDispatchToProps = {
  addItemToCart,  
};

class UserDevicesSelectionContainer extends Component {
  constructor(props) {
    super(props); 
    this.state = {
      showNewDevice: false,
    }
  }

  componentWillReceiveProps(nextProps) {

  }

  componentWillUpdate(nextProps) {

  }

  async componentDidMount() {
   
  }

  componentWillUnmount() {

  }

  calculateAllAtrributesQty(quantity, attribute) {
    let {
      attributes = [],
      oneTimeTotal,
      subTotal,
      numOfAddonsSelected,
      selectedAddonName
    } = this.props.curItemCartSubItems;
    let totalQty = 0
    for (var attr of attributes) {
      if (attr.addon._id == attribute._id) {
        totalQty += quantity;
      }
      else {
        totalQty += attr.quantity;
      }      
    }
    return totalQty;
  }

  updateQtyItemToCart(quantity, salesModelItem, attribute) {
    let fn = `${ns}[updateQtyItemToCart]`
    let { 
      offer, 
      salesModel,
      quantity: salesModelItemQty,
    } = this.props;
    let totalAttrQuantities = this.calculateAllAtrributesQty(quantity, attribute);
    logger.info(fn, 'quantity', quantity, 'salesModelItem:', salesModelItem, 'salesModelItemQty', salesModelItemQty, 'totalAttrQuantities', totalAttrQuantities);  
    if (totalAttrQuantities <= salesModelItemQty) {
      this.props.addItemToCart({
        offerIdentifier: offer.identifier,
        quantity,
        salesModel,
        salesModelItem,
        attribute,
        selectedOptions: attribute? {helper: {prepopulated:false, follow: ''}} : null       
      });
    }    
  }
  
  render() {    
    let { showNewDevice } = this.state
    let { 
      currency,
      offer, 
      salesModel,
      salesModelItem,
      quantity: salesModelItemQty,
      curItemCartSubItems = {}      
    } = this.props;

    let {
      attributes=[],
      oneTimeTotal,
      subTotal,
      totalQty,
      selectedAddonName,
    } = curItemCartSubItems

    if (!offer || !salesModel || !salesModelItem) {
      return null;
    }   
    
  
    let addons = attributes
      .filter(attr => attr.quantity > 0)
      .map(attr => {
        logger.info(ns, 'salesModelItem', {
          salesModelItemQty, totalQty, attquantity: attr.quantity, 
          max: salesModelItemQty - totalQty + attr.quantity
        });
      return {
        ...attr, 
        readOnly: true,
        max: salesModelItemQty - totalQty + attr.quantity,
        onEdit: () => {
          this.setState({showNewDevice: true})
        },
        // showQuantityInput: true,
        onChange: (quantity) => {          
          this.updateQtyItemToCart(quantity, salesModelItem, attr.addon)
        }
      }
    }); 

    let selectableDevices = attributes.map(attr => {
      // logger.info(ns, 'attributes.map', attr);
      return {
        ...attr, 
        max: salesModelItemQty - totalQty + attr.quantity, 
        onEdit: () => {
          this.setState({showNewDevice: true})
        },
        // showQuantityInput: true,
        onChange: (quantity) => {
          // logger.info(ns, 'attribute', attribute, 'quantity:', quantity );
          this.updateQtyItemToCart(quantity, salesModelItem, attr.addon)
        }
      }
    }); 
    let pluralUserType = getLableFromDescriptions(salesModelItem, 'title-plural');
    pluralUserType = pluralUserType ? translateResourceField(pluralUserType) : ''
    let modealTitle = global.localizer.get('SELECT_UPTO_DEVICES')
      .replace('{0}', salesModelItemQty)
      .replace('{1}', pluralUserType);
    return (
      <UserTypeDevicesSelection {...{
        ...this.props,
        noOfSelectedDevices: addons.length,
        salesModelItemQty: salesModelItemQty,
        onAdd: () => {
          this.setState({ showNewDevice: true })
        }
      }}
        onChange={(quantity) => {
        // logger.info(ns, 'attribute', attribute, 'quantity:', quantity );
        this.updateQtyItemToCart(quantity || 0, salesModelItem)
      }}>
        {addons.length > 0 ?
          <UserTypeDevices  {...{
            addons
          }} /> : null}
        <ModalWindow {...{          
          title: modealTitle,          
          show: showNewDevice,
          wide: true,
          okButton: {
            label: global.localizer.get('DONE'),
            onClick: () => {
              this.setState({ showNewDevice: false })
            }
          }
        }}> 
          <SellableItemsHorizaontalScroll {...{
            addons: selectableDevices
          }} />
        </ModalWindow>
      </UserTypeDevicesSelection>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserDevicesSelectionContainer);