import React, {Component} from 'react';
import styles from './OfferFeatureItem.css'
import CheckBoxDiv from '../../CheckBoxDiv'

class OfferFeatureItem extends Component {
  render(){
    let {checked=true, label='', onClick} = this.props;        
    return (<div className='feature-item'>
        <CheckBoxDiv {...{checked, onClick}} /> <div className="feature-label">{label}</div>
      </div> )
  }
} 


export default OfferFeatureItem