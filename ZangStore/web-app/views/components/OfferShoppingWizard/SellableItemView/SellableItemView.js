import React, {Component} from 'react';
import styles from './SellableItemView.css'
import {InputSpinnerV} from '../../InputSpinner';
import CheckBoxDiv from '../../CheckBoxDiv'
import Price from '../../Price'
import TextResource from '../../TextResource'
import SalesModelIcon from '../SalesModelIcon'
import { formatCurrency } from '../../../../common/currencyFormatter'
class SellableItemView extends Component {
  render() {
    let { quantity = 0, onChange, salesModelItem, addon, showQuantityInput = false, currency, max } = this.props;
    let item = salesModelItem || addon || {}
    let { title = {} } = item
    
    return (
      <div className={`sellable-item ${quantity>0 ? 'active' : ''}`}>
        <TextResource {...{
          className: 'addon-label',
          ...title
        }} />
        <div className='addon-image'>
          <SalesModelIcon images={item.images} identifier='default' />
        </div>
        <div className='addon-price' >{item.price ? formatCurrency(item.price, { code: currency }) : global.localizer.get('FREE_PRICE')} </div>
        {showQuantityInput
          ? <InputSpinnerV className="quantity-input" max={max} step={1} value={quantity.toString()} precision={0}  onChange={(res) => {            
            let val = res.value;   
            onChange(val);
          }} /> 
          : <CheckBoxDiv {...{
            checked: quantity > 0, onClick: (checked) => {
              onChange(checked ? 1 : 0);
            }
          }} />
        }
        
        
      </div>
    )
  }
} 
  
export default SellableItemView