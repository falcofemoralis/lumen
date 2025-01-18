import { makeAutoObservable } from 'mobx';

class NavigationStore {
  public isNavigationLocked = false;

  constructor() {
    makeAutoObservable(this);
  }

  lockNavigation() {
    this.isNavigationLocked = true;
  }

  unlockNavigation() {
    this.isNavigationLocked = false;
  }
}

export default new NavigationStore();
