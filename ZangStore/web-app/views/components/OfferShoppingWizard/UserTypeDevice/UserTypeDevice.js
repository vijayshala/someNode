import React, {Component} from 'react';
import styles from './UserTypeDevice.css'
import {InputSpinnerV} from '../../InputSpinner';
import CheckBoxDiv from '../../CheckBoxDiv'
import SalesModelIcon from '../SalesModelIcon'
import Price from '../../Price'
import TextResource from '../../TextResource'
import { formatCurrency } from '../../../../common/currencyFormatter'
class UserTypeDevice extends Component {
  render() {
    let { currency, quantity = 0, onChange, addon = {}, showQuantityInput = false, max, readOnly=false } = this.props;
    let { title = {}, description = {} } = addon
    let included = addon && addon.tags && (addon.tags.indexOf('hide') > -1
      || addon.tags.indexOf('included') > -1)
    // if (addon && addon.tags && addon.tags.indexOf('hide') > -1) { return ''; }

    console.info('description:', addon);
    return (
      <div className={`usertype-device ${included ? 'included' : ''}`}>
        <div className='addon-image'>
          <SalesModelIcon images={addon.images} identifier='default' />
        </div>
        {readOnly ? <div className="quantity-readonly">({quantity})</div> :
        showQuantityInput && !included
          ? <InputSpinnerV className="quantity-input" max={max} step={1} value={quantity.toString()} precision={0} onChange={(res) => {
            let val = res.value;
            onChange(val);
          }} />
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
        {!included ? <div className='addon-price' >{formatCurrency(addon.price, { code: currency })} </div> : null}
        <span className="per-each">{global.localizer.get('each')}</span>
      </div>
    )
  }
}
  
export default UserTypeDevice