import React, {Component} from 'react';
import styles from './OfferRegionAutoDetect.css'
import TextResource from '../../TextResource'
import { Link, linkGo } from '../../Link'
import cookie from 'react-cookie';

class OfferRegionAutoDetect extends Component {
  render() {
    let { availableOffers=[] } = this.props;
    return (
      <div className={`choose-your-region-offer`}>
        <h2>{global.localizer.get('THIS_PRODUCT_IS_NOT_OFFERED_IN_YOUR_REGION')}</h2>
        <h3>{global.localizer.get('YOU_CAN_BUY_THIS_PRODUCT_FROM_THESE_REGIONS')}</h3>
        {
          availableOffers.map((offer) => {
            let offerReg = offer.allowed_regions[0];
            let identifier = offer.identifier;
            let url = `/${offerReg.toLowerCase()}/shop/configure/${identifier}`
            return (
              <a key={identifier} href={url} onClick={(e) => {
                //cookie.save('USER_REGION', offerReg, { path: '/' });
                //linkGo(url);
              }} className="region_link">
                <span className="country-flag">
                  <img width="32" src={`/public_nocache/images/regions-flags/${offerReg}.svg`} className="img-flag" />
                </span>
                <TextResource {...offer.title} className="offer-name text-capitalize"/> ( {offerReg} )
              </a>
            )
          })
        }
      </div>
    )
  }
}

export default OfferRegionAutoDetect