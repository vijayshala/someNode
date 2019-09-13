import React, {Component} from 'react';
import styles from './PaymentFrequencyOptions.css'
import RadioOptions from '../../RadioOptions'

class PaymentFrequencyOptions extends Component {
  render(){
    let {children, frequencyOptions=[]} = this.props; 

    return (    
      <div className='payment-frequency-options'>
        <RadioOptions options={frequencyOptions} />                   
        {children}
      </div>  
    )
  }
}


export default PaymentFrequencyOptions//injectIntl(OfferPanel)