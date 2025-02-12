/* eslint-disable @typescript-eslint/no-explicit-any -- Config value can be any value */
export enum DATA_TYPE_ENUM {
  boolean = 'boolean',
  number = 'number',
  string = 'string',
  array = 'array',
  object = 'map',
}

export interface ConfigMapping {
  key: CONFIG_KEY_ENUM;
  default: any;
  type: DATA_TYPE_ENUM;
}

export enum CONFIG_KEY_ENUM {
  isConfigured = 'isConfigured',
  isTV = 'isTV',
  language = 'language',
}

export interface Config {
  isConfigured: boolean;
  isTV: boolean;
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
