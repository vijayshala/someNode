import React, { Component } from 'react';
import { formatCurrency } from '../../../../common/currencyFormatter'
import PageTitle from '../../PageTitle';
import Link from '../../Link'
import styles from './QuoteError.css'

class QuoteError extends Component {
  render() {
    let {
      message = global.localizer.get('QUOTE_NOT_FOUND'),
      rightNavItems= [{ url: '/', isExternal: true, label: global.localizer.get('CONTINUE_SHOPPING') }]
    } = this.props;
   return (
      <div className='quote-view-body'>
        <PageTitle label={message}
        rightNavItems={rightNavItems}
        />
      </div>)
  }
}


export default QuoteError

