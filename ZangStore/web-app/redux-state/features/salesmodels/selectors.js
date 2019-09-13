const ns = '[offers/selectors]';
import logger from 'js-logger'
import {createSelector} from 'reselect';

export function getSalesModelStatus(state, salesmodelIdentifier) {
  let fn = `${ns}[getSalesModelByIdentifier]`
  let {salesModelsStatus} = state.status;
  return salesModelsStatus[salesmodelIdentifier] || {}
}

export function getSalesModelByIdentifier(state, salesmodelIdentifier) {
  let fn = `${ns}[getSalesModelByIdentifier]`
  let {salesmodels} = state.entities;
  return salesmodels[salesmodelIdentifier]
}

export function getPrimarySalesItem(state, props) {
  let fn = `${ns}[getPrimarySalesItem]`
  let {salesModels, salesModelItems} = state.entities;
  let { salesModelId } = props;
  let salesModel = salesModels[salesModelId] || {};
  let items = salesModel.items || [];  
  for (var itemId of items) {    
    if (salesModelItems[itemId].isPrimary) {
      return salesModelItems[itemId];
    }
  }
  return null;
}

export function getSalesModelItemsByTag(state, props) {
  let fn = `${ns}[getSalesModelItemsByTag]`
  let {salesModels, salesModelItems} = state.entities;
  let { salesModelId, tagName } = props;
  let salesModel = salesModels[salesModelId] || {};
  return (salesModel.items || []).filter(itemId => {
    return salesModelItems[itemId].tags && salesModelItems[itemId].tags.indexOf(tagName) > -1
  }).map(itemId => {
    return salesModelItems[itemId];
  });
}


export function getSalesItemAttributesByTag(state, props) {
  let fn = `${ns}[getSalesItemAttributesByTag]`
  let { tagName, salesModelItem } = props;
  let {salesModels, salesModelItems, salesModelItemAttributes} = state.entities;  
  
  // logger.info(fn, 'salesModelItem:', salesModelItem, 'tagName:', tagName, props)
  let sellableAttributes = (salesModelItem && salesModelItem.attributes || []).map(attrId => {
    return salesModelItemAttributes[attrId];
  }).filter(attr => {
    return attr.tags && attr.tags.indexOf(tagName) > -1
    });
  return sellableAttributes;
}

export function getPrimarySalesItemAttributesByTag(state, props) {
  let fn = `${ns}[getPrimarySalesItemAttributesByTag]`
  let { tagName } = props;
  let {salesModels, salesModelItems, salesModelItemAttributes} = state.entities;  
  let salesModelItem = getPrimarySalesItem(state, props);
  return getSalesItemAttributesByTag(state, {
    tagName, salesModelItem
  });
}

