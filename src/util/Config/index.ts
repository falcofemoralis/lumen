import { safeJsonParse } from 'Util/Json';
import { configStorage } from 'Util/Storage';

export const getConfig = (
  key: string,
): string | null => {
  const config = configStorage.getString(key);

  if (!config) {
    return null;
  }

  return config;
};

export const updateConfig = (
  key: string,
  value: string,
): void => configStorage.set(key, value);

export const getConfigJson = <T>(key: string): T | null => {
  const configJson = getConfig(key);

  if (!configJson) {
    return null;
  }

  return safeJsonParse<T>(configJson);
};
