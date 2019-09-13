var ns = '[CheckBoxDiv]';

import React, { Component } from 'react';

import './CheckBoxDiv.css';

class CheckBoxDiv extends Component {

  static defaultProps = {
    className: '',
    checked: false,
    disabled: false,
    onClick: (checked) => {
      
    }
  }

  constructor(props) {
    var func = ns + '[constructor]';

    super(props);

    this.state = {
      checked: this.props.checked
    };

  }

  componentWillReceiveProps() {  
    if (this.state.checked != this.props.checked) {
      this.setState({
        checked: this.props.checked
      })
    }    
  }

  render() {
    let { checked, disabled, onClick } = this.props;
    
    return (
      <span className={`checkbox-div ${(checked ? ' checked' : '')} ${(disabled ? ' disabled' : '')}`} onClick={e => {        
        e.stopPropagation();
        e.preventDefault();
        if (disabled) {
          return;
        }
        this.setState({ checked: !checked });
        onClick(!checked);        
      }}></span>
    )
  }
}
export default CheckBoxDiv