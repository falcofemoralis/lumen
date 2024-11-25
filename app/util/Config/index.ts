import { configStorage } from 'Util/Storage';
import { Config, CONFIG_KEY_ENUM, CONFIG_MAP, ConfigMapping, DATA_TYPE_ENUM } from './mapping';

export const getDefaultConfig = () => {
  return CONFIG_MAP.reduce((acc, { key, default: defaultValue }) => {
    acc[key as keyof Config] = defaultValue;
    return acc;
  }, {} as Config);
};

export const loadConfig = (keys?: CONFIG_KEY_ENUM[]): Config => {
  const mapByType: { [key: string]: ConfigMapping[] } = {};

  CONFIG_MAP.forEach((item) => {
    if (keys && !keys.includes(item.key)) {
      return;
    }

    if (!mapByType[item.type]) {
      mapByType[item.type] = [];
    }
    mapByType[item.type].push(item);
  });

  const results: [string, unknown][][] = [];
  Object.keys(mapByType).map((type) => {
    const items = mapByType[type];
    const keys = items.map((item) => item.key);
    results.push(configStorage.getMultipleItems(keys, type as DATA_TYPE_ENUM));
  });

  const configArr = results.flat();

  return CONFIG_MAP.reduce((acc, { key, default: defaultValue }) => {
    acc[key as keyof Config] = configArr.find(([k]) => k === key)?.[1] ?? defaultValue;
    return acc;
  }, {} as Config);
};

export const getConfig = async (key: CONFIG_KEY_ENUM): Promise<any> => {
  const mapping = CONFIG_MAP.find((k) => k.key === key);

  if (!mapping) {
    throw new Error(`Unknown key: ${key}`);
  }

  const { key: name, type } = mapping;

  switch (type) {
    case DATA_TYPE_ENUM.boolean:
      return configStorage.getBoolAsync(name);
    case DATA_TYPE_ENUM.number:
      return configStorage.getIntAsync(name);
    case DATA_TYPE_ENUM.string:
      return configStorage.getStringAsync(name);
    case DATA_TYPE_ENUM.array:
      return configStorage.getArrayAsync(name);
    case DATA_TYPE_ENUM.object:
      return configStorage.getMapAsync(name);
    default:
      throw new Error(`Unknown type: ${type}`);
  }
};

export const updateConfig = async (
  key: CONFIG_KEY_ENUM,
  value: any
): Promise<boolean | null | undefined> => {
  const mapping = CONFIG_MAP.find((k) => k.key === key);

  if (!mapping) {
    throw new Error(`Unknown key: ${key}`);
  }

  const { key: name, type } = mapping;

  switch (type) {
    case DATA_TYPE_ENUM.boolean:
      return configStorage.setBoolAsync(name, value);
    case DATA_TYPE_ENUM.number:
      return configStorage.setIntAsync(name, value);
    case DATA_TYPE_ENUM.string:
      return configStorage.setStringAsync(name, value);
    case DATA_TYPE_ENUM.array:
      return configStorage.setArrayAsync(name, value);
    case DATA_TYPE_ENUM.object:
      return configStorage.setMapAsync(name, value);
    default:
      throw new Error(`Unknown type: ${type}`);
  }
};
