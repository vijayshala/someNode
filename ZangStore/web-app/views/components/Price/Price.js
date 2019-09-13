const ns = '[Price]';
import logger from 'js-logger'
import React, { Component } from 'react';
import styles from './Price.css'
import currencyFormatter from 'currency-formatter'
import { formatCurrency, findCurrency } from '../../../common/currencyFormatter'



class Price extends Component {
  render(){
    let { currency = 'USD', price = 0.00, className = 'price-component', subInfo = '' } = this.props;   

    let {
      symbol,
      decimalSeparator,
      symbolOnLeft,
      spaceBetweenAmountAndSymbol,
      decimalDigits,
      number,
      desimal
    } = findCurrency(price, currency);
    
    return (
      <div className={className}>
        <div className={`symbol ${symbolOnLeft? 'float-left': 'float-right'}`}>{symbol}</div>
        <div className="value">
          <span className="whole">{number}</span>
          {desimal != null ? <span className="decimals">{decimalSeparator}{desimal}</span> : null}          
        </div>
        {subInfo != null ? <span className="subinfo">{subInfo}</span> : null}
      </div>   
    )
  }
} 


export class PriceFormatter extends Component {
  render(){
    let {
      currency = 'USD',
      price = 0.00,
      className = 'price-formatter',
      subInfo = ''      
    } = this.props; 

    let {
      symbol,
      decimalSeparator,
      symbolOnLeft,
      spaceBetweenAmountAndSymbol,
      decimalDigits,
      number,
      desimal
    } = findCurrency(price, currency);
    return (
      <div className={className}>        
        <div className={`symbol ${symbolOnLeft? 'left': 'right'}`}>{symbol}</div>
        <div className="value">
          <span className="whole">{number}</span>
          {decimalDigits ? <span className="decimals">{decimalSeparator}{desimal}</span> : null}          
        </div>        
      </div>      
    )
  }
} 

export default Price