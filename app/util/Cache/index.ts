import { Cache } from 'react-native-cache';
import { cacheStorage } from 'Util/Storage';

type KeyValuePair = [string, string | null];
type OnMultiResult = Function;
type OnResult = Function;
type MultiCallback = (errors?: readonly (Error | null)[] | null) => void;
type MultiGetCallback = (
  errors?: readonly (Error | null)[] | null,
  result?: readonly KeyValuePair[]
) => void;

function createPromise<Result, Callback extends OnResult>(
  getValue: () => Result,
  callback?: Callback
): Promise<Result> {
  return new Promise((resolve, reject) => {
    try {
      const value = getValue();
      callback?.(null, value);
      resolve(value);
    } catch (err) {
      callback?.(err);
      reject(err);
    }
  });
}

function createPromiseAll<ReturnType, Result, ResultProcessor extends OnMultiResult>(
  promises: Promise<Result>[],
  callback?: MultiCallback | MultiGetCallback,
  processResult?: ResultProcessor
): Promise<ReturnType> {
  return Promise.all(promises).then(
    (result) => {
      const value = processResult?.(result) ?? null;
      callback?.(null, value);
      return Promise.resolve(value);
    },
    (errors) => {
      callback?.(errors);
      return Promise.reject(errors);
    }
  );
}

const backend = {
  /**
   * Fetches `key` value.
   */
  getItem: (key: string, callback = () => {}) => {
    return createPromise(() => cacheStorage.getItem(key), callback);
  },

  /**
   * Sets `value` for `key`.
   */
  setItem: (key: string, value: string, callback = () => {}) => {
    return createPromise(() => cacheStorage.setItem(key, value), callback);
  },

  /**
   * Removes a `key`
   */
  removeItem: (key: string, callback = () => {}) => {
    return createPromise(() => cacheStorage.removeItem(key), callback);
  },

  /**
   * Gets *all* keys known to the app, for all callers, libraries, etc.
   */
  getAllKeys: (callback = () => {}) => {
    return createPromise(() => {
      return [];
    }, callback);
  },

  /**
   * multiGet resolves to an array of key-value pair arrays that matches the
   * input format of multiSet.
   *
   *   multiGet(['k1', 'k2']) -> [['k1', 'val1'], ['k2', 'val2']]
   */
  multiGet: (keys: string[], callback = () => {}) => {
    const promises = keys.map((key) => cacheStorage.getItem(key));
    const processResult = (result: string[]) => result.map((value, i) => [keys[i], value]);
    return createPromiseAll(promises, callback, processResult);
  },

  /**
   * Delete all the keys in the `keys` array.
   */
  multiRemove: (keys: string[], callback = () => {}) => {
    return createPromise(() => {
      return cacheStorage.clearStore();
    }, callback);
  },
};

export const queryCache = new Cache({
  namespace: 'queryCache',
  policy: {
    maxEntries: 50000, // if unspecified, it can have unlimited entries
    stdTTL: 60 * 10, // the standard ttl as number in seconds, default: 0 (unlimited)
  },
  backend,
});
