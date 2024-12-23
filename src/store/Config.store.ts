import { makeAutoObservable } from 'mobx';
import { loadConfig, updateConfig } from 'Util/Config';
import { CONFIG_KEY_ENUM } from 'Util/Config/mapping';

class ConfigStore {
  public isConfigured = false;

  public isTV = true;

  constructor() {
    makeAutoObservable(this);
    this.loadConfig();
  }

  /**
   * How to add new type? Check util/config/mapping
   *
   * 1. Add new key to CONFIG_KEY_ENUM
   * 2. Adjust TS interface
   * 3. Add new mapping to CONFIG_MAP
   * 4. Update ConfigStore
   */
  async loadConfig() {
    const config = loadConfig();

    this.isConfigured = config.isConfigured;
    this.isTV = config.isTV;
  }

  async updateIsConfigured(isConfigured: boolean) {
    await updateConfig(CONFIG_KEY_ENUM.isConfigured, isConfigured);
  }

  async updateIsTV(isTV: boolean) {
    await updateConfig(CONFIG_KEY_ENUM.isTV, isTV);
  }
}

export default new ConfigStore();
