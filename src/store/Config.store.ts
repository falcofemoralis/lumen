import { makeAutoObservable } from 'mobx';
import { getConfigJson, updateConfig } from 'Util/Config';
import { configureRemoteControl } from 'Util/RemoteControl';

const DEVICE_CONFIG = 'deviceConfig';

type DeviceConfigType = {
  isConfigured: boolean;
  isTV: boolean;
}

class ConfigStore {
  private config: DeviceConfigType = {
    isConfigured: false,
    isTV: false,
  };

  constructor() {
    makeAutoObservable(this);

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
    await updateConfig(DEVICE_CONFIG, JSON.stringify({
      ...this.config,
      [key]: value,
    }));
  }

  async configureDevice(isTV: boolean) {
    await updateConfig(DEVICE_CONFIG, JSON.stringify({
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

  setUpTV() {
    configureRemoteControl();
  }
}

export default new ConfigStore();
