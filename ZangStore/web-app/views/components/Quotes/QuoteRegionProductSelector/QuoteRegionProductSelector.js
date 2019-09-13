import React, { Component } from 'react';
import './QuoteRegionProductSelector.css'
import TextResource from '../../TextResource'
import InputSpinner from '../../InputSpinner'
import Link from '../../Link'
class QuoteRegionProductSelector extends Component {
  render() {
    console.info('QuoteViewItem', this.props);
    let {
      selectedRegion,
      regions = [],
      offers = [],
      onRegionsChange,
      onProductsChange,
    } = this.props;
   
    return (
      <div className="regions-products-selection-form">
        <div className={`store-from-group form-group `}>
          <label>{global.localizer.get('REGION')}</label>

          <select className="form-control" onChange={onRegionsChange}>
            {(regions.length > 0) ? 
              regions.map((region) => {
                return (
                  <option value={region._id}
                    key={region._id}
                    selected={selectedRegion && selectedRegion.shortCode == region.shortCode}
                  >
                    {region.name.text}
                  </option>
                )
              })
            : null}
          </select>
        </div>
        
        <div className={`store-from-group form-group`}>
          <label>{global.localizer.get('OFFER')}</label>

          <select className="form-control" onChange={onProductsChange} >
            {
              offers.map((offer) => {
                return (
                  <option value={offer._id}
                    key={offer._id}>
                    {offer.title ? offer.title.resource
                      ? global.localizer.get(offer.title.resource)
                      : offer.title.text
                      : offer.identifier}
                  </option>
                )
              })
            }
          </select>
        </div>

      </div>
    )
  }
} 



export default QuoteRegionProductSelector