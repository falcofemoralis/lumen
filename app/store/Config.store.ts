import ApiInterface from 'Api/index';
import RezkaApi from 'Api/RezkaApi';
import { makeAutoObservable } from 'mobx';
import { loadConfig, updateConfig } from 'Util/Config';
import { CONFIG_KEY_ENUM } from 'Util/Config/mapping';

class ConfigStore {
  public isConfigured = false;
  public isTV = true;
  public currentService = RezkaApi as ApiInterface;

  constructor() {
    makeAutoObservable(this);
    this.loadConfig();
  }

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
