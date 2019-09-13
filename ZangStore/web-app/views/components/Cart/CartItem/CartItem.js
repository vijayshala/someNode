import React, { Component } from 'react';
import { formatCurrency } from '../../../../common/currencyFormatter'
import styles from './CartItem.css'
import TextResource from '../../TextResource'
import InputSpinner from '../../InputSpinner'
import Link from '../../Link'
class CartItem extends Component {
  render() {
    console.info('CartItem', this.props);
    let { currency='USD', cartItem = {}, onEdit, onChange, onRemove, isRemoveable} = this.props; 
    let { level, quantity = 0, title = {}, additionalInformation = {}, price = 0, isOneTimeCharge = false, offer = {} } = cartItem;
    let showQty = level ? true : false;
    
    title.price = price;

    let subtotalRecurring = 0;
    let subtotalOnetime = 0;

    let isDiscountDevice = '';

    // console.log('----------->', this.props.cartItem);
    if (this.props.cartItem.price && this.props.cartItem.price < 0) {
      isDiscountDevice = 'discount';
    }

    if( quantity > 0 ){
      subtotalRecurring = price * quantity;
      subtotalOnetime = price * quantity;
    }


    let additionalInformationView = additionalInformation && additionalInformation.text ? (
      <span>: {additionalInformation.text}</span>
    ) : null;

    return (
      <tr className={`cart-item level${cartItem.level} ${isDiscountDevice}`}>
        <td className='remove-btn'  >
          {isRemoveable ? <a onClick={(e => {
            onRemove(cartItem);
          })}><img src="/images/delete.png" width="24" title={global.localizer.get('REMOVE')}/></a> : null}
        </td>
        <td className={`title`}>
          {!cartItem.level
          ? <Link className="edit-btn" onClick={e => {
            onEdit(e);
          }}>{(title ? (title.resource ? global.localizer.get(title.resource) : title.text) + ' - ' : '') + global.localizer.get('EDIT')}</Link>
          : <TextResource {...title } />}
          { additionalInformationView }
        </td>
        <td className={`quantity`}>
          {showQty ? <span>{quantity.toString()}</span> : null}
        </td>
        <td className={`subtotal onetime ${isDiscountDevice}`}>{showQty && isOneTimeCharge ? formatCurrency(subtotalOnetime, { code: currency })  : ''}</td>
        <td className='subtotal recurring'>{showQty && !isOneTimeCharge ?  formatCurrency(subtotalRecurring, { code: currency }) : ''}</td>        
    </tr> )
  }
} 

{/* <InputSpinner precision={0} value={quantity.toString()}
            onChange={(res) => {
                let val = res.value;              
                if (val && val > 0) {                
                  onChange({ x: val });
                }
              }}
          />  */}


export default CartItem