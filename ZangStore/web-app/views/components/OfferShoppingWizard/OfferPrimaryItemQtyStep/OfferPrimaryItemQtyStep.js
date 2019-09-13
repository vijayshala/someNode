import React, { Component } from 'react';
import styles from './OfferPrimaryItemQtyStep.css'
import { RangeInputSlider } from '../../InputSlider'
import InputSpinner from '../../InputSpinner';

class OfferPrimaryItemQtyStep extends Component {
  render(){
    let {minQuantity=1, maxQuantity=100000, quantity=0, onChange, children} = this.props;          
    if(minQuantity>maxQuantity){
      maxQuantity = minQuantity * 100      
    } 
    
    return (
      <div className='offer-user-step'>
        <div className="input-group hidden">          
          <div className="info">
            {global.localizer.get('ENTER_NUMBER_OF_USERS')}         
            <div className="sub-info">{global.localizer.get('REVIEW_OUR_VOLUME_DISCOUNT_BREAKDOWN')}</div>        
          </div>
          <InputSpinner className="user-count"
            step={1}
            value={quantity.toString()}
            precision={0}
            min={minQuantity}
            max={maxQuantity}
            onChange={(res) => {
              let val = res.value;                            
              if (val && val > 0) {                
                onChange({ x: (val < minQuantity) ? minQuantity : (val > maxQuantity) ? maxQuantity : val });
              }
            }} />
        </div>
        {children}  
    </div>
    )
  }
}

export default OfferPrimaryItemQtyStep


{/* <input className="user-count" value={quantity} min={minQuantity} max={maxQuantity} onChange={(e)=>{
  let val = e.target.value;   
  if (val && val>0) {
    onChange({x:(val<minQuantity)? minQuantity : (val>maxQuantity) ? maxQuantity : val});  
  }            
}} /> */}

// {minQuantity ? <div className="min-qty">{minQuantity}</div> : null}
//           <RangeInputSlider {...params}  />
//           {maxQuantity ? <div className="max-qty">{maxQtyDisplay}</div> : null}   