import ApiInterface, { ApiServiceType } from 'Api/index';
import RezkaApi from 'Api/RezkaApi';
import { services } from 'Api/services';
import { makeAutoObservable } from 'mobx';

class ServiceStore {
  private currentService = RezkaApi as ApiInterface;

  constructor() {
    makeAutoObservable(this);
    this.loadConfig();
  }

  async loadConfig() {
    //const config = loadConfig([CONFIG_KEY_ENUM.currentService]);
    // this.currentService = config.currentService;
  }

  setCurrentService(service: ApiServiceType) {
    this.currentService = services[service];
  }

  getCurrentService() {
    return this.currentService;
  }
}

export default new ServiceStore();
