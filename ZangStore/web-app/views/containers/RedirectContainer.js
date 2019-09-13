import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

import { getLoginUrl } from '../utils/urlConfigurator';

function mapStateToProps(state) {
  return {
    serviceConfig: state.serviceConfigurations
  };
}

class RedirectContainer extends Component {
  componentWillMount() {
    const href = window.location.href;
    const serverUrl = get(this.props.serviceConfig, 'accounts.server_url');
    if (!serverUrl) return;
    if (!href.includes('login')) {
      if (href.includes('spaces/') && !href.includes('dashboard')) {
        window.location.href = getLoginUrl(serverUrl, true);
        return;
      }
      window.location.href = getLoginUrl(serverUrl);
      return;
    }
  }

  render() {
    return null;
  }
}

export default connect(mapStateToProps)(RedirectContainer);
