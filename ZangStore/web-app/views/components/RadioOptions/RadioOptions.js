const ns = '[RadioOption]';
import logger from 'js-logger'
import React, {Component} from 'react';
import styles from './RadioOptions.css'
import { formatCurrency, findCurrency } from '../../../common/currencyFormatter'
class RadioOption extends Component {
  render() {
    let {selected=false, label='', subLabel='', value='', onSelect, children, disabled} = this.props;
    return (
      <div className={`radio-option ${(disabled) ? 'disabled' : ''} ${(selected) ? 'selected' : ''}`} 
        onClick={()=> {
          onSelect(value);
        }}>
        <div className="checkbox-container">
          <div className="box">
            <div className="tick"></div>
          </div>
        </div>
        <div className="text-container">
          { label ? <div className="option-label">{label}</div> : null }
          {subLabel ? <div className="option-sublabel">{subLabel}</div> : null}
          {children}
        </div>
      </div>
    )
  }
}


class RadioOptions extends Component {
  render() {
    let {options=[], className=''} = this.props;
    return (
      <div className={`radio-options ${className}`}>
        {options.map((option, index) => {
          let { currency, price, showPrice=false, priceLabel='' } = option;
          return <RadioOption key={`radio-option-${index}`} {...{ ...option }}>
            {showPrice
              ? <div className='price-component' >{formatCurrency(price, { code: currency })}<span className='price-label'>{priceLabel}</span></div>
              : null}
            </RadioOption>
        })}
      </div>
    )
  }
}

export default RadioOptions