import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { useMMKVString } from 'react-native-mmkv';
import { defaultConfig, DeviceConfigType, migrateLegacyConfig } from 'src/config';
import { getCloudSyncSettingId } from 'src/config/cloudSync';
import { safeJsonParse } from 'Util/Json';
import { storage } from 'Util/Storage';
import { mutateCloudSync } from 'Util/CloudSync';

export const DEVICE_CONFIG = 'deviceConfig';

type ConfigContextInterface = DeviceConfigType & {
  setConfig: (key: keyof DeviceConfigType, value: unknown) => void;
}

const ConfigContext = createContext<ConfigContextInterface>({
  ...defaultConfig,
  setConfig: () => {},
});

/**
 * `isTV` on its own. The whole config lives in one MMKV blob, so the config
 * context value changes identity on every settings write -- and the ~50
 * components that only branch on the device type would all re-render, memo or
 * not, since context reads bypass `memo`. This carries a primitive, so React
 * skips consumers whenever the device type itself hasn't changed.
 */
const IsTVContext = createContext<boolean>(defaultConfig.isTV);

/**
 * The hidden countries on their own, for the same reason as `IsTVContext`: every
 * film card in a grid reads them, and they must not be re-rendered whenever an
 * unrelated setting is written. Lowercased once here so that matching a card
 * against them stays a plain lookup -- see `isFilmCardHidden`.
 */
const HiddenCountriesContext = createContext<Set<string>>(new Set<string>());

const PendingReleaseBadgeContext = createContext<boolean>(defaultConfig.showPendingReleaseBadge);

// External access to global config. Avoid using it!
let globalConfig: any = null;
export const getGlobalConfig = (): DeviceConfigType => {
  if (!globalConfig) {
    const storedConfig = storage.getConfigStorage().load<Record<string, unknown>>(DEVICE_CONFIG);

    // Migrate the old poster-rating setting before applying defaults.
    globalConfig = {
      ...defaultConfig,
      ...(globalConfig || {}),
      ...migrateLegacyConfig(storedConfig ?? {}),
    };
  }

  return globalConfig;
};

/**
 * Applies a setting received from Cloud Sync without creating another
 * Cloud Sync mutation. The MMKV write still updates ConfigProvider consumers.
 */
export const applyCloudConfig = (
  key: keyof DeviceConfigType,
  value: unknown,
): void => {
  if (globalConfig) {
    if (value === undefined) {
      delete globalConfig[key];
    } else {
      globalConfig[key] = value;
    }
  }

  const storageInstance = storage.getConfigStorage();
  const currentConfig =
    storageInstance.load<DeviceConfigType>(DEVICE_CONFIG) ??
    ({} as DeviceConfigType);

  if (value === undefined) {
    delete currentConfig[key];
    storageInstance.save(DEVICE_CONFIG, currentConfig);
    return;
  }

  storageInstance.save(DEVICE_CONFIG, {
    ...currentConfig,
    [key]: value,
  });
};
export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [deviceConfig, setDeviceConfig] = useMMKVString(DEVICE_CONFIG, storage.getConfigStorage().getMMKVInstance());

  const config = useMemo(() => {
    if (!deviceConfig) {
      return defaultConfig;
    }

    const parsedConfig = safeJsonParse<Record<string, unknown>>(deviceConfig) ?? {};

    return {
      ...defaultConfig,
      ...migrateLegacyConfig(parsedConfig),
    };
  }, [deviceConfig]);

  const setConfig = useCallback((key: keyof DeviceConfigType, value: unknown) => {
    if (globalConfig) {
      // eslint-disable-next-line react-compiler/react-compiler
      globalConfig[key] = value;
    }

    setDeviceConfig((prevConfig) => {
      const parsedConfig = safeJsonParse<DeviceConfigType>(prevConfig) ?? {};

      return JSON.stringify({
        ...parsedConfig,
        [key]: value,
      });
    });

    const cloudSyncId = getCloudSyncSettingId(key);

    if (cloudSyncId) {
      mutateCloudSync({
        entity: 'setting',
        id: cloudSyncId,
        value,
      });
    }
  }, [deviceConfig, setDeviceConfig]);

  const value = useMemo(() => ({
    ...config,
    setConfig,
  }), [
    config,
    setConfig,
  ]);

  // The array is rebuilt on every settings write, so the set is keyed off the
  // countries themselves -- otherwise its identity, and every card reading it,
  // would change along with any other setting.
  const hiddenCountriesKey = config.hiddenCountries.join('\n');
  const hiddenCountries = useMemo(() => new Set(
    hiddenCountriesKey
      .split('\n')
      .map((country) => country.trim().toLowerCase())
      .filter(Boolean)
  ), [hiddenCountriesKey]);

  return (
    <ConfigContext.Provider value={ value }>
      <IsTVContext.Provider value={ config.isTV }>
        <PendingReleaseBadgeContext.Provider value={ config.showPendingReleaseBadge }>
          <HiddenCountriesContext.Provider value={ hiddenCountries }>
            { children }
          </HiddenCountriesContext.Provider>
        </PendingReleaseBadgeContext.Provider>
      </IsTVContext.Provider>
    </ConfigContext.Provider>
  );
};

export const useConfigContext = () => {
  const context = useContext(ConfigContext);
  if (!context) throw new Error('useConfigContext must be used within a ConfigProvider');

  return context;
};

/**
 * Prefer this over `useConfigContext().isTV` when the device type is all a
 * component needs -- see IsTVContext above.
 */
export const useIsTV = () => useContext(IsTVContext);

/**
 * The lowercased countries the user chose to hide. Prefer this over
 * `useConfigContext().hiddenCountries` -- see HiddenCountriesContext above.
 */
export const useHiddenCountries = () => useContext(HiddenCountriesContext);

export const useShowPendingReleaseBadge = () => useContext(PendingReleaseBadgeContext);