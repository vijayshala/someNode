const ns = '[MainSubMenuContainer]'
import logger from 'js-logger'
import React, { Component } from 'react';
import {Route, Redirect, withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import scriptLoader from 'react-async-script-loader'

//actions
import { fetchSubMenus } from '../../redux-state/features/ui/actions'

//components
import MainSubMenu from '../components/MainSubMenu'
const mapStateToProps = state => {
  let { mainSubMenu  } = state.ui;
  // logger.info(ns, ' mainSubMenu', mainSubMenu);
  return {
    ...mainSubMenu
  };
};

const mapDispatchToProps = {
  fetchSubMenus
};

class MainSubMenuContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {
    let { location } = this.props;        
    let { html } = nextProps;
    let htmlObj = html[nextProps.location.pathname];
    logger.info(ns, '[componentWillReceiveProps] mainSubMenu', html, 'pathname:', nextProps.location.pathname);
    
    if (!htmlObj && nextProps.location.pathname != location.pathname) {
      logger.info(ns, '[componentWillReceiveProps] pathname changed:', nextProps.location.pathname);  
      this.props.fetchSubMenus(nextProps.location.pathname);
      // $('.main-sub-menu').html('');
      // $('.main-sub-menu').addClass('invisible');
    }  

    if(htmlObj) {
      logger.info(ns, '[componentWillReceiveProps] htmlObj', htmlObj);
      $('.main-sub-menu').html(htmlObj.content);
      // if (htmlObj.content) {
      //   $('.main-sub-menu').removeClass('invisible');
      // }
      // else {
      //   $('.main-sub-menu').addClass('invisible');;
      // }
    }
  }

  componentWillMount() {
    let { location, html } = this.props;
    let htmlObj = html[location.pathname];
    if (!htmlObj) {
      logger.info(ns, '[componentWillMount] pathname changed:', location.pathname);  
      this.props.fetchSubMenus(location.pathname);
      // $('.main-sub-menu').addClass('invisible');
    }
    else {
      logger.info(ns, '[componentWillReceiveProps] html', htmlObj);
      $('.main-sub-menu').html(htmlObj.content);
      if (htmlObj.content) {
        // $('.main-sub-menu').removeClass('invisible');
      }
      else {
        // $('.main-sub-menu').addClass('invisible');;
      }
    }
  }

  render() {
    let { html, location } = this.props;
    // logger.info(ns, 'render', mainSubMenu, 'pathname:', location.pathname);
    return null;
    return (
      <MainSubMenu {...mainSubMenu} />
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MainSubMenuContainer))
