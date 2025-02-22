/* eslint-disable @typescript-eslint/no-explicit-any -- Config value can be any value */
export enum DataType {
  boolean = 'boolean',
  number = 'number',
  string = 'string',
  array = 'array',
  object = 'map',
}

export interface ConfigMapping {
  key: ConfigKeyType;
  default: any;
  type: DataType;
}

export enum ConfigKeyType {
  IS_CONFIGURED = 'isConfigured',
  IS_TV = 'isTV',
  LANGUAGE = 'language',
}

export interface Config {
  isConfigured: boolean;
  isTV: boolean;
}

export const CONFIG_MAP: ConfigMapping[] = [
  {
    key: ConfigKeyType.IS_CONFIGURED,
    default: false,
    type: DataType.boolean,
  },
  {
    key: ConfigKeyType.IS_TV,
    default: false,
    type: DataType.boolean,
  },
];
