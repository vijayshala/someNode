const ns = '[offers/schema]';
import { schema, normalize } from 'normalizr';
import logger from 'js-logger'
import { omit } from 'lodash';

import {PRODUCT} from '../products/schema'

export const SALESMODEL_ATTRIBUTE_ITEM = new schema.Entity('salesModelItemAttributes', 
{}, 
{ 
  idAttribute: '_id',
  // processStrategy: entity => ({
  //   salesmodel: entity._id,    
  // })
});

export const SALESMODEL_ITEM = new schema.Entity('salesModelItems', 
{ 
  product: PRODUCT,
  attributes: [SALESMODEL_ATTRIBUTE_ITEM]
}, 
{ 
  idAttribute: '_id',
  // processStrategy: entity => ({
  //   salesmodel: entity._id,    
  // })
});

export const SALESMODEL = new schema.Entity('salesModels', 
{ 
  items: [SALESMODEL_ITEM] 
}, 
{ idAttribute: '_id',
  // processStrategy: entity => ({
  //   offer: entity._id,    
  // })
});

export function normalizeSalesmodel(response, state) { 
  let res = normalize(response.data, SALESMODEL);    
  return res;
}

export default {
  SALESMODEL
};
