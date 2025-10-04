import { HOME_ROUTE } from 'Route/HomePage/HomePage.config';
import { getConfigJson, updateConfig } from 'Util/Config';
import { safeJsonParse } from 'Util/Json';
import { configureRemoteControl } from 'Util/RemoteControl';

export const DEVICE_CONFIG = 'deviceConfig';

type DeviceConfigType = {
  isConfigured: boolean;
  isTV: boolean;
  isFirestore: boolean;
  deviceId: string | null;
  loggerEnabled: boolean;
  securedSettings: boolean;
  isTVGridAnimation: boolean;
  isTVAwake: boolean;
  numberOfColumnsMobile: number;
  numberOfColumnsTV: number;
  initialRoute: string;
  playerRewindSeconds: number;
}

class ConfigStore {
  private config: DeviceConfigType = {
    isConfigured: false,
    isTV: false,
    isFirestore: false,
    deviceId: null,
    loggerEnabled: false,
    securedSettings: false,
    isTVGridAnimation: true,
    isTVAwake: false,
    numberOfColumnsMobile: 3,
    numberOfColumnsTV: 6,
    initialRoute: HOME_ROUTE,
    playerRewindSeconds: 10,
  };

  constructor() {
    this.loadConfig();

    if (this.isTV()) {
      this.setUpTV();
    }
  }

  loadConfig() {
    const config = getConfigJson<DeviceConfigType>(DEVICE_CONFIG);

    if (!config) {
      return;
    }

    this.config = {
      ...this.config,
      ...config,
    };
  }

  updateConfig(key: keyof DeviceConfigType, value: unknown) {
    const newConfig = {
      ...this.config,
      [key]: value,
    };

    updateConfig(DEVICE_CONFIG, JSON.stringify(newConfig));

    this.config = newConfig;
  }

  configureDeviceType(isTV: boolean) {
    updateConfig(DEVICE_CONFIG, JSON.stringify({
      ...this.config,
      isTV,
    }));

    this.config.isTV = isTV;
  }

  configureDevice(isTV: boolean) {
    updateConfig(DEVICE_CONFIG, JSON.stringify({
      ...this.config,
      isConfigured: true,
      isTV,
    }));
  }

  getConfig() {
    return this.config;
  }

  isConfigured() {
    return this.config.isConfigured;
  }

  isTV() {
    return this.config.isTV;
  }

  setUpTV() {
    configureRemoteControl();
  }

  getDeviceId(isShort = false) {
    if (!this.config.deviceId) {
      this.config.deviceId = String(Date.now());

      this.updateConfig('deviceId', this.config.deviceId);
    }

    if (isShort) {
      return this.config.deviceId.slice(-5);
    }

    return this.config.deviceId;
  }

  parseConfig(configJson: string): DeviceConfigType {
    const config = safeJsonParse<DeviceConfigType>(configJson);

    return {
      ...this.config,
      ...config,
    };
  }

}

export default new ConfigStore();
