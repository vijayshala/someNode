import React, {Component} from 'react';
import { formatCurrency } from '../../../common/currencyFormatter'

import './TextResource.css';


class TextResource extends Component {
  render(){
    let { className, text, resource, children } = this.props;
    
    if(!text && !resource) {
      return null;
    }
    return (
    <div className={className}>
      {resource ? global.localizer.get(resource) : text}
      { children }
    </div>
    )
  }
} 
export default TextResource //injectIntl(OfferPanel)