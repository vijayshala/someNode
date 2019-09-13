import React, { Component } from 'react';
import { formatCurrency } from '../../../../common/currencyFormatter'
import styles from './OfferTotal.css'
import Price from '../../Price'
import TextResource from '../../TextResource'
import SalesModelSelect from '../SalesModelSelect'
import PaymentFrequencyOptions from '../PaymentFrequencyOptions'
class OfferTotal extends Component {
  render() {
    let {
      className = 'offer-total',
      primaryItemQuantity = 0,
      promotions,
      subTotals = { onetime: 0, subscription: 0 },
      onetime = {},
      subscriptions = [],
      currency = 'USD',
      onCheckout,
      checkoutLabel = 'ADD_TO_CART',
      offerSalesModels = [],
      selectedSalesModel,
      onSalesModelChange,
      disableCheckout,
      hideTotals,
      hidePlans,
      region,
      frequencyOptions } = this.props;
    let subscription = subscriptions.length ? subscriptions[0] : {};
    let isGermany = region.countryISO && region.countryISO == 'DE';
    // console.info('subscription:', subscription);    
    // let subscription = subscriptions.length ? subscriptions[0] : null;
    //{global.localizer.get('ONETIME_FEE')}
    //{global.localizer.get('RECURRING_FEE')}
    //<PaymentFrequencyOptions {...{ frequencyOptions }} />  

    const loading = this.props.creating === true ? (
      <button className="btn btn-green btn-add-tocart disabled">
        <img src="/images/loading-spinner-grey.gif" />
      </button>
    ) : (
        <button className={`btn btn-green btn-add-tocart ${disableCheckout ? 'disabled' : ''}`} disabled={disableCheckout}
          onClick={e => {
            onCheckout();
          }}>{global.localizer.get(checkoutLabel)}
        </button>
      )

    return (
      <div className={className} >

        <div className='sub-total-col'>

          {!hideTotals ? <table className="total-table">
            <thead>
              <tr>
                <th ></th>
                <th className="subtotal col2">{global.localizer.get('ONETIME_FEE')}</th>
                <th className="subtotal col3">{global.localizer.get('RECURRING_FEE')}</th>
              </tr>
            </thead>
            <tfoot>
              <tr className="sub-total">
                <td className="total-label">
                  {global.localizer.get('SUB_TOTAL')}
                </td>
                <td className="total col2">
                  {formatCurrency(subTotals.onetime, { code: currency })}
                </td>
                <td className="total col3">
                  {formatCurrency(subTotals.subscription, { code: currency })}
                </td>
              </tr>
              {isGermany ? null :
                <tr className="promotion-total">
                  <td className="total-label">
                    {global.localizer.get('PROMOTION')}
                  </td>
                  <td className="total col2">
                    - {formatCurrency(onetime.discount || 0, { code: currency })}
                  </td>
                  <td className="total col3">
                    - {formatCurrency(subscription.discount || 0, { code: currency })}
                  </td>
                </tr>}
              <tr className={isGermany ? "last-row germany-underline" : "last-row"}>
                <td className="total-label">
                  {global.localizer.get('TOTAL') + '*'} {`(${currency})`}
                </td>
                <td className="total col2">
                  {formatCurrency(onetime.subTotal || 0, { code: currency })}
                </td>
                <td className="total col3">
                  {formatCurrency(subscription.subTotal || 0, { code: currency })}
                </td>
              </tr>
              <tr>
                <td colSpan="3" className="checkout-info">
                  {global.localizer.get('BEFORE_APPLICABLE_TAXES')}
                </td>
              </tr>
              <tr>
                <td colSpan="3" className="total-actions">

                </td>
              </tr>
            </tfoot>
          </table> : null}
          {!hideTotals ? promotions : null}
        </div>
        {isGermany ? hidePlans = true : null}
        <div className='price-item actions'>
          {!hidePlans ?
            <div>
              <div className="plan-label">{
                global.localizer.get('SELECT_A_PLAN')}
              </div>
              <SalesModelSelect {...{ salesModels: offerSalesModels, selectedSalesModel, onChange: onSalesModelChange }} />
              {subscription.billingPeriod ? <div className="billing-frequency"> * {subscription.billingPeriod ?
                subscription.billingPeriod == 'month' && subscription.billingInterval == 1 ?
                  global.localizer.get('BILLED_MONTH') : global.localizer.get('BILLED_MONTH_FREQUENCY').replace('{0}', subscription.billingInterval)
                : subscription.billingPeriod == 'year' && subscription.billingInterval == 1 ?
                  global.localizer.get('BILLED_ANNUALY') : global.localizer.get('BILLED_YEAR_FREQUENCY').replace('{0}', subscription.billingInterval)
              }</div> : null}
            </div> : null}
          {loading}
        </div>
      </div>
    )
  }
}


export default OfferTotal