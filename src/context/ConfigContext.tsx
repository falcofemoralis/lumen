import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { useMMKVString } from 'react-native-mmkv';
import { defaultConfig, DeviceConfigType } from 'src/config';
import { safeJsonParse } from 'Util/Json';
import { storage } from 'Util/Storage';

export const DEVICE_CONFIG = 'deviceConfig';

type ConfigContextInterface = DeviceConfigType & {
  setConfig: (key: keyof DeviceConfigType, value: unknown) => void;
}

const ConfigContext = createContext<ConfigContextInterface>({
  ...defaultConfig,
  setConfig: () => {},
});

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [deviceConfig, setDeviceConfig] = useMMKVString(DEVICE_CONFIG, storage.getConfigStorage().getMMKVInstance());

  const config = useMemo(() => {
    if (!deviceConfig) {
      return defaultConfig;
    }

    const parsedConfig = safeJsonParse<DeviceConfigType>(deviceConfig);

    return {
      ...defaultConfig,
      ...parsedConfig,
    };
  }, [deviceConfig]);

  const setConfig = useCallback((key: keyof DeviceConfigType, value: unknown) => {
    setDeviceConfig(JSON.stringify({
      ...config,
      [key]: value,
    }));
  }, [config, setDeviceConfig]);

  const value = useMemo(() => ({
    ...config,
    setConfig,
  }), [
    config,
    setConfig,
  ]);

  return (
    <ConfigContext.Provider value={ value }>
      { children }
    </ConfigContext.Provider>
  );
};

// External access to global config. Avoid using it!
let globalConfig: any = null;
export const getGlobalConfig = (): DeviceConfigType => {
  if (!globalConfig) {
    const storedConfig = storage.getConfigStorage().load<DeviceConfigType>(DEVICE_CONFIG);

    globalConfig = {
      ...(globalConfig || {}),
      ...(storedConfig || {}),
    };
  }

  return globalConfig;
};

export const useConfigContext = () => {
  const context = useContext(ConfigContext);
  if (!context) throw new Error('useConfigContext must be used within a ConfigProvider');

  return context;
};