import { ApiServiceType } from 'Api/index';
import { services } from 'Api/services';
import { makeAutoObservable } from 'mobx';
import { NotificationInterface, NotificationItemInterface } from 'Type/Notification.interface';
import { ProfileInterface } from 'Type/Profile.interface';
import { CookiesManager } from 'Util/Cookies';
import { safeJsonParse } from 'Util/Json';
import { requestValidator } from 'Util/Request';
import { miscStorage } from 'Util/Storage';

import ConfigStore from './Config.store';
import NavigationStore from './Navigation.store';

export const CREDENTIALS_STORAGE = 'CREDENTIALS_STORAGE';
export const PROFILE_STORAGE = 'PROFILE_STORAGE';
export const NOTIFICATIONS_STORAGE = 'NOTIFICATIONS_STORAGE';

class ServiceStore {
  private currentService = ApiServiceType.REZKA;

  public isSignedIn = false;

  public notifications: NotificationInterface[] | null = null;

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

  setSignedIn(value: boolean) {
    this.isSignedIn = value;
  }

  async login(name: string, password: string) {
    const auth = await this.getCurrentService().login(name, password);
    this.getCurrentService().setAuthorization(auth);
    this.setProfile(await this.getCurrentService().getProfile());
    this.setSignedIn(true);
    miscStorage.set(CREDENTIALS_STORAGE, JSON.stringify({ name, password }));
  }

  logout() {
    this.getCurrentService().logout();
    this.getCurrentService().setAuthorization('');
    this.setSignedIn(false);
    this.removeProfile();
    miscStorage.set(CREDENTIALS_STORAGE, '');
  }

  setProfile(profile: ProfileInterface) {
    miscStorage.set(PROFILE_STORAGE, JSON.stringify(profile));
  }

  getProfile(): ProfileInterface|null {
    return safeJsonParse<ProfileInterface>(miscStorage.getString(PROFILE_STORAGE));
  }

  removeProfile() {
    miscStorage.delete(PROFILE_STORAGE);
  }

  async getNotifications() {
    this.notifications = await this.getCurrentService().getNotifications();

    const newItems = this.notifications.reduce((acc: NotificationItemInterface[], item) => {
      acc.push(...item.items);

      return acc;
    },
    []);

    const previousItems = safeJsonParse<NotificationItemInterface[]>(
      miscStorage.getString(NOTIFICATIONS_STORAGE),
    ) ?? [];

    const badgeCount = newItems.reduce((acc, item) => {
      if (!previousItems.find((prevItem) => prevItem.link === item.link)) {
        acc += 1;
      }

      return acc;
    },
    0);

    NavigationStore.setBadgeData(ConfigStore.isTV() ? '(notifications)' : '(account)', badgeCount);
  }

  async resetNotifications() {
    if (this.notifications) {
      const newItems = this.notifications.reduce((acc: NotificationItemInterface[], item) => {
        acc.push(...item.items);

        return acc;
      },
      []);

      miscStorage.set(NOTIFICATIONS_STORAGE, JSON.stringify(newItems));
    }

    NavigationStore.setBadgeData(ConfigStore.isTV() ? '(notifications)' : '(account)', 0);
  }

  async validateUrl(value: string) {
    await requestValidator(value, this.getCurrentService().getHeaders());
  }

  async updateProvider(value: string, skipValidation = false) {
    if (!skipValidation) {
      await this.validateUrl(value);
    }

    this.getCurrentService().setProvider(value);

    // Reset cookies
    (new CookiesManager()).reset();

    if (this.isSignedIn) {
      const { name, password } = safeJsonParse<{ name: string; password: string }>(
        miscStorage.getString(CREDENTIALS_STORAGE),
      ) ?? {};

      this.logout();

      if (name && password) {
        await this.login(name, password);
      }
    }
  }

  async updateCDN(value: string, skipValidation = false) {
    if (value !== 'auto' && !skipValidation) {
      await this.validateUrl(value);
    }

    this.getCurrentService().setCDN(value);
  }

  updateUserAgent(value: string) {
    this.getCurrentService().setUserAgent(value);
  }
}

export default new ServiceStore();
