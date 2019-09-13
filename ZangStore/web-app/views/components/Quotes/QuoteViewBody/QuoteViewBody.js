import React, { Component } from 'react';
import { formatCurrency } from '../../../../common/currencyFormatter'
import PageTitle from '../../PageTitle';
import Link from '../../Link'
import styles from './QuoteViewBody.css'

// components
import CartInfo from '../CartInfo/CartInfo';

class QuoteViewBody extends Component {
  render() {
    let {
      cart,
      cartItems,
      onetime = {
        discount: 0,
        shipping: 0,
        subTotal: 0,
        tax: 0,
        taxDetails: [],
        total: 0
      },
      subscriptions = [],
      currency = 'USD',
      onConfigure,
      hideConfigureBtn,
      disableConfigureBtn,
      backLink, //= { url: '/', isExternal: true, label: global.localizer.get('BACK_TO_QUOTES') }
      children } = this.props;
    let subscription = subscriptions.length ? subscriptions[0] : {};
    let oneTimeTaxes = onetime.taxDetails.length > 0 ? onetime.taxDetails : []

    let flattenedOneTimeTaxes = {};

    oneTimeTaxes.map((t) => {
      let key = t.title.text;
      let val = t.amount;
      flattenedOneTimeTaxes[key] = val;
    })


    // let cartInfo = cart;
    // if (cartItems.length > 0) {
    //   cartInfo = cartItems[0];
    // }
    let rightNavItems = [];
    if (backLink) {
      rightNavItems = [{
        to: backLink.url, isExternal: backLink.isExternal, component: <span>{backLink.label} &#8594;</span>
      }];
    }


    let subTaxes = null;
    if (subscription.taxDetails.length > 0) {
      subTaxes = subscription.taxDetails.map((_atax, index) => {
        return (
          <tr key={`${_atax.title.text}_${index}`} >
            <td colSpan="2"></td>
            <td >
              {global.localizer.get(_atax.title.text)}
            </td>
            <td className="total">
              {formatCurrency(flattenedOneTimeTaxes[_atax.title.text] || 0, { code: currency })}
            </td>
            <td className="total">
              {formatCurrency(_atax.amount || 0, { code: currency })}
            </td>
          </tr>
        )
      })
    }


    return (
      <div className='quote-view-body'>
        <PageTitle label={global.localizer.get('QUOTE')}
          rightNavItems={rightNavItems}
        />
        {location.pathname.split('/')[1] == 'partners' ?
          <div className="quote-link">
            <h4>{global.localizer.get('SHARE_QUOTE_LINK')}</h4>
            {/* {cart.region ? */}
            <input
              className='form-control'
              id="quoteLink"
              type="text"
              onClick={() => {
                document.getElementById('quoteLink').select();
                window.document.execCommand('copy');
              }}
              readOnly={true}
              value={location.origin + '/quotes/' + cart._id}
            />
            {/* '/' + cart.region.toLowerCase() +  */}
            {/* : null} */}
          </div>
          : null}
        <CartInfo cartInfo={cart} />
        {cartItems && cartItems.length ?
          <table className="quote-view-items">
            <thead>
              <tr>
                <th className="remove-btn"></th>
                <th className="title"></th>
                <th className="quantity">{global.localizer.get('QTY')}</th>
                <th className="subtotal">{global.localizer.get('ONETIME_FEE')}</th>
                <th className="subtotal">{global.localizer.get('RECURRING_FEE')}</th>
              </tr>
            </thead>
            <tbody>
              {cartItems}
            </tbody>
            <tfoot>
              <tr className="total-divider">
                <td colSpan="2"></td>
                <td className="total-label" colSpan="3">
                  <hr />
                </td>
              </tr>
              <tr className="sub-total hidden">
                <td colSpan="2"></td>
                <td className="total-label">
                  {global.localizer.get('SUB_TOTAL')}
                </td>
                <td className="total">
                  {formatCurrency(onetime.subTotal ? onetime.subTotal + onetime.discount : 0, { code: currency })}
                </td>
                <td className="total">
                  {formatCurrency(subscription.subTotal ? subscription.subTotal + subscription.discount : 0, { code: currency })}
                </td>
              </tr>

              <tr>
                <td colSpan="2"></td>
                <td className="total-label">
                  {global.localizer.get('SUB_TOTAL')}
                </td>
                <td className="total">
                  {formatCurrency(onetime.subTotal || 0, { code: currency })}
                </td>
                <td className="total">
                  {formatCurrency(subscription.subTotal || 0, { code: currency })}
                </td>
              </tr>

              {subTaxes}
              {cart.region == 'DE' ? null :
                <tr>
                  <td colSpan="2"></td>
                  <td className="total-label">
                    {global.localizer.get('TOTAL_TAXES') + '*'}
                  </td>
                  <td className="total">
                    {
                      oneTimeTaxes[0] ?
                        (formatCurrency(oneTimeTaxes[0].amount || 0, { code: currency })) : (formatCurrency(0, { code: currency }))
                    }
                  </td>
                  <td className="total">
                    {formatCurrency(subscription.tax || 0, { code: currency })}
                  </td>
                </tr>
              }

              <tr className="total-divider">
                <td colSpan="2"></td>
                <td className="total-label" colSpan="3">
                  <hr />
                </td>
              </tr>


              <tr>
                <td colSpan="2"></td>
                <td className="total-label">
                  {global.localizer.get('TOTAL')}
                </td>
                <td className="total">
                  {formatCurrency(onetime.total || 0, { code: currency })}
                </td>
                <td className="total">
                  {formatCurrency(subscription.total || 0, { code: currency })}
                </td>
              </tr>

              <tr>
                <td colSpan="2"></td>
                <td colSpan="2" className="estimated-tax">
                  {global.localizer.get('ESTIMATED_TAX_VALUE')}
                </td>
                <td className="total">
                </td>
              </tr>

              {!hideConfigureBtn ? <tr>
                <td colSpan="2"></td>
                <td colSpan="3">
                  <button className={`btn btn-green btn-checkout ${disableConfigureBtn ? 'disabled' : ''}`}
                    onClick={e => {
                      if (disableConfigureBtn) {
                        return;
                      }
                      onConfigure();
                    }}>{global.localizer.get('CONTINUE_CONFIGURATION')}</button>
                </td>
              </tr> : null}
            </tfoot>
          </table>
          : <div>
            <h3>{global.localizer.get('NO_ITEM_IN_THE_CART')}</h3>
            <Link className="continue-shopping" to="/" isExternal={true}>
              {global.localizer.get('CONTINUE_SHOPPING')} &#8594;
            </Link>
          </div>}
        {children}
      </div>)
  }
}


export default QuoteViewBody


{/* <tr className="promotion-total hidden">
              <td colSpan="2"></td>
              <td className="total-label">
                {global.localizer.get('PROMOTION')}
              </td>
              <td className="total">
                {formatCurrency(onetime.discount || 0, { code: currency })}
              </td>
              <td className="total">
                {formatCurrency(subscription.discount || 0, { code: currency })}
              </td>
            </tr>
            <tr className="total-divider">
              <td colSpan="2"></td>
              <td className="total-label" colSpan="3">                
                <hr/>
              </td>              
            </tr> */}