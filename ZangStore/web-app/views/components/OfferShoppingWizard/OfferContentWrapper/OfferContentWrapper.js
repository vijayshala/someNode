import React, {Component} from 'react';
import styles from './OfferContentWrapper.css'

class OfferContentWrapper extends Component {
  render(){
    let {children} = this.props;    
    return (<div className='offer-content-wrapper'>         
    {children}
    </div> )
  }
} 


export default OfferContentWrapper//injectIntl(OfferPanel)