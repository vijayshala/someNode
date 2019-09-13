import { schema } from 'normalizr';

const settings = new schema.Entity(
  'settings',
  {},
  {
    idAttribute: '_id'
  }
);
const settingsArraySchema = { data: [settings] };

const settingsSchema = {
  data: new schema.Entity('settings', {}, { idAttribute: '_id' })
};

export default {
  SETTINGS_ARRAY: settingsArraySchema,
  SETTINGS: settingsSchema
};
