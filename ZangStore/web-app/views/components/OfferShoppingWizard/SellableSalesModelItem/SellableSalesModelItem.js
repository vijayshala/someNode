import React, {Component} from 'react';
import styles from './SellableSalesModelItem.css'
import {InputSpinnerV} from '../../InputSpinner';
import CheckBoxDiv from '../../CheckBoxDiv'
import Price from '../../Price'
import TextResource from '../../TextResource'
import SectionTitle from '../../SectionTitle'
import { getLableFromDescriptions } from '../../../../redux-state/utils';

// Localize Price
import PriceLocalizer from '../../../containers/Localizer/PriceLocalizer';

class SellableSalesModelItem extends Component {
  render() {
    let { currency, quantity = 0, onChange, salesModelItem = {}, showQuantityInput = false, children } = this.props;
    let { title = {} } = salesModelItem
    let included = salesModelItem && salesModelItem.tags && (salesModelItem.tags.indexOf('hide') > -1
      || salesModelItem.tags.indexOf('included') > -1)
    let bestdeal = salesModelItem && salesModelItem.tags && salesModelItem.tags.indexOf('bestdeal') > -1
    let isLockedQuantity = salesModelItem && salesModelItem.tags && salesModelItem.tags.indexOf('quantity-match-item') > -1;
    // if (item && salesModelItem.tags && salesModelItem.tags.indexOf('hide') > -1) { return ''; }
    let shortTitle = getLableFromDescriptions(salesModelItem, 'short-title') || title
    // console.info('description:', salesModelItem);
    return (
      <div className={`sellable-salesmodel-item ${bestdeal > 0 ? 'bestdeal' : ''} ${included ? 'included' : ''} ${quantity > 0 ? 'selected' : ''}`}>
        <div className={`sellable-salesmodel-item-row`} >
          {bestdeal ? <div className="ribbon ribbon-top-right"><span>{global.localizer.get('BEST_DEAL')}</span></div> : null}
          {showQuantityInput && !isLockedQuantity && !included
            ? <InputSpinnerV className="quantity-input" width="150" step={1} value={quantity.toString()} precision={0} onChange={(res) => {
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
            className: 'item-label',
            ...shortTitle
          }}> {included ? <span> (<b>{global.localizer.get('INCLUDED')}</b>) </span> : ''}  </TextResource>
          {!included ? <Price currency={currency} price={isLockedQuantity ? Math.max(quantity * salesModelItem.price, salesModelItem.price) : salesModelItem.price} className='price-component' /> : null}
        </div>
        {children ? <div className="user-type-addons">
          <SectionTitle className="title-divider" label={global.localizer.get('ADD_ONS')} />
          {children}
        </div> : null}
      </div>
    )
  }
} 
  
export default SellableSalesModelItem