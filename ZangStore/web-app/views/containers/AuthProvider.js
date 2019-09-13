const ns = '[AuthProvider]'
import logger from 'js-logger'
import React, { Component } from 'react';
import {Route, Redirect, withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import scriptLoader from 'react-async-script-loader'
import { setRouter } from '../components/Link'

import Routes from './Routes';
// import { authSuccess, authFail } from '../../redux-state/features/status';
// import { signin } from '../../redux-state/features/viewer'; import {
// commonAuthenticationSelector } from
// '../../redux-state/features/status/selectors'; import CurrentViewer from
// '../../redux-state/utils/currentViewer'; import clientEnvironment from
// '../constants/clientEnvironment'; import { getLoginUrl } from
// '../utils/urlConfigurator';

const mapStateToProps = (state, props) => {
  let { viewer } = state;
  return {
    user: viewer.user,
  };
};

const mapDispatchToProps = {
  // signin, authSuccess, authFail
};

class AuthProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: false
    }
    console.log('router......', props);
    setRouter(props.history);
  }
  
  componentDidMount() {
    let { user } = this.props;
    logger.info(ns, 'user:', user);
    if (user) {
      
    }
  }

  render() {
    const { isAuthenticated } = this.state;
    console.info('...this.props:', this.props);
    return (
      <Route path="/" render={props =>
        <Routes {...{ ...props, isAuthenticated: isAuthenticated }} />
        }/>
    );
  }

  // handleFetchViewer = () => {   if (!CurrentViewer.isLoggedIn) {
  // window.location.replace('/appauth/login?next=' +
  // encodeURIComponent(window.location.href));     return;   }   this.props
  // .signin()     .then(() => this.props.authSuccess(), () =>
  // this.props.authFail); };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AuthProvider))
//isAuthenticated ? <Routes {...props} /> : <Redirect to={`/login`} />