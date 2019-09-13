import React, { Component } from 'react';
import styles from './InputText.css'

class InputText extends Component {
  constructor(props) {
    super(props)

  }

  componentWillReceiveProps(nextProps) {

  }

  render() {
    let {
      className = '',
      placeholder = '',
      label = '',
      icon='',
      onChange,
      value,
      error,
      readOnly,
    } = this.props;
    return (
      <div ref={obj=>this.field=obj} className={`store-from-group form-group ${className}`}>
        <label>{label}</label>
        {icon ? <div className={`input-icon right ${icon}`}></div> : ''}

        {!readOnly ? <input className="form-control" onChange={onChange} defaultValue={value} />
          : <div className="read-only-control">{value}</div> }
        {error ? <span className="error-msg">{error}</span> : null}
      </div>
    );
  }
}

export default InputText
