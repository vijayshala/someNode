import React, {Component} from 'react';
import InputSlider from 'react-input-slider';
import styles from './RangeInputSlider.css'

const ns = '[RangeInputSlider]';

class RangeInputSlider extends Component {
  render(){
    let {className='range-input-slider', x=0, xmin=0, onChange, xmax} = this.props;        
    return (
    <div className={className}>
        <InputSlider
          className="slider slider-x"
          axis="x"
          x={x}
          xmin={xmin}
          xmax={xmax} 
          onChange={onChange}
        />
      </div>)
  }
} 


export default RangeInputSlider