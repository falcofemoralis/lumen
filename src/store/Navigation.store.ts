import { BadgeData, NavigationRoute } from 'Component/NavigationBar/NavigationBar.type';
import { makeAutoObservable } from 'mobx';

class NavigationStore {
  public isNavigationLocked = false;

  public badgeData: BadgeData = {};

  constructor() {
    makeAutoObservable(this);
  }

  lockNavigation() {
    this.isNavigationLocked = true;
  }

  unlockNavigation() {
    this.isNavigationLocked = false;
  }

  setBadgeData(key: NavigationRoute, count: number) {
    const data = {
      ...this.badgeData,
      [key]: count,
    };

    this.badgeData = data;
  }
}

export default new NavigationStore();
