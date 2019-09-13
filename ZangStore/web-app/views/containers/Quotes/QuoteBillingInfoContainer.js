const ns = '[QuoteBillingInfoContainer]';
import logger from 'js-logger'
import React, { Component } from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';

//selectors
import {  getOfferById,  getOfferDefaultSalesModel, getTopLevelOffer,  getOfferByIdentifier } from '../../../redux-state/features/offers/selectors';
import {  getCartInfo,  getCartWarning  } from '../../../redux-state/features/cart/selectors';

// actionc
import { updateAccountInfo, validateCartInfo } from '../../../redux-state/features/cart/actions';

//container
import CountriesContainer from '../Countries/CountriesContainer'
import StatesContainer from '../Countries/StatesContainer'

//components
import InputText from '../../components/InputText'

//css
import './Quotes.css';


const mapStateToProps = (state, props) => {  
    let { currentRegion = { data: {addressFormClass: 0}} } = state.status.regions;
    let identifier = props.identifier;
    let offer = getOfferByIdentifier(state, { identifier });
    let cart = (offer) ? getCartInfo(state, { offer }) : {}; 

    return {
        currentRegion: currentRegion.data,
        identifier,
        offer,
        billingAddress: cart.billingAddress,
        warnings: getCartWarning(state, { identifier, filter: ['billingAddress.'] })
    }
}

const mapDispatchToProps = {
    updateAccountInfo,
    validateCartInfo    
}

class QuoteBillingInfoContainer extends Component {
    constructor(props){
        super(props);
        this.state = {
            warnings: {},
            currentCountry: ''
        }
    }

    updateContact(key, val) {
        let { currentRegion = {} } = this.props;
        let billingAddress = { ...this.props.billingAddress || {} };        
        billingAddress[key] = val;
        billingAddress.country = currentRegion.name.text
        billingAddress.countryISO = currentRegion.countryISO
        this.props.updateAccountInfo({
            cartOfferIdentifer: this.props.identifier,
            billingAddress: billingAddress
        });

        this.props.validateCartInfo({
            cartOfferIdentifer: this.props.identifier,
        })
    }

    updateState(currentRegion, state) {
        let fn = `${ns}[updateState]`
        let billingAddress = { ...this.props.billingAddress || {} };   
        billingAddress.country = currentRegion.name.text
        billingAddress.countryISO = currentRegion.countryISO
        billingAddress.state = state.name
        billingAddress.stateISO = state.shortCode
        this.props.updateAccountInfo({
            cartOfferIdentifer: this.props.identifier,
            billingAddress: billingAddress
        });

        this.props.validateCartInfo({
            cartOfferIdentifer: this.props.identifier,
        })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ warnings: nextProps.warnings })
        if (!_.isEqual(this.state.warnings, nextProps.warnings)) {
            if (!_.isEmpty(nextProps.warnings)) {
                // focus on this element 
                window.scrollTo({
                    top: 500,
                    behavior: "smooth"
                });
            }
        }
    }

    componentWillMount() {

    }

    render() {
        let { warnings, billingAddress, currentRegion = {} } = this.props;
        logger.info(ns, 'render billingAddress.country:', billingAddress.country, currentRegion);
        return(
            <div className="billing-address col-md-3">
                <h3 className="checkout-top--quotes">{global.localizer.get('BILLING_ADDRESS')}</h3>
                <InputText {...{
                    label: global.localizer.get('ADDRESS1'),
                    onChange: (e) => {      
                        this.updateContact("address1", e.target.value);
                    },
                    isRequired: true,
                    error: warnings['billingAddress.address1']
                }} />
                
                <InputText {...{
                    label: global.localizer.get('CITY'),
                    onChange: (e) => {      
                        this.updateContact("city", e.target.value);
                    },
                    isRequired: true,
                    error: warnings['billingAddress.city']
                }} />
                
                <InputText {...{
                    label: global.localizer.get('COUNTRY'),
                    value: currentRegion && currentRegion.name && currentRegion.name.text,
                    readOnly: true
                }} />

               {
                    currentRegion && (currentRegion.addressFormClass == 0 || currentRegion.addressFormClass == 1)
                        ? <StatesContainer {...{
                            label: (currentRegion && currentRegion.addressFormClass == 0) ? global.localizer.get('STATE') :  global.localizer.get('PROVINCE'),
                            countryISO: currentRegion && currentRegion.countryISO,
                            onChange: state => {
                                this.updateState(currentRegion, state);
                            },
                            error: warnings['billingAddress.state']
                        }} />
                        : null
                }

                <InputText {...{
                    label: (currentRegion && currentRegion.addressFormClass == 0) ? global.localizer.get('ZIP_CODE') :  global.localizer.get('POSTAL_CODE'),
                    onChange: (e) => {                        
                        this.updateContact("zip", e.target.value);
                    },
                    isRequired: true,
                    error: warnings['billingAddress.zip']
                }} />                
   
            </div>
        )
    }
}

{/* <CountriesContainer {...{
    label: global.localizer.get('COUNTRY'),
    onChange: country => {
        this.setState({ currentCountry: country._id })
        this.updateContact("country", country.name.text);
    },
    error: warnings['billingAddress.country']
}}/> */}

export default connect(mapStateToProps, mapDispatchToProps)(QuoteBillingInfoContainer);