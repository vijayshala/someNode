import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

//selectors
import { getOfferById, getOfferDefaultSalesModel, getTopLevelOffer, getOfferByIdentifier } from '../../../redux-state/features/offers/selectors';
import { getCartInfo, getCartWarning } from '../../../redux-state/features/cart/selectors';

// actionc
import {
    updateAccountInfo,
    validateCartInfo,
    setCartShippingSameAsBilling
} from '../../../redux-state/features/cart/actions';

//container
import CountriesContainer from '../Countries/CountriesContainer'
import StatesContainer from '../Countries/StatesContainer'

//components
import InputText from '../../components/InputText'

// css
import './Quotes.css';

const mapStateToProps = (state, props) => {
    let { currentRegion = { data: { addressFormClass: 0 } } } = state.status.regions;
    let identifier = props.identifier;
    let offer = getOfferByIdentifier(state, { identifier });
    let cart = (offer) ? getCartInfo(state, { offer }) : {};

    return {
        currentRegion: currentRegion.data,
        identifier,
        offer,
        shippingAddress: cart.shippingAddress,
        warnings: getCartWarning(state, { identifier, filter: ['shippingAddress.'] })
    }
}

const mapDispatchToProps = {
    updateAccountInfo,
    validateCartInfo,
    setCartShippingSameAsBilling
}
class QuoteShippingInfoContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            same_as_billing: false,
            shippingAddress: {
                address1: '',
                city: '',
                country: '',
                state: '',
                zip: ''
            },
            currentCountry: '',
            warnings: {}
        }
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

    updateContact(key, val) {
        let { currentRegion = {} } = this.props;
        let shippingAddress = { ...this.props.shippingAddress || {} };
        shippingAddress[key] = val;
        shippingAddress.country = currentRegion.name.text
        shippingAddress.countryISO = currentRegion.countryISO

        this.state.shippingAddress[key] = val;
        this.state.shippingAddress.country = currentRegion.name.text
        this.state.shippingAddress.countryISO = currentRegion.countryISO

        this.props.updateAccountInfo({
            cartOfferIdentifer: this.props.identifier,
            shippingAddress: shippingAddress
        });

        this.props.validateCartInfo({
            cartOfferIdentifer: this.props.identifier,
        })
    }

    updateState(currentRegion, state) {
        let shippingAddress = { ...this.props.shippingAddress || {} };
        shippingAddress.country = currentRegion.name.text
        shippingAddress.countryISO = currentRegion.countryISO
        shippingAddress.state = state.name
        shippingAddress.stateISO = state.shortCode
        this.props.updateAccountInfo({
            cartOfferIdentifer: this.props.identifier,
            shippingAddress: shippingAddress
        });

        this.props.validateCartInfo({
            cartOfferIdentifer: this.props.identifier,
        })
    }

    makeSameAsBilling = (e) => {
        this.props.setCartShippingSameAsBilling({
            cartOfferIdentifer: this.props.identifier,
            sameAsBilling: e.target.checked
        });

        if (!e.target.checked) {

            this.props.updateAccountInfo({
                cartOfferIdentifer: this.props.identifier,
                shippingAddress: this.state.shippingAddress
            });
        }

        this.setState({ same_as_billing: e.target.checked });
    }

    render() {
        let { warnings, shippingAddress, currentRegion = {} } = this.props;

        return (
            <div className="col-md-3">
                <h3 className="checkout-top--quotes">{global.localizer.get('SHIPPING_ADDRESS')}</h3>
                <input type="checkbox" checked={this.state.same_as_billing} onClick={(e) => {
                    this.makeSameAsBilling(e);
                }} />
                <span className="same-as-billing">{global.localizer.get('SAME_AS_BILLING_ADDRESS')}</span>

                {
                    !this.state.same_as_billing ? (
                        <div>
                            <InputText {...{
                                label: global.localizer.get('ADDRESS1'),
                                onChange: (e) => {
                                    this.updateContact("address1", e.target.value);
                                },
                                error: warnings['shippingAddress.address1']
                            }} />

                            <InputText {...{
                                label: global.localizer.get('CITY'),
                                onChange: (e) => {
                                    this.updateContact("city", e.target.value);
                                },
                                error: warnings['shippingAddress.city']
                            }} />

                            <InputText {...{
                                label: global.localizer.get('COUNTRY'),
                                onChange: (e) => {
                                    this.updateContact("country", e.target.value);
                                },
                                value: currentRegion && currentRegion.name && currentRegion.name.text,
                                readOnly: true
                            }} />

                            {
                                currentRegion && (currentRegion.addressFormClass == 0 || currentRegion.addressFormClass == 1)
                                    ? <StatesContainer {...{
                                        label: (currentRegion && currentRegion.addressFormClass == 0) ? global.localizer.get('STATE') : global.localizer.get('PROVINCE'),
                                        countryISO: currentRegion && currentRegion.countryISO,
                                        onChange: state => {
                                            this.updateState(currentRegion, state);
                                        },
                                        error: warnings['shippingAddress.state']
                                    }} />
                                    : null
                            }

                            <InputText {...{
                                label: (currentRegion && currentRegion.addressFormClass == 0) ? global.localizer.get('ZIP_CODE') : global.localizer.get('POSTAL_CODE'),
                                onChange: (e) => {
                                    this.updateContact("zip", e.target.value);
                                },
                                isRequired: true,
                                error: warnings['shippingAddress.zip']
                            }} />
                        </div>
                    ) : null
                }
            </div>
        )
    }
}



export default connect(mapStateToProps, mapDispatchToProps)(QuoteShippingInfoContainer);