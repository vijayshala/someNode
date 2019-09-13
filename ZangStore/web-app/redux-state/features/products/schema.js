const ns = '[offers/schema]';
import { schema, normalize } from 'normalizr';
import logger from 'js-logger'

export const PRODUCT = new schema.Entity('products', 
{   
}, 
{ idAttribute: '_id' });

export function normalizeProduct(response, state) { 
  let res = normalizeProduct(response.data, PRODUCT);    
  return res;
}


export default {
  PRODUCT
};
