import React, {Component} from 'react';
import styles from './FoundNumbers.css'
import Select from 'react-select';

class FoundNumbers extends Component {
  render() {
    let {
      onSelectNumber,
      selectedNumber,
      foundNumbers=[]      
    } = this.props;
    
    const foundNumbersView = foundNumbers && foundNumbers.length > 0  ? (
      <ul>
        {foundNumbers.map((number, index) => {
          return (
            <li key={number.phone_number} className={selectedNumber==number.phone_number ? 'selected' : ''} onClick={(e) => {
              //phone_number
              onSelectNumber(number.phone_number)
            }}>{number.friendly_name}</li>
          )
          })}      
        </ul>  
    ) : (
      <div className="not-found-number-err">{this.props.initalMsg}</div>
    )

    return (
      <div className="number-list">
        {foundNumbersView}
      </div>
    )
  }
}

export default FoundNumbers;

