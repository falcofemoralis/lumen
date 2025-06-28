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
import hotUpdate from 'react-native-ota-hot-update';
import ConfigStore from 'Store/Config.store';
import { UpdateInterface } from 'Type/Update.interface';
import { noopFn } from 'Util/Function';
import { versionStringToNumber } from 'Util/Misc';
import { miscStorage } from 'Util/Storage';

const UPDATE_STORAGE_KEY = 'app_update';

interface AppUpdaterContextInterface {
  update: UpdateInterface | null;
  isUpdateRejected: boolean;
  setUpdate: (update: UpdateInterface | null) => void;
  checkVersion: () => Promise<void>;
  setIsUpdateRejected: (isRejected: boolean) => void;
}

const AppUpdaterContext = createContext<AppUpdaterContextInterface>({
  update: null,
  isUpdateRejected: false,
  setUpdate: noopFn,
  checkVersion: async () => {},
  setIsUpdateRejected: noopFn,
});

export const AppUpdaterProvider = ({ children }: { children: React.ReactNode }) => {
  const [update, setUpdate] = useState<UpdateInterface | null>(null);
  const [isUpdateRejected, setIsUpdateRejected] = useState(false);

  const getCachedUpdate = useCallback(async () => {
    const cachedData = miscStorage.getString(UPDATE_STORAGE_KEY);

    if (cachedData) {
      const { data, ttl } = JSON.parse(cachedData) as { data: UpdateInterface; ttl: number };

      if (Date.now() < ttl) {
        return data;
      }
    }

    const response = await fetch(UPDATE_LINK);
    const data = await response.json() as UpdateInterface;;

    miscStorage.set(UPDATE_STORAGE_KEY, JSON.stringify({
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

    const currentVersion = versionStringToNumber(Application.nativeApplicationVersion || '0.0.0');
    const newVersion = versionStringToNumber(data?.versionName || '0.0.0');
    const installedVersionNumber = await hotUpdate.getCurrentVersion() || 0;
    const newVersionNumber = data?.version || 0;

    if (newVersion > currentVersion && newVersionNumber > installedVersionNumber) {
      setUpdate(data);
    }
  }, [getCachedUpdate]);

  const value = useMemo(() => ({
    update,
    isUpdateRejected,
    setUpdate,
    checkVersion,
    setIsUpdateRejected,
  }), [
    update,
    isUpdateRejected,
    setUpdate,
    checkVersion,
    setIsUpdateRejected,
  ]);

  return (
    <AppUpdaterContext.Provider value={ value }>
      { children }
    </AppUpdaterContext.Provider>
  );
};

export const useAppUpdaterContext = () => use(AppUpdaterContext);
