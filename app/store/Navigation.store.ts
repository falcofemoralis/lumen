import { makeAutoObservable } from 'mobx';

class NavigationStore {
  public isNavigationVisible = true;
  public isNavigationOpened = false;

  constructor() {
    makeAutoObservable(this);
  }

  toggleNavigation() {
    this.isNavigationVisible = !this.isNavigationVisible;
  }

  openNavigation() {
    this.isNavigationOpened = true;
  }

  closeNavigation() {
    this.isNavigationOpened = false;
  }
}

export default new NavigationStore();
