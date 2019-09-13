
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './InputSpinner.css';
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
    pulsText:PropTypes.string,
    minusText:PropTypes.string,
    size:PropTypes.string,
    width:PropTypes.string,
    showThousand:PropTypes.bool
  };

  static defaultProps = {
    min:0,
    max:100,
    step:10,
    precision:2,
    readOnly:false,
    disabled:false,
    showThousand:false,
    // onInputClick:noop,
    // onChange:noop,
    pulsText:'+',
    minusText:'-',
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

  _click(args, ev) {
    ev.stopPropagation();
    ev.preventDefault();
    this[args]();    
  }

  _inputChange(ev){
    var value = ev.target.value ;
    this.change(value);
    this.change(value,'input');
  }

  plus(){
    var oldValue = parseFloat(this.state.value);
    var value = oldValue + this.props.step;
    var min = this.props.min;
    var max = this.props.max;
    switch(true){
      case oldValue<min:
        value = Math.max(min,value);
      break;
      case oldValue>=min && oldValue<=max:
        if(value>max){
          value = max;
        }
      break;
      case oldValue>max:
        value = oldValue;
      break;
    }

    this.change(value,'plus');
  }

  minus(){
    var oldValue = parseFloat(this.state.value);
    var value = oldValue - this.props.step;
    var min = this.props.min;
    var max = this.props.max;

    switch(true){
      case oldValue<min:
        value = oldValue;
      break;
      case oldValue>=min && oldValue<=max:
        if (value < min) {
          value = min;
        }
      break;
      case oldValue>max:
        value = max;
      break;
    }

    // if(oldValue<max){
    //   if (oldValue < min) {
    //     value = oldValue;
    //   } else {
    //     if (value < min) {
    //       value = min;
    //     }
    //   }
    // }else{
    //   value = Math.min(max,value);
    // }

    this.change(value,'minus');
  }

  change(inValue,inAction){
    var value = inValue;
    this.setState({ value },()=>{
        this.props.onChange({ value, action:inAction });
    });
  }

  componentWillReceiveProps(nextProps){
    this.setState(nextProps);
  }

  processValue(inValue){
    var precisionValue = inValue ? parseFloat(inValue).toFixed(this.props.precision) : inValue;
    // if(this.props.showThousand){
    //   return toThousands(precisionValue);
    // }
    return precisionValue;
  }

  render(){
    return (
      <div
        style={{
          width:this.props.width,
          fontSize:this.props.size
        }}
        className={classNames('react-number-spinner',this.props.className)}>
        <button
          disabled={this.state.value >= this.props.max}
          className="plus" onClick={this._click.bind(this,'plus')}>
          <span>{this.props.pulsText}</span>
        </button>
        <button
          disabled={this.state.value <= this.props.min}
          className="minus" onClick={this._click.bind(this,'minus')}>
          <span>{this.props.minusText}</span>
        </button>
        <input className="input" pattern='[0-9]*'
          readOnly={this.state.readOnly}
          disabled={this.state.disabled}
          onClick={this.props.onInputClick}
          value={this.processValue(this.state.value)}
          onChange={this._inputChange.bind(this)} />
      </div>
    );
  }
}