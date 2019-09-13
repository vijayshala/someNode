import React, {Component} from 'react';
import TextResource from '../../TextResource'
import Price from '../../Price'
import styles from './SalesModelPanel.css'
import SalesModelIcon from '../SalesModelIcon'
import Link from '../../Link'
//<SalesModelIcon className='offer-icon' images={salesModel.images || []} />
class SalesModelPanel extends Component {
  render(){
    let { offer, salesModel, colOrder = '', subTotal = 0.00, viewState = '', onSelect, children } = this.props;  
    let region = salesModel.allowed_regions && salesModel.allowed_regions.length ? salesModel.allowed_regions[0].toLowerCase() : 'us';
    let className = `offer-panel-content`    
    return (
    <div className={className}>      
      {salesModel.shortTitle ? <TextResource className='short-title' {...{...salesModel.shortTitle}} />  : null}
      {salesModel.shortDescription ? <TextResource className='short-description' {...{...salesModel.shortDescription}} />  : null}   
      <div className='panel-price'>
        <div className='panel-from'>{global.localizer.get('FROM')}</div>
        <Price className="price-component" price={subTotal} />    
        </div>
        <Link className="btn select-btn " to={`/${region}/shop/configure/${offer.identifier}`} >{(viewState=='selected')? global.localizer.get('SELECTED') : global.localizer.get('BUY_NOW')}</Link>
      <button className="btn select-btn hidden" onClick={onSelect}>{(viewState=='selected')? global.localizer.get('SELECTED') : global.localizer.get('SELECT')}</button>
    {children}
    </div> )
  }
} 

export default SalesModelPanel//injectIntl(OfferPanel)