import React, {Component} from 'react';

export default class QuoteComposeAccountInfo extends Component {
    render() {
        return(
            <div className="container">
                <div className="row">
                    <div className="col-md-4">
                        <h3>{global.localizer.get('ACCOUNT_INFORMATION')}</h3>
                        <div className="form-group">
                            <label> <span className="text-danger"> </span>{global.localizer.get('FIRST_NAME')}</label>
                            <div className="input-icon right native"></div>
                            <i className="fa fa-lock"></i>
                            <input className="form-control" />
                        </div>
                        <div className="form-group">
                            <label> <span className="text-danger"> </span>{global.localizer.get('LAST_NAME')}</label>
                            <div className="input-icon right native"></div>
                            <i className="fa fa-lock"></i>
                            <input className="form-control" />
                        </div>
                        <div className="form-group">
                            <label> <span className="text-danger"> </span>{global.localizer.get('EMAIL_ADDRESS')}</label>
                            <div className="input-icon right native"></div>
                            <i className="fa fa-lock"></i>
                            <input className="form-control" />
                        </div>
                        <div className="form-group">
                            <label> <span className="text-danger"> </span>{global.localizer.get('CONTACT_PHONE_NUMBER')}</label>
                            <div className="input-icon right native"></div>
                            <i className="fa fa-lock"></i>
                            <input className="form-control" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}