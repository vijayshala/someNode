import React, {Component} from 'react';
import styles from './PreSelectedNumbers.css'
import Select from 'react-select';
import selectStyle from '../common/react-select.css'// 'react-select/dist/react-select.css';

class PreSelectedNumbers extends Component {
  render() {
    let {
      placeholder='', 
      selectedValue,
      onPrefixChange,
      preselectedNumbers = []
    } = this.props;    
    return (
      <Select
        name="form-field-name"
        placeholder={placeholder}
        value={selectedValue}
        onChange={onPrefixChange}
        clearable={false}
        options={preselectedNumbers.map((prefixNumber, index) => {
          return { value: prefixNumber, label: prefixNumber }
        })}
      /> 
    )
  }
}

export default PreSelectedNumbers