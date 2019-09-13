import React, {Component} from 'react';
import IntlMessageFormat from 'intl-messageformat';

export default class Localizer extends Component {
    constructor(props){
        super(props)
    }

    render() {
        let { number, msg } = this.props;
        if(!number) {
            number = 0;
        }

        let locale_msg = global.localizer.get(msg)
        let locale_num = new IntlMessageFormat(locale_msg);
        let output = locale_num.format({numUser: number});
        return(
            <div>{output}</div>
        )
    }
}