import React, {Component} from 'react';

export default class QuoteComposeAgentInfo extends Component {
    render() {
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