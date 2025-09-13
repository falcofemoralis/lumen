import { UPDATE_LINK } from 'Component/AppUpdater/AppUpdater.config';
import * as Application from 'expo-application';
import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';
import ConfigStore from 'Store/Config.store';
import LoggerStore from 'Store/Logger.store';
import StorageStore from 'Store/Storage.store';
import { UpdateInterface } from 'Type/Update.interface';
import { noopFn } from 'Util/Function';
import { versionStringToNumber } from 'Util/Misc';

const UPDATE_STORAGE_KEY = 'app_update';

interface AppUpdaterContextInterface {
  update: UpdateInterface | null;
  isUpdateRejected: boolean;
  setUpdate: (update: UpdateInterface | null) => void;
  checkVersion: () => Promise<void>;
  resetUpdate: () => void;
}

const AppUpdaterContext = createContext<AppUpdaterContextInterface>({
  update: null,
  isUpdateRejected: false,
  setUpdate: noopFn,
  checkVersion: async () => {},
  resetUpdate: noopFn,
});

export const AppUpdaterProvider = ({ children }: { children: React.ReactNode }) => {
  const [update, setUpdate] = useState<UpdateInterface | null>(null);
  const [isUpdateRejected, setIsUpdateRejected] = useState(false);

  const getCachedUpdate = useCallback(async () => {
    const cachedData = StorageStore.getMiscStorage().getString(UPDATE_STORAGE_KEY);

    if (cachedData) {
      const { data, ttl } = JSON.parse(cachedData) as { data: UpdateInterface; ttl: number };

      if (Date.now() < ttl) {
        return data;
      }
    }

    const response = await fetch(UPDATE_LINK);
    const data = await response.json() as UpdateInterface;

    StorageStore.getMiscStorage().set(UPDATE_STORAGE_KEY, JSON.stringify({
      data,
      ttl: Date.now() + 1000 * 60 * 60, // 1 hour
    }));

    return data;
  }, []);

  const checkVersion = useCallback(async () => {
    if (!ConfigStore.isConfigured() || Platform.OS === 'web') {
      return;
    }

    const data = await getCachedUpdate();

    LoggerStore.debug('checkVersion', { data });

    const currentVersion = versionStringToNumber(Application.nativeApplicationVersion || '0.0.0');
    const newVersion = versionStringToNumber(data?.versionName || '0.0.0');

    if (newVersion > currentVersion) {
      setUpdate(data);
    }
  }, [getCachedUpdate]);

  const resetUpdate = useCallback(() => {
    setUpdate(null);
    setIsUpdateRejected(false);
  }, []);

  const value = useMemo(() => ({
    update,
    isUpdateRejected,
    setUpdate,
    checkVersion,
    resetUpdate,
  }), [
    update,
    isUpdateRejected,
    setUpdate,
    checkVersion,
    resetUpdate,
  ]);

  return (
    <AppUpdaterContext.Provider value={ value }>
      { children }
    </AppUpdaterContext.Provider>
  );
};

export const useAppUpdaterContext = () => use(AppUpdaterContext);
