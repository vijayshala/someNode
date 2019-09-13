import React, {Component} from 'react';
import styles from './SalesModelItemAddonsStep.css'
import OfferFeaturesList from '../OfferFeaturesList'
class SalesModelItemAddonsStep extends Component {
  render(){
    let {children, addons} = this.props;
    return (
    <div className='salesmodel-item-addons-step'>
      <OfferFeaturesList features={addons} />
      {children}
    </div>
    )
  }
}

export default SalesModelItemAddonsStep