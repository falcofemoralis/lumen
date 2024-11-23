/**
 * How to add new type?
 * 1. Add new key to CONFIG_KEY_ENUM
 * 2. Add new mapping to CONFIG_MAP
 * 3. Adjust TS interface
 * 4. Update loadConfig function in ConfigStore
 */

export enum DATA_TYPE_ENUM {
  boolean = 'boolean',
  number = 'number',
  string = 'string',
  array = 'array',
  object = 'map',
}

export enum CONFIG_KEY_ENUM {
  isConfigured = 'isConfigured',
  isTV = 'isTV',
}

export interface ConfigMapping {
  key: CONFIG_KEY_ENUM;
  default: any;
  type: DATA_TYPE_ENUM;
}

export const CONFIG_MAP: ConfigMapping[] = [
  {
    key: CONFIG_KEY_ENUM.isConfigured,
    default: false,
    type: DATA_TYPE_ENUM.boolean,
  },
  {
    key: CONFIG_KEY_ENUM.isTV,
    default: false,
    type: DATA_TYPE_ENUM.boolean,
  },
];

/**
 * Adjust TS interface here
 */
export interface Config {
  isConfigured: boolean;
  isTV: boolean;
}
