import ApiInterface, { ApiServiceType } from 'Api/index';
import RezkaApi from 'Api/RezkaApi';
import { services } from 'Api/services';
import { makeAutoObservable } from 'mobx';

class AppStore {
  public isTV = true;
  public currentService = RezkaApi as ApiInterface;
  public isNavigationVisible = false;

  constructor() {
    makeAutoObservable(this);
  }

  setTV() {
    this.isTV = true;
  }

  toggleNavigation() {
    this.isNavigationVisible = !this.isNavigationVisible;
  }

  setCurrentService(service: ApiServiceType) {
    this.currentService = services[service];
  }
}

export default new AppStore();
