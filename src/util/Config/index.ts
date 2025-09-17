import StorageStore from 'Store/Storage.store';
import { safeJsonParse } from 'Util/Json';

export const getConfig = (
  key: string
): string | null => {
  const config = StorageStore.getConfigStorage().getString(key);

  if (!config) {
    return null;
  }

  return config;
};

export const updateConfig = (
  key: string,
  value: string
): void => StorageStore.getConfigStorage().set(key, value);

export const getConfigJson = <T>(key: string): T | null => {
  const configJson = getConfig(key);

  if (!configJson) {
    return null;
  }

  return safeJsonParse<T>(configJson);
};
