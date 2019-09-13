import React, {Component} from 'react';
import styles from './SelectSalesModelItems.css'
import RadioOptions from '../../RadioOptions'

class SelectSalesModelItems extends Component {
  render() {
    let {children, phoneSelectionOptions=[]} = this.props;
    let className = phoneSelectionOptions.length>=3? 'three-columns' : 'two-columns'
    return (
      <div className="select-main-phonenumber">
        <RadioOptions className={className} options={phoneSelectionOptions} withPrice={true} />  
        
        {children}    
      </div>
    )
  }
}

export default SelectSalesModelItems