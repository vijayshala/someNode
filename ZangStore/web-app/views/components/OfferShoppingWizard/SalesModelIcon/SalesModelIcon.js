import React, {Component} from 'react';
import styles from './SalesModelIcon.css'

class SalesModelIcon extends Component {
  render(){
    let { images=[], className, identifier='icon' } = this.props; 
    for(var image of images) {
      if(image.identifier==identifier){
        return <img src={image.url} className={className} />
      }
    }
    return null    
  }
} 


export default SalesModelIcon//injectIntl(OfferPanel)