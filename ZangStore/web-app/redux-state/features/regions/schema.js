const ns = '[quotes/schema]';
import { schema, normalize } from 'normalizr';
import logger from 'js-logger'

export const REGION = new schema.Entity('regions', 
{ 

}, 
  { idAttribute: '_id' });
