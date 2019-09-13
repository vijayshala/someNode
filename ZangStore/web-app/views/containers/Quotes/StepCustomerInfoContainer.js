const ns = '[StepCustomerInfoContainer]';
import logger from 'js-logger'
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { formatCurrency } from '../../../common/currencyFormatter'

//constants
import { PRODUCT_TAG_DEVICES } from '../../../redux-state/features/salesmodels/constants';

//actions
import { addItemToCart } from '../../../redux-state/features/cart/actions';

//selectors
import { getCartWarning } from '../../../redux-state/features/cart/selectors';

//containers
import QuoteConfigContainer from './QuoteConfigContainer';
import QuoteContactInfoContainer from './QuoteContactInfoContainer';
import QuoteCompanyInfoContainer from './QuoteCompanyInfoContainer';
import QuoteBillingInfoContainer from './QuoteBillingInfoContainer';
import QuoteShippingInfoContainer from './QuoteShippingInfoContainer';

//components
import { SellableItemsHorizaontalScroll } from '../../components/OfferShoppingWizard';
import Price from '../../components/Price';
import { Step } from '../../components/Stepper';

const mapStateToProps = (state, props) => {
  let identifier = props.offer.identifier;

  return {
    warnings: getCartWarning(state, { identifier })
  }
}

const mapDispatchToProps = {

};

class StepCustomerInfoContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isStepViewedOnce: false
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.openState == true) {
      this.setState({ isStepViewedOnce: true });
    }
  }

  componentWillUpdate(nextProps) {
    // if (   this.props.match.params.productSlug ===
    // nextProps.match.params.productSlug &&   this.props.topic && !nextProps.topic
    // ) {   nextProps.history.replace(`/spaces/dashboard`); }
  }

  // Show all the quote validation warnings
  showWarnings(warnings) {
    logger.info('[showWarnings]', warnings);
    let messages = [];
    Object.keys(warnings).forEach(key => {
      // Don't show the empty field wanrings or billing/shipping
      let field = warnings[key].split(' - ')[0];
      if (warnings[key] != global.localizer.get('THIS_FIELD_IS_REQUIRED') && field != global.localizer.get('SHIPPING_INFORMATION') && field != global.localizer.get('BILLING_INFORMATION')) {
        messages.push(warnings[key]);
      }
    });
    // Display warnings if there are any
    if (messages.length > 0)
      return (
        <div className={"quote-error"}>
          {messages}
        </div>
      )
  }

  render() {
    let { isStepViewedOnce } = this.state;
    let {
      offer,
      salesModel,
      warnings,
      stepNumber,
      title,
      hideTitle,
      openState = false,
      completed = false,
      hideNext,
    } = this.props;
    logger.info(ns, 'customer info render');
    if (!offer || !salesModel) {
      return null;
    }

    let params = {
      title: title || global.localizer.get('CUSTOMER_INFORMATION'),
      hideTitle: hideTitle,
      open: openState,
      completed,
      hideNext,
      stepNumber,
      content: <div className="customer-info row">
        <div>
          {this.showWarnings(warnings)}
        </div>
        <QuoteContactInfoContainer identifier={offer.identifier} />
        <QuoteCompanyInfoContainer identifier={offer.identifier} />
        <QuoteBillingInfoContainer identifier={offer.identifier} />
        <QuoteShippingInfoContainer identifier={offer.identifier} />
      </div>,
      col1: {
        line1: '',
        line2: ''
      },
      col2: {
        line1: '',
        line2: ''
      },
      col3: {
        line1: '',
        line2: '',
      },
      onNext: () => {
        this.props.onNext(stepNumber + 1);
      },
      // onBack: () => {
      //   this.props.onNext(stepNumber - 1);
      // },
      onSelect: () => {
        if (isStepViewedOnce) {
          this.props.onSelect(stepNumber);
        }
      },
    }

    return (
      <Step {...params} />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StepCustomerInfoContainer);