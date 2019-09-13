const ns = '[quotes/schema]';
import { schema, normalize } from 'normalizr';
import logger from 'js-logger'

export const QUOTE = new schema.Entity('quotes', 
{ 

}, 
{ idAttribute: '_id' });

export function normalizeQuotes(response, state) {  
  let data = response.data || []
  let nrmRes = normalize(data, [QUOTE]); 
  logger.info(ns, 'nrmRes', nrmRes);
  let res = { ...response, ...nrmRes, data: nrmRes.result };
  if (res.result) {
    delete res.result;
  }
  return res;
}
