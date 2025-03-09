import { ApiServiceType } from 'Api/index';
import { services } from 'Api/services';
import { action, makeAutoObservable } from 'mobx';
import { NotificationInterface, NotificationItemInterface } from 'Type/Notification.interface';
import { ProfileInterface } from 'Type/Profile.interface';
import { safeJsonParse } from 'Util/Json';
import { miscStorage } from 'Util/Storage';

import ConfigStore from './Config.store';
import NavigationStore from './Navigation.store';

export const PROFILE_STORAGE = 'PROFILE_STORAGE';
export const NOTIFICATIONS_STORAGE = 'NOTIFICATIONS_STORAGE2';

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

    NavigationStore.setBadgeData(ConfigStore.isTV ? '(notifications)' : '(account)', badgeCount);
  }

  async resetNotifications() {
    if (this.notifications) {
      const newItems = this.notifications.reduce((acc: NotificationItemInterface[], item) => {
        acc.push(...item.items);

        return acc;
      },
      []);

      miscStorage.setString(NOTIFICATIONS_STORAGE, JSON.stringify(newItems));
    }

    NavigationStore.setBadgeData(ConfigStore.isTV ? '(notifications)' : '(account)', 0);
  }
}

export default new ServiceStore();
