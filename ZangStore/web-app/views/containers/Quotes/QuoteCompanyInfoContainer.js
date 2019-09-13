import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

//selectors
import { getOfferByIdentifier } from '../../../redux-state/features/offers/selectors';
import { getCartInfo, getCartWarning } from '../../../redux-state/features/cart/selectors';

//components
import InputText from '../../components/InputText'
import Incorporated from '../../components/Incorporated';

// actionc
import { updateAccountInfo, validateCartInfo } from '../../../redux-state/features/cart/actions';

//css
import './Quotes.css';
function validateDomain(domain) {
    let re = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
    return re.test(String(domain).toLowerCase());
}
const mapStateToProps = (state, props) => {
    let identifier = props.identifier;
    let offer = getOfferByIdentifier(state, { identifier });
    let cart = (offer) ? getCartInfo(state, { offer }) : {};
    let { currentRegion = { data: { addressFormClass: 0 } } } = state.status.regions;

    let warnings = getCartWarning(state, { identifier, filter: ['company.'] });
    if (cart.company.domain && !validateDomain(cart.company.domain)) {
        warnings['company.domain'] = global.localizer.get('INVALID_DOMAIN_FORMAT')
    }

    return {
        identifier,
        offer,
        company: cart.company,
        warnings,
        currentRegion
    }
}

const mapDispatchToProps = {
    updateAccountInfo,
    validateCartInfo
}

class QuoteCompanyInfoContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            warnings: {}
        }
    }

    updateCompany(key, val) {
        let company = { ...this.props.company || {} };
        company[key] = val;
        this.props.updateAccountInfo({
            cartOfferIdentifer: this.props.identifier,
            company: company,
        })

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
        let { warnings, company, currentRegion = {} } = this.props;
        return (
            <div className="company-info col-md-3">
                <h3 className="checkout-top--quotes">{global.localizer.get('COMPANY_INFORMATION')}</h3>
                <InputText {...{
                    label: global.localizer.get('NAME'),
                    onChange: (e) => {
                        this.updateCompany("name", e.target.value);
                    },
                    error: warnings['company.name']
                }} />

                <InputText {...{
                    label: global.localizer.get('DOMAIN'),
                    onChange: (e) => {
                        this.updateCompany("domain", e.target.value);
                    },
                    error: warnings['company.domain']
                }} />

                <div className="form-group">
                    <label> <span className="text-danger"> </span>{global.localizer.get('INDUSTRY')}</label>
                    <select name="company.industry" className="form-control"
                        onChange={(e) => {
                            this.updateCompany("industry", e.target.value);
                        }}
                    ><option value=""> {global.localizer.get('SELECT_ONE')} </option>
                        <option value="Design">{global.localizer.get('DESIGN')}</option>
                        <option value="Education">{global.localizer.get('EDUCATION')}</option>
                        <option value="Government">{global.localizer.get('GOVERNMENT')}</option>
                        <option value="Healthcare">{global.localizer.get('HEALTHCARE')}</option>
                        <option value="Insurance">{global.localizer.get('INSURANCE')}</option>
                        <option value="Other">{global.localizer.get('OTHER')}</option>
                        <option value="Technology">{global.localizer.get('TECHNOLOGY')}</option>
                        <option value="Transportation">{global.localizer.get('TRANSPORTATION')}</option>
                    </select>
                    {
                        warnings['company.industry'] ? (
                            <span className="error-msg" style={{ 'color': 'red' }}>{warnings['company.industry']}</span>
                        ) : null
                    }
                </div>

                {
                    (currentRegion.data && currentRegion.data.countryISO != 'DE')
                        ? <Incorporated
                            onChange={(e) => this.updateCompany("isIncorporated", e.target.value)}
                            error={warnings['company.isIncorporated']}
                        />
                        : null
                }

            </div>
        )
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(QuoteCompanyInfoContainer);