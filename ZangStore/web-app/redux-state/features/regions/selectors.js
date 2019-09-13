const ns = '[countries/selectors]';
import logger from 'js-logger'

export function getRegions(state, props) {
  let { data } = state.status.regions;
  let { regions } = state.entities;
  return data.map(countryId => {
    return regions[countryId]
  })
}
