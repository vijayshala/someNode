import React, {Component} from 'react';
import styles from './SelectMainPhoneNumber.css'
import RadioOptions from '../../RadioOptions'
class SelectMainPhoneNumber extends Component {
  render() {
    let {children, phoneSelectionOptions=[]} = this.props;
    let className = phoneSelectionOptions.length>=3? 'three-columns' : 'two-columns'
    return (
      <div className="select-main-phonenumber">
        <RadioOptions className={className} options={phoneSelectionOptions} />    
        {children}    
      </div>
    )
  }
}

export default SelectMainPhoneNumber