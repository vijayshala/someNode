import React, {Component} from 'react';
import styles from './SellableAttribute.css'
import {InputSpinnerV} from '../../InputSpinner';
import CheckBoxDiv from '../../CheckBoxDiv'
import Price from '../../Price'
import TextResource from '../../TextResource'
class SellableAttribute extends Component {
  render() {
    let { currency, quantity = 0, onChange, addon = {}, showQuantityInput = false, maxQuantity } = this.props;
    let { title = {}, description = {} } = addon
    let included = addon && addon.tags && (addon.tags.indexOf('hide') > -1
      || addon.tags.indexOf('included') > -1)
    // if (addon && addon.tags && addon.tags.indexOf('hide') > -1) { return ''; }
    
    console.info('SellableAttribute: description:', addon, maxQuantity);
    return (
      <div className={`sellable-addon ${included ? 'included' : 'with-price'}`}>
        {showQuantityInput && !included
          ? <InputSpinnerV className="quantity-input" width="150" step={1} value={quantity.toString()} precision={0} onChange={(res) => {
              let val = res.value;
              onChange(val);
            }} max={maxQuantity} />
          : <CheckBoxDiv {...{
            included,
            checked: quantity > 0 || included, onClick: (checked) => {
              onChange(checked ? 1 : 0);
            }
          }} />
        }
        <TextResource {...{
          className: 'addon-label',
          ...title
        }}> {included ? <span> (<b>{global.localizer.get('INCLUDED')}</b>) </span> : ''}  </TextResource>
        {!included ? <Price currency={currency} price={addon.price} className='price-component' /> : null}
      </div>
    )
  }
}
  
export default SellableAttribute