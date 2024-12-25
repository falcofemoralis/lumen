import { makeAutoObservable } from 'mobx';

class NavigationStore {
  public isNavigationLocked = false;

  public isNavigationOpened = false;

  constructor() {
    makeAutoObservable(this);
  }

  lockNavigation() {
    this.isNavigationLocked = true;
  }

  unlockNavigation() {
    this.isNavigationLocked = false;
  }

  openNavigation() {
    this.isNavigationOpened = true;
  }

  closeNavigation() {
    this.isNavigationOpened = false;
  }
}

export default new NavigationStore();
