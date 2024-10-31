import ApiInterface, { ApiServiceType } from 'Api/index';
import { services } from 'Api/services';
import { makeAutoObservable } from 'mobx';

class AppStore {
  public isTV = true;
  public isInitiallyFocused = false;
  private currentService = 'rezka' as ApiServiceType;

  constructor() {
    makeAutoObservable(this);
  }

  setTV() {
    this.isTV = true;
  }

  setInitiallyFocused() {
    this.isInitiallyFocused = true;
  }

  setCurrentService(service: ApiServiceType) {
    this.currentService = service;
  }

  getCurrentService(): ApiInterface {
    return services[this.currentService];
  }
}

export default new AppStore();
