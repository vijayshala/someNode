const ns = '[DIDNumberSelectionContainer]';
import logger from 'js-logger'
import React, { Component } from 'react';

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
var ReactTelInput = require('react-telephone-input').default;
import '../../../../public_nocache/public_nocache/stylesheets/react-tel-input/react-tel-input.css'
//import flags from '../../../../public_nocache/public_nocache/images/flag.png';


//constants
import { DID_TYPE_EXISTING, DID_TYPE_TOLLFREE, DID_TYPE_LOCAL } from '../../../redux-state/utils/general.constants'
import { TollFreePrefixes } from './constants'
//actions
// import { createCart } from '../../../redux-state/features/cart/actions';
// import { fetchShoppingWizardDefaults } from '../../../redux-state/features/offers/actions';

//selectors
import { getSelectedOffer, getOfferDefaultSalesModel } from '../../../redux-state/features/offers/selectors';
import { getCartInfo, getCartPrimarySalesModelQty } from '../../../redux-state/features/cart/selectors';

//containers

//components
import { FoundNumbers, PreSelectedNumbers, SearchNumber } from '../../components/DIDNumberSelection';
import Loader from '../../components/Loader';
//utils
import { FetchRest } from '../../../redux-state/middleware/fetchRest';
import CountryTelData from '../../../redux-state/utils/CountryTelData';
import { translateResourceField } from '../../../redux-state/utils'
const fetchRest = new FetchRest();

const mapStateToProps = (state, props) => {
  let fn = `${ns}[mapStateToProps]`
  return {

  }
};

const mapDispatchToProps = {

};


class DIDNumberSelectionContainer extends Component {
  constructor(props) {
    super(props);
    this.state = this.initState();

  }

  initState() {
    return {
      selectedNumber: '',
      selectedPrefix: '',
      fetching: false,
      foundNumbers: [],
      error: null,
      initalMsg: ''
    }
  }


  componentWillReceiveProps(nextProps) {
    let fn = `${ns}[componentWillReceiveProps]`
    // logger.info(fn, 'props', this.props, nextProps, this.state);
    if (this.props.selectedDIDType != nextProps.selectedDIDType
      || this.props.provider != nextProps.provider) {
      // logger.info(fn, 'change-info');
      this.setState(this.initState());
    }
  }

  componentWillUpdate(nextProps) {

  }
  componentDidMount() {
    // logger.info(ns, 'this.existingNumber:', this.existingNumber);
  }

  componentWillUnmount() { }

  shuffleArray(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
      j = Math.floor(Math.random() * i);
      x = a[i - 1];
      a[i - 1] = a[j];
      a[j] = x;
    }
    return a;
  }

  handleFetchNumbers = (country, prefix) => {
    let fn = `${ns}[handleFetchNumbers]`
    let url = `/clientapi/dids/availablenumbers/${this.props.provider}/${country}/${prefix}`
    logger.info(fn, 'url:', url);
    this.setState({ foundNumbers: [], fetching: true, error: null, selectedNumber: '' });
    return fetchRest.fetch(url, { method: 'GET' }).then(response => {
      logger.info(fn, 'fetch.then response:', response);
      if (response.data.length === 0) {
        this.setState({ foundNumbers: this.shuffleArray(response.data) || [], fetching: false, initalMsg: 'Can Not Find a Number' });
      } else {
        this.setState({ foundNumbers: this.shuffleArray(response.data) || [], fetching: false });
      }
    }).catch((error) => {
      logger.error(fn, error);
      this.setState({ foundNumbers: [], fetching: false, error });
    })
  }

  render() {
    let { selectedDIDType, onChange, currentRegion, infoOnly } = this.props;
    let { fetching, foundNumbers, error, selectedNumber } = this.state;
    logger.info(ns, 'selectedDIDType:', selectedDIDType);
    let countryISO = (currentRegion && currentRegion.countryISO || 'us').toLowerCase();
    let countryPhoneData = CountryTelData.getByIso2(countryISO);
    countryPhoneData.name = translateResourceField(currentRegion.name) || countryPhoneData.name;

    return (
      <div className="did-number-selection">
        <div className={`subtitle ${selectedDIDType != DID_TYPE_EXISTING ? 'hidden' : ''}`} >{global.localizer.get('ENTER_EXISTING_NUMBER_YOU_PLAN_TO_TRANSFER')}</div>
        <div className={`stepper-foot-note ${selectedDIDType != DID_TYPE_EXISTING ? 'hidden' : ''}`}>* {global.localizer.get('USE_EXISTING_NUMBER_POPUP_INFORMATION')}</div>
        {selectedDIDType == DID_TYPE_EXISTING && !infoOnly ?
          <ReactTelInput
          defaultCountry={countryISO}
          flagsImagePath='/public_nocache/images/flags.png'
          onlyCountries={[countryPhoneData]}
          onChange={(telNumber, country) => {
            console.log(telNumber, country)
            let val = telNumber || '';
            if (val) {
              val = val
                .replace(/_/g, '')
            }

            onChange(val);
          }}
        /> : null}

        {selectedDIDType == DID_TYPE_TOLLFREE && !infoOnly ?
          <div>
            <PreSelectedNumbers {...{
              placeholder: global.localizer.get('SELECT_A_PREFIX') + '...',
              selectedValue: this.state.selectedPrefix,
              onPrefixChange: (prefix) => {
                this.setState({ selectedPrefix: prefix }, () => {
                  logger.info(ns, 'selectedPrefix:', prefix);
                  this.handleFetchNumbers(countryISO, prefix.value);
                });

              },
              preselectedNumbers: TollFreePrefixes || []
            }} /></div>
          : null}
        {selectedDIDType == DID_TYPE_LOCAL && !infoOnly
          ? <div>
            <SearchNumber {...{
              disabled: false,
              onSearch: (searchValue) => {
                // Don't search if there is no input
                if (searchValue.length > 0) {
                  this.handleFetchNumbers(countryISO, searchValue);
                }
              }
            }}
            /></div>
          : null}
        {[DID_TYPE_TOLLFREE, DID_TYPE_LOCAL].indexOf(selectedDIDType) > -1 && !fetching && !infoOnly
          ? <div><FoundNumbers {...{
            selectedNumber,
            onSelectNumber: (selectedNumber) => {
              this.setState({ selectedNumber });
              onChange(selectedNumber)
            },
            foundNumbers: foundNumbers,
            initalMsg: this.state.initalMsg
          }} />
          <div className="stepper-foot-note">* {global.localizer.get('PURCHASE_NUMBER_DISCLAIMER')}</div></div>
          : null}
        {fetching ? <Loader className="loader-container" /> : null}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DIDNumberSelectionContainer);
