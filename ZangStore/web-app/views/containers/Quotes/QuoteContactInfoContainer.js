import React, {Component} from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';

//selectors
import {  getOfferById,  getOfferDefaultSalesModel, getTopLevelOffer,  getOfferByIdentifier } from '../../../redux-state/features/offers/selectors';
import {  getCartInfo, getCartWarning } from '../../../redux-state/features/cart/selectors';

// actionc
import { updateAccountInfo, validateCartInfo } from '../../../redux-state/features/cart/actions';

//components
import InputText from '../../components/InputText'


// css
import './Quotes.css'
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validatePhone(phone) {
    let re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
    return re.test(String(phone).toLowerCase());
}

const mapStateToProps = (state, props) => {
    let identifier = props.identifier;
    let offer = getOfferByIdentifier(state, { identifier });
    let cart = (offer) ? getCartInfo(state, { offer }) : {};
    let warnings = getCartWarning(state, { identifier, filter: ['contact.'] });
    if (cart.contact.email && !validateEmail(cart.contact.email)) {
        warnings['contact.email'] = global.localizer.get('INVALID_EMAIL')
    }

/*     if (cart.contact.phone && !validatePhone(cart.contact.phone)) {
        warnings['contact.phone'] = global.localizer.get('INVALID_PHONE_NUMBER')
    } */

    return {
        identifier,
        offer,
        contact: cart.contact,
        warnings
    }
}

const mapDispatchToProps = {
    updateAccountInfo,
    validateCartInfo
}

class QuoteContactInfoContainer extends Component {
    constructor(props){
        super(props);
        this.state = {
            warnings: {}
        }
    }

    updateContact(key,val){
        let contact = { ...this.props.contact || {} };
        contact[key] = val;
        this.props.updateAccountInfo({
            cartOfferIdentifer: this.props.identifier,
            contact: contact,
        });

        this.props.validateCartInfo({
            cartOfferIdentifer: this.props.identifier
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


    render() {
        let { warnings, contact } = this.props;        
        return(
            <div className="col-md-3">
                <h3 className="checkout-top--quotes">{global.localizer.get('CONTACT_INFORMATION')}</h3>
                <InputText {...{
                    label: global.localizer.get('FIRST_NAME'),
                    onChange: (e) => {
                        this.updateContact("firstName", e.target.value);
                    },
                    
                    error: warnings['contact.firstName']
                }} />

                <InputText {...{
                    label: global.localizer.get('LAST_NAME'),
                    onChange: (e) => {
                        this.updateContact("lastName", e.target.value);
                    },
                    
                    error: warnings['contact.lastName']
                }} />

                <InputText {...{
                    label: global.localizer.get('EMAIL_ADDRESS'),
                    onChange: (e) => {
                        this.updateContact("email", e.target.value);
                    },
                    error: warnings['contact.email']
                }} />

                 <InputText {...{
                    label: global.localizer.get('CONTACT_PHONE_NUMBER'),
                    onChange: (e) => {
                        this.updateContact("phone", e.target.value);
                    },
                    error: warnings['contact.phone']
                }} />
                
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(QuoteContactInfoContainer);