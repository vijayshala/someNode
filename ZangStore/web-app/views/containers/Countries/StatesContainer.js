const ns = '[StatesContainer]';
import logger from 'js-logger'
import React, { Component } from 'react';
// import * as $ from "jquery";
import {connect} from 'react-redux';
import _ from 'lodash';
//constants

//actions
import { fetchCountryInfo } from '../../../redux-state/features/countries/actions';


//selectors
import { getStates  } from '../../../redux-state/features/countries/selectors';

//components
import { States } from '../../components/Countries';

//containers

const mapStateToProps = (state, props) => {  
  let { countryISO } = props;  
  let states = getStates(state, { countryISO });
  let { data:countries } = state.status.countries;
  logger.info(ns, 'countryISO', countryISO, 'states', states, 'countries', countries);
  return {
    countries,
    states
  }
};

const mapDispatchToProps = {
  fetchCountryInfo
};

class StatesContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedState: null,
    }
  }

  componentWillReceiveProps(nextProps) {
    
  }

  componentDidMount() {
    // this.props.fetchCountryInfo(this.props.countryISO);
  }

  componentWillUnmount() {

  }

  render() {
    let { states, onChange, label, error } = this.props;
    return (<States {...{
      label,
      error,
      states: _.sortBy(states, 'name'),
      placeholder: global.localizer.get('SELECT_ONE'),
      selectedValue: this.state.selectedState,
      onChange: state => {
        {/* logger.info(ns, state); */}
        this.setState({ selectedState: state }, () => {
          {/* logger.info(ns, 'selectedPrefix:', state); */}
          onChange(state.value);
        });
      }
    }} /> )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StatesContainer);