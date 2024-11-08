import ApiInterface, { ApiServiceType } from 'Api/index';
import RezkaApi from 'Api/RezkaApi';
import { services } from 'Api/services';
import { makeAutoObservable } from 'mobx';

class AppStore {
  public isTV = true;
  public isInitiallyFocused = false;
  public currentService = RezkaApi as ApiInterface;

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
    this.currentService = services[service];
  }
}

export default new AppStore();
