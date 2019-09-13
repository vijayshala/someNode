import React, {Component} from 'react';
import IntlMessageFormat from 'intl-messageformat';

export default class PriceLocalizer extends Component {
    constructor(props){
        super(props)
    }

    render() {
        return(
            <div className={this.props.className}>
                <div className="value">
                    <span className="whole">{this.props.price}</span>
                    {/* {decimalDigits ? <span className="decimals">{decimalSeparator}{desimal}</span> : null}           */}
                </div>
            </div>
        )
    }
}