const ns = '[countries/selectors]';
import logger from 'js-logger'

export function getCountries(state, props) {
  let { data = [] } = state.status.countries;
  let { countries } = state.entities;
  return data.map(countryId => {
    return countries[countryId]
  })
}

export function getStates(state, props) {
  let fn = `${ns}[getStates]`;  
  let { countryISO } = props;
  let listOfCountries = state.status.countries && state.status.countries.data || [];
  let { countries, states } = state.entities;

  let curCountry = listOfCountries.map(countryId => {
    return countries[countryId]
  }).filter(country => {
    let isoFound = Object.keys(country.ISO).map(isoId => {
      return country.ISO[isoId];
    }).filter(ISO => {
      return ISO == countryISO;
    });
    return isoFound.length > 0;
  });

  curCountry = curCountry && curCountry.length ? curCountry[0] : { states: [] };
  let result =  curCountry.states.map(stateId => {
    return states[stateId];
  });

  // logger.info(fn, 'result:', {result, countries, countryISO});
  return result;
}