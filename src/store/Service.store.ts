import { ApiServiceType } from 'Api/index';
import { services } from 'Api/services';
import { action, makeAutoObservable } from 'mobx';

class ServiceStore {
  private currentService = ApiServiceType.rezka;

  public isSignedIn = false;

  constructor() {
    makeAutoObservable(this);
    this.isSignedIn = !!this.getCurrentService().getAuthorization();
  }

  setCurrentService(service: ApiServiceType) {
    this.currentService = service;
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

  @action
  setSignedIn(value: boolean) {
    this.isSignedIn = value;
  }

  async login(name: string, password: string) {
    const auth = await this.getCurrentService().login(name, password);
    this.getCurrentService().setAuthorization(auth);
    this.setSignedIn(true);
  }

  logout() {
    this.getCurrentService().logout();
    this.getCurrentService().setAuthorization('');
    this.setSignedIn(false);
  }
}

export default new ServiceStore();
