import { useSyncExternalStore, useCallback } from 'react';
const instances = new Map();
export const createMMKV = ({ id = 'default' } = {}) => {
  if (instances.has(id)) return instances.get(id);
  const data = window.lumen.storageLoad(id), listeners = new Set();
  const changed = key => { window.lumen.storageSave(id, data); listeners.forEach(fn => fn(key)); };
  const store = {
    getString: key => typeof data[key] === 'string' ? data[key] : undefined,
    getBoolean: key => data[key], getNumber: key => data[key],
    set: (key, value) => { data[key] = value; changed(key); },
    remove: key => { delete data[key]; changed(key); }, delete: key => { delete data[key]; changed(key); },
    clearAll: () => { Object.keys(data).forEach(key => delete data[key]); changed(''); },
    contains: key => key in data, getAllKeys: () => Object.keys(data),
    addOnValueChangedListener: fn => { listeners.add(fn); return { remove: () => listeners.delete(fn) }; }
  };
  instances.set(id, store); return store;
};
export const useMMKVString = (key, store = createMMKV()) => {
  const subscribe = useCallback(fn => { const sub = store.addOnValueChangedListener(changed => { if (changed === key || !changed) fn(); }); return () => sub.remove(); }, [key, store]);
  const value = useSyncExternalStore(subscribe, () => store.getString(key));
  return [value, next => next === undefined ? store.remove(key) : store.set(key, typeof next === 'function' ? next(value) : next)];
};
