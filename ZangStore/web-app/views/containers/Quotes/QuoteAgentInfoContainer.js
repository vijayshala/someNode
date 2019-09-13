import React, {Component} from 'react';
import {connect} from 'react-redux';

//selectors
import {  getOfferById,  getOfferDefaultSalesModel, getTopLevelOffer,  getOfferByIdentifier } from '../../../redux-state/features/offers/selectors';
import {  getCartInfo, getCurrentCartItemInfo, getCartPrimarySalesModelQty, getConflictingCartItemWithSameSalesModel  } from '../../../redux-state/features/cart/selectors';

class QuoteAgentInfoContainer extends Component {
    render() {

        let {
            offer,
            cart
        } = this.props;
        console.log('CART ----->', cart);

        return(
            <div className="container">
                <div className="row">
                    <div className="col-md-4">
                        <h3>{global.localizer.get('AGENT')}</h3>
                        <div className="form-group">
                            <label> <span className="text-danger"> </span>{global.localizer.get('FIRST_NAME')}</label>
                            <div className="input-icon right native"></div>
                            <i className="fa fa-lock hidden"></i>
                            <input className="form-control" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state, props) => {  
    let identifier = props.identifier;
    let offer = getOfferByIdentifier(state, { identifier });
    let cart = (offer) ? getCartInfo(state, { offer }) : {}; 

    return {
        offer,
        cart
    }
}

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(QuoteAgentInfoContainer);