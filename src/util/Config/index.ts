/* eslint-disable @typescript-eslint/no-explicit-any -- Config value can be any value */
import { configStorage } from 'Util/Storage';

import {
  Config,
  CONFIG_MAP,
  ConfigKeyType,
  ConfigMapping,
  DataType,
} from './mapping';

export const getDefaultConfig = () => CONFIG_MAP.reduce((acc, { key, default: defaultValue }) => {
  acc[key as keyof Config] = defaultValue;

  return acc;
}, {} as Config);

export const loadConfig = (keys?: ConfigKeyType[]): Config => {
  const mapByType: { [key: string]: ConfigMapping[] } = {};

  CONFIG_MAP.forEach((item) => {
    if (keys && !keys.includes(item.key)) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- false positive
    if (!mapByType[item.type]) {
      mapByType[item.type] = [];
    }

    mapByType[item.type].push(item);
  });

  const results: [string, unknown][][] = [];
  Object.keys(mapByType).forEach((type) => {
    const items = mapByType[type];
    const itemsKeys = items.map((item) => item.key);
    results.push(configStorage.getMultipleItems(itemsKeys, type as DataType));
  });

  const configArr = results.flat();

  return CONFIG_MAP.reduce((acc, { key, default: defaultValue }) => {
    acc[key as keyof Config] = configArr.find(([k]) => k === key)?.[1] ?? defaultValue;

    return acc;
  }, {} as Config);
};

export const getConfig = async (key: ConfigKeyType): Promise<any> => {
  const mapping = CONFIG_MAP.find((k) => k.key === key);

  if (!mapping) {
    throw new Error(`Unknown key: ${key}`);
  }

  const { key: name, type } = mapping;

  switch (type) {
    case DataType.boolean:
      return configStorage.getBoolAsync(name);
    case DataType.number:
      return configStorage.getIntAsync(name);
    case DataType.string:
      return configStorage.getStringAsync(name);
    case DataType.array:
      return configStorage.getArrayAsync(name);
    case DataType.object:
      return configStorage.getMapAsync(name);
    default:
      throw new Error(`Unknown type: ${type}`);
  }
};

export const updateConfig = async (
  key: ConfigKeyType,
  value: any,
): Promise<boolean | null | undefined> => {
  const mapping = CONFIG_MAP.find((k) => k.key === key);

  if (!mapping) {
    throw new Error(`Unknown key: ${key}`);
  }

  const { key: name, type } = mapping;

  switch (type) {
    case DataType.boolean:
      return configStorage.setBoolAsync(name, value);
    case DataType.number:
      return configStorage.setIntAsync(name, value);
    case DataType.string:
      return configStorage.setStringAsync(name, value);
    case DataType.array:
      return configStorage.setArrayAsync(name, value);
    case DataType.object:
      return configStorage.setMapAsync(name, value);
    default:
      throw new Error(`Unknown type: ${type}`);
  }
};
