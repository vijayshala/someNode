import React, {Component} from 'react';
import styles from './OfferPromotionInfo.css'
import TextResource from '../../TextResource'

class OfferPromotionInfo extends Component {
  render() {
    let { currency, discounts=[] } = this.props;
    return (
      <div className={`offer-promotion-info`}>
        {discounts.map((discount, index) => {          
          return <div className="promotion-info"
            key={`promo-info-${index}`}
            dangerouslySetInnerHTML={{__html: discount.label}}
          ></div>
        })}
      </div>
    )
  }
}

export default OfferPromotionInfo