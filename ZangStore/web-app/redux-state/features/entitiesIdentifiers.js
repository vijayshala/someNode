const ns = '[entitiesIdentifiers]';
import logger from 'js-logger'

export default (state = {}, action) => {
  const { type, payload = {}, meta } = action;
  const { entities = {} } = payload;
  const { offers, salesModels, salesModelItems, salesModelItemAttributes, products } = entities;
  let entityType = '';
  state = getIdentifiersMap(state, offers, 'offer');
  state = getIdentifiersMap(state, salesModels, 'salesModel');
  // state = getIdentifiersMap(state, salesModelItems, 'salesModelItem');
  // state = getIdentifiersMap(state, salesModelItemAttributes, 'salesModelItemAttribute');
  state = getIdentifiersMap(state, products, 'product');
  return state;    
}
  
function getIdentifiersMap(state, entity = {}, entityType) {
  let fn = `${ns}[getIdentifiersMap]`
  // logger.info(fn, 'entity', entity, 'entityType', entityType);
  Object.keys(entity).map(key => {
    // logger.info(fn, 'key', key, entity[key], 'entityType' , entityType)
    if (entity[key].identifier) {
      var identifier = entity[key].identifier
      state = { ...state, [`${entityType}_${identifier}`]: { _id: entity[key]._id, entityType } }
    }    
  })
  return state;
}