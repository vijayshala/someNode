import React, { Component } from 'react';

import './CartInfo.css';

export default class CartInfo extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let cart = this.props.cartInfo;
        let checked = true;
        // if(cart.shippingAddress.status === "NEW") {
        //     checked = false;
        // }

        let statsClass = ""

        if (cart.status == "NEW") {
            statsClass = "success";
        }
        if (cart.status == "FULFILLED") {
            statsClass = "info";
        }
        if (cart.status == "Declined") {
            statsClass = "danger";
        }

        const sameAsBilling = (
            <div class="checkbox">
                <label class="checkbox-label">
                    <input type="checkbox" checked={checked} />
                    {global.localizer.get('SAME_AS_SHIPPING_ADDRESS')}
                </label>
            </div>
        )

        const showBilling = (
            <div>
                <div className='quote-cart--info-sec'>
                    <b>{global.localizer.get('ADDRESS')}: </b>
                    <span> {cart.shippingAddress.address1 ? cart.shippingAddress.address1 : 'Address'} </span>
                </div>
                <div className='quote-cart--info-sec'>
                    <b>{global.localizer.get('COUNTRY')}: </b>
                    <span> {cart.shippingAddress.country ? cart.shippingAddress.country : 'Country'} </span>
                </div>
                {cart.shippingAddress && cart.shippingAddress.state != "" ?
                    <div className='quote-cart--info-sec'>
                        <b>{global.localizer.get('STATE_PROVINCE')}: </b>
                        <span> {cart.shippingAddress.state ? cart.shippingAddress.state : 'State'} </span>
                    </div>
                    : null}

                <div className='quote-cart--info-sec'>
                    <b>{global.localizer.get('CITY')}: </b>
                    <span> {cart.shippingAddress.city ? cart.shippingAddress.city : 'City'} </span>
                </div>
                <div className='quote-cart--info-sec'>
                    <b>{global.localizer.get('ZIP_POSTAL_CODE')}: </b>
                    <span> {cart.shippingAddress.zip ? cart.shippingAddress.zip : 'Zip'} </span>
                </div>
            </div>
        )

        return (
            <div className="container info-container">
                <div className="col-md-3">
                    <h3>{global.localizer.get('CONTACT_INFORMATION')}</h3>
                    <div className='quote-cart--info-sec'>
                        <b>{global.localizer.get('FIRST_NAME')}: </b>
                        <span> {cart.contact.firstName ? cart.contact.firstName : 'First Name'} </span>
                    </div>
                    <div className='quote-cart--info-sec'>
                        <b>{global.localizer.get('LAST_NAME')}: </b>
                        <span> {cart.contact.lastName ? cart.contact.lastName : 'Last Name'} </span>
                    </div>
                    <div className='quote-cart--info-sec'>
                        <b>{global.localizer.get('EMAIL')}: </b>
                        <span> {cart.contact.email ? cart.contact.email : 'Email'} </span>
                    </div>
                    <div className='quote-cart--info-sec'>
                        <b>{global.localizer.get('PHONE_NUMBER')}: </b>
                        <span> {cart.contact.phone ? cart.contact.phone : '416 995 8123'} </span>
                    </div>
                    <div className='quote-cart--info-sec'>
                        <b>{global.localizer.get('EXPIRES_ON')}: </b>
                        <span> {cart.expireOn ? (new Date(cart.expireOn) + '').split(' ').join(" ").slice(0, 15) : ''} </span>
                    </div>
                </div>

                <div className="col-md-3">
                    <h3>{global.localizer.get('COMPANY_INFORMATION')}</h3>
                    <div className='quote-cart--info-sec'>
                        <b>{global.localizer.get('COMPANY')}: </b>
                        <span> {cart.company.name ? cart.company.name : 'Company Name'} </span>
                    </div>
                    <div className='quote-cart--info-sec'>
                        <b>{global.localizer.get('DOMAIN')}: </b>
                        <span> {cart.company.domain ? cart.company.domain : 'Domain'} </span>
                    </div>
                    <div className='quote-cart--info-sec'>
                        <b>{global.localizer.get('INDUSTRY')}: </b>
                        <span> {cart.company.industry ? cart.company.industry : 'Industry'} </span>
                    </div>
                    {cart.company && cart.company.isIncorporated != undefined ?
                    <div className='quote-cart--info-sec'>
                        <b>{global.localizer.get('COMPANY_INCORPORATED')} </b>
                        <span> {cart.company.isIncorporated === false ? 'No' : 'Yes'} </span>
                    </div>
                    : null }
                    <div className='quote-cart--info-sec'>
                        <b>{global.localizer.get('STATUS')}: </b>
                        <span className={`label label-${statsClass}`}> {cart.status ? cart.status : ''} </span>
                    </div>
                </div>

                <div className="col-md-3">
                    <h3>{global.localizer.get('BILLING_ADDRESS')}</h3>
                    <div className='quote-cart--info-sec'>
                        <b>{global.localizer.get('ADDRESS')}: </b>
                        <span> {cart.billingAddress.address1 ? cart.billingAddress.address1 : 'Address'} </span>
                    </div>
                    <div className='quote-cart--info-sec'>
                        <b>{global.localizer.get('COUNTRY')}: </b>
                        <span> {cart.billingAddress.country ? cart.billingAddress.country : 'Country'} </span>
                    </div>
                    {cart.shippingAddress && cart.shippingAddress.state != "" ?
                        <div className='quote-cart--info-sec'>
                            <b>{global.localizer.get('STATE_PROVINCE')}: </b>
                            <span> {cart.billingAddress.state ? cart.billingAddress.state : 'State'} </span>
                        </div>
                        : null}
                    <div className='quote-cart--info-sec'>
                        <b>{global.localizer.get('CITY')}: </b>
                        <span> {cart.billingAddress.city ? cart.billingAddress.city : 'City'} </span>
                    </div>
                    <div className='quote-cart--info-sec'>
                        <b>{global.localizer.get('ZIP_POSTAL_CODE')}: </b>
                        <span> {cart.billingAddress.zip ? cart.billingAddress.zip : 'Zip'} </span>
                    </div>
                </div>

                <div className="col-md-3">
                    <h3>{global.localizer.get('SHIPPING_ADDRESS')}</h3>
                </div>
                {/* {sameAsBilling} */}
                {showBilling}
            </div>
        )
    }
} 