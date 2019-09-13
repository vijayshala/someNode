import React, {Component} from 'react';
import styles from './Countries.css'
import Select from 'react-select';
import selectStyle from '../common/react-select.css'// 'react-select/dist/react-select.css';

class States extends Component {
  render() {
    let {
      className = '',
      placeholder = '',
      label = '',
      value,
      error,
      selectedValue,
      onChange,     
      states = []
    } = this.props;   
    console.log('states')
    return (
      <div className={`store-from-group form-group ${className}`}>
      <label>{label}</label>        
      <Select
        name="form-field-name"
        placeholder={placeholder}
        value={selectedValue}
        onChange={onChange}
        clearable={false}
        options={states.map((state, index) => {
          return { value: state, label: state.name }
        })}
      /> 
      {error ? <span className="error-msg">{error}</span> : null}
    </div>
    )
  }
}

export default States