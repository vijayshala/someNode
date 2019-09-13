const ns = '[quotes/schema]';
import { schema, normalize } from 'normalizr';
import logger from 'js-logger'

export const STATE = new schema.Entity('states', 
{ 

}, 
{ idAttribute: '_id' });


export const COUNTRY = new schema.Entity('countries', 
{ 
  states: [STATE]
}, 
  { idAttribute: '_id' });

