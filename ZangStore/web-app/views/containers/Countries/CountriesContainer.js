const ns = '[CountriesContainer]';
import logger from 'js-logger'
import React, {Component} from 'react';
import {connect} from 'react-redux';

//constants

//actions
import {  } from '../../../redux-state/features/countries/actions';
import { fetchAllRegionInfo } from '../../../redux-state/features/regions/actions';  


//selectors
import { getCountries  } from '../../../redux-state/features/countries/selectors';

//components
import { Countries } from '../../components/Countries';

//containers

const mapStateToProps = (state, props) => {  
  let countries = getCountries(state);
  return {countries}
};

const mapDispatchToProps = {
  fetchAllRegionInfo
};

class CountriesContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCountry: null,
    }
    // this.props.fetchAllRegionInfo()
  }

  componentWillReceiveProps(nextProps) {
    
  }

  componentDidMount() {
    
  }

  componentWillUnmount() {

  }

  render() {
    let { countries, onChange, label, error } = this.props;
    // return(
    //   <div>None</div>
    // )
    return (<Countries {...{
      label,
      error,
      countries,
      placeholder: global.localizer.get('SELECT_ONE'),
      selectedValue: this.state.selectedCountry,      
      onChange: country => {
        {/* logger.info(ns, country); */}
        this.setState({ selectedCountry: country }, () => {
          {/* logger.info(ns, 'selectedPrefix:', country); */}
          console.log('What is Country Here', country);
          onChange(country.value);
        });
      }
    }} /> )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CountriesContainer);