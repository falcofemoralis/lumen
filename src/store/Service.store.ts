import { ApiServiceType } from 'Api/index';
import { services } from 'Api/services';
import { action, makeAutoObservable } from 'mobx';
import { ProfileInterface } from 'Type/Profile.interface';
import { safeJsonParse } from 'Util/Json';
import { miscStorage } from 'Util/Storage';

export const PROFILE_STORAGE = 'PROFILE_STORAGE';

class ServiceStore {
  private currentService = ApiServiceType.REZKA;

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
    this.setProfile(await this.getCurrentService().getProfile());
  }

  logout() {
    this.getCurrentService().logout();
    this.getCurrentService().setAuthorization('');
    this.setSignedIn(false);
  }

  setProfile(profile: ProfileInterface) {
    miscStorage.setString(PROFILE_STORAGE, JSON.stringify(profile));
  }

  getProfile(): ProfileInterface|null {
    return safeJsonParse<ProfileInterface>(miscStorage.getString(PROFILE_STORAGE));
  }
}

export default new ServiceStore();
