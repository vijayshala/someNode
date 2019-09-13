import React, { Component } from 'react';
import { formatCurrency } from '../../../../common/currencyFormatter'
import PageTitle from '../../PageTitle';
import Link from '../../Link';
import Loader from '../../Loader';
import './CartBody.css';

class CartBody extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    let {
      cartItems,
      loading,
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
      onCheckout,
      onQuoteSummary,
      disableQuoteSummary,
      disableCheckout,
      children } = this.props;
    let subscription = subscriptions.length ? subscriptions[0] : {};
    return (
      <div className='cart-body'>
        <PageTitle label={global.localizer.get('CART')}
          rightNavItems={
            [{
              to: '/', isExternal: true, component: <span>{global.localizer.get('CONTINUE_SHOPPING')} &#8594;</span>
            }]
          }
        />
        {cartItems && cartItems.length ?
          <table className="cart-items">
            <thead>
              <tr className="cart-header">
                <th className="remove-btn"></th>
                <th className="title"></th>
                <th className="quantity">{global.localizer.get('QTY')}</th>
                <th className="subtotal">{global.localizer.get('ONETIME_FEE')}</th>
                <th className="subtotal">{global.localizer.get('RECURRING_FEE')}</th>
              </tr>
              <tr className="mobile-cart-header">
                <th className="mobile-quantity">{global.localizer.get('QTY')}</th>
                <th className="mobile-subtotal">{global.localizer.get('ONETIME_FEE')}</th>
                <th className="mobile-subtotal">{global.localizer.get('RECURRING_FEE')}</th>
              </tr>
            </thead>
            <tbody>
              {cartItems}
            </tbody>
            <tfoot>
              <tr className="total-divider">
                <td className="remove-btn"></td><td></td>
                <td className="total-label" colSpan="3">
                  <hr />
                </td>
              </tr>
              <tr className="sub-total hidden">
                <td className="remove-btn"></td><td></td>
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
                <td className="remove-btn"></td><td></td>
                <td className="total-label">
                  {global.localizer.get('TOTAL') + '*'} {`(${currency})`}
                </td>
                <td className="total">
                  {formatCurrency(onetime.subTotal || 0, { code: currency })}
                </td>
                <td className="total">
                  {formatCurrency(subscription.subTotal || 0, { code: currency })}
                </td>
              </tr>
              <tr>
                <td className="remove-btn"></td><td></td>
                <td colSpan="3" className="checkout-info">
                  {global.localizer.get('BEFORE_APPLICABLE_TAXES')}
                </td>
              </tr>
              <tr>
                <td className="remove-btn"></td><td></td>
                <td colSpan="3">
                  <button className={`btn btn-green btn-checkout ${disableCheckout ? 'disabled' : ''}`}
                    onClick={e => {
                      if (disableCheckout) {
                        return;
                      }
                      onCheckout();
                  }}>{global.localizer.get('PROCEED_TO_CHECKOUT')}</button>
                  <button className={`btn btn-grey btn-checkout ${disableQuoteSummary ? 'disabled' : ''}`} style={{cursor: 'pointer'}}
                      onClick={e => {
                        if (loading != false) {
                          onQuoteSummary();
                        }
                      }}>{loading == null ? (loading ? <Loader /> : global.localizer.get('EMAIL_ME_CART_SUMMARY')) : global.localizer.get('EMAIL_SENT')}</button>
                </td>
              </tr>
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


export default CartBody


{/* <tr className="promotion-total hidden">
              <td className="remove-btn"></td><td></td>
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