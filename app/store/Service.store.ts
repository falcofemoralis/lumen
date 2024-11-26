import { ApiServiceType } from 'Api/index';
import { services } from 'Api/services';
import { makeAutoObservable } from 'mobx';

class ServiceStore {
  private currentService = ApiServiceType.rezka;

  constructor() {
    makeAutoObservable(this);
    this.loadConfig();
  }

  async loadConfig() {
    //const config = loadConfig([CONFIG_KEY_ENUM.currentService]);
    // this.currentService = config.currentService;
  }

  setCurrentService(service: ApiServiceType) {
    this.currentService = service;
    // this.currentService.setProvider(this.provider);
    // this.currentService.setCDN(this.CDN);
  }

  getCurrentService() {
    return services[this.currentService];
  }

  setProvider(provider: string) {
    this.getCurrentService().setProvider(provider);
  }

  setCDN(cdn: string) {
    this.getCurrentService().setCDN(cdn);
  }
}

export default new ServiceStore();
