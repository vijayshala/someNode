import React from 'react';
import TextResource from '../../TextResource';
import Price from '../../Price'
import Link from '../../Link'
import styles from './OfferContentHeader.css'
const OfferContentHeader = ({ title, description, perUser = { total: 0, info: '', currency: 'USD' }, actions=[] }) => (
  <div className="offer-content-header header1">
    <div className="left-content">
      {title ? <TextResource {...{ className: 'h1', ...title }} /> : null}
      {description ? <TextResource {...{ className: 'header2 hidden', ...description }} /> : null}  
      <div className="right-content">
        {actions.map(action => {
          return <Link key={action.to} className="btn btn-white round" {...action} >{action.label}</Link>
        })} 
        
        {!perUser.hide ? <Price currency={perUser.currency} price={perUser.total} subInfo={perUser.info} /> : null}
      </div>
    </div>
  </div>
);

export default OfferContentHeader;