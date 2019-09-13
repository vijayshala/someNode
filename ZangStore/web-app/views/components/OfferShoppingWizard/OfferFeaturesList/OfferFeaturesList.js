import React, {Component} from 'react';
import styles from './OfferFeaturesList.css'
import OfferFeatureItem from '../OfferFeatureItem'
import ContentLimitView from '../../ContentLimitView'
class OfferFeaturesList extends Component {
  render(){
    let {children, features} = this.props; 

    return (    
      <ContentLimitView 
      className='offer-features-list' 
      showMore={{
        open: {
          label: global.localizer.get('HIDE')
        },
        close: {
          label: global.localizer.get('VIEW_COMPLETE_FEATURE_LIST')
        }}}>
          {features.map((feature, index)=>{
            return <OfferFeatureItem key={`feature-key-${index}`} {...{...feature}} />
          })}              
        {children}
      </ContentLimitView>  
    )
  }
}


export default OfferFeaturesList//injectIntl(OfferPanel)