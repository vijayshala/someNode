const ns = '[UserAreaContainer]';
import logger from 'js-logger'
import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';


//actions
import { fetchViewer } from '../../redux-state/features/viewer/actions'


//selectors
import {  
  getTopLevelOffer,  getOfferByIdentifier
} from '../../redux-state/features/offers/selectors';


//components
import Loader from '../components/Loader';

const mapStateToProps = (state, props) => {  
  let { user } = state.viewer
  return {
    user: user.data || null,
    fetching: user.fetching
  }
};

const mapDispatchToProps = {
  fetchViewer,  
};

class UserAreaContainer extends Component {
  constructor(props) {
    super(props);    
  }
 
  componentWillReceiveProps(nextProps) {
    logger.info(ns, '[componentWillReceiveProps]', nextProps) 
  }

  componentWillUpdate(nextProps) {
  
  }

  componentDidMount() {    
    if (!this.props.user || !this.props.user.userId) {
      this.props.fetchViewer()  
    }
  }

  componentWillUnmount() {
    
  }
  

  render() {
    let { user, fetching, children } = this.props;
    if (!user || fetching) {
      return <Loader className="user-area offer-panel-container loader-container"/>;
    }    
    return (this.props.children) ? this.props.children : null;    
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserAreaContainer);