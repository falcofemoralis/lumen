import { getConfigJson, updateConfig } from 'Util/Config';
import { configureRemoteControl } from 'Util/RemoteControl';

const DEVICE_CONFIG = 'deviceConfig';

type DeviceConfigType = {
  isConfigured: boolean;
  isTV: boolean;
  isFirestore: boolean;
  deviceId: string | null;
}

class ConfigStore {
  private config: DeviceConfigType = {
    isConfigured: false,
    isTV: false,
    isFirestore: false,
    deviceId: null,
  };

  constructor() {
    this.loadConfig();

    if (this.isTV()) {
      this.setUpTV();
    }
  }

  async loadConfig() {
    const config = getConfigJson<DeviceConfigType>(DEVICE_CONFIG);

    if (!config) {
      return;
    }

    this.config = {
      ...this.config,
      ...config,
    };
  }

  async updateConfig(key: keyof DeviceConfigType, value: unknown) {
    const newConfig = {
      ...this.config,
      [key]: value,
    };

    updateConfig(DEVICE_CONFIG, JSON.stringify(newConfig));

    this.config = newConfig;
  }

  async configureDeviceType(isTV: boolean) {
    updateConfig(DEVICE_CONFIG, JSON.stringify({
      ...this.config,
      isTV,
    }));

    this.config.isTV = isTV;
  }

  async configureDevice(isTV: boolean) {
    updateConfig(DEVICE_CONFIG, JSON.stringify({
      ...this.config,
      isConfigured: true,
      isTV,
    }));
  }

  isConfigured() {
    return this.config.isConfigured;
  }

  isTV() {
    return this.config.isTV;
  }

  isFirestore() {
    return this.config.isFirestore;
  }

  setUpTV() {
    configureRemoteControl();
  }

  getDeviceId() {
    if (!this.config.deviceId) {
      this.config.deviceId = String(Date.now());

      this.updateConfig('deviceId', this.config.deviceId);
    }

    return this.config.deviceId;
  }
}

export default new ConfigStore();
