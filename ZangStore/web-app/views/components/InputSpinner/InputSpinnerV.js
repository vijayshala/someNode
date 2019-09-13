
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import NumericInput from 'react-numeric-input'
NumericInput.SPEED = NumericInput.DELAY = 500;
// import noop from 'noop';
// import toThousands from 'to-thousands';
//https://github.com/afeiship/react-number-spinner
export default class extends PureComponent{
  static propTypes = {
    className:PropTypes.string,
    min:PropTypes.number,
    max:PropTypes.number,
    step:PropTypes.number,
    value:PropTypes.string,
    precision:PropTypes.number,
    readOnly:PropTypes.bool,
    disabled:PropTypes.bool,
    onInputClick:PropTypes.func,
    onChange:PropTypes.func,
    size:PropTypes.string,
    width:PropTypes.string
  };

  static defaultProps = {
    min:0,
    max:100,
    step:10,
    precision:2,
    readOnly:false,
    disabled:false,
    size:'18px',
    width:'100%',
    value:'0.00'
  };

  constructor(props){
    super(props);
    this.state = {
      value:props.value,
      readOnly:props.readOnly,
      disabled:props.disabled,
    };
  }

  change(inValue,inAction){
    var value = inValue;
    this.setState({ value },()=>{
        this.props.onChange({ value, action:inAction });
    });
  }

  _inputChange(value) {
    console.warn('InputSpinner', value);
    this.props.onChange({ value });
    // this.change(value);
    // this.change(value,'input');
  }

  componentWillReceiveProps(nextProps){
    this.setState(nextProps);
  }

  render() {
    
    return (
      <NumericInput {...this.props}
        onChange={this._inputChange.bind(this)} />
    );
  }
}