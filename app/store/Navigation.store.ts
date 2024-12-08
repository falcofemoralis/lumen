import { makeAutoObservable } from 'mobx';

class NavigationStore {
  public isNavigationVisible = true;
  public isNavigationOpened = false;

  constructor() {
    makeAutoObservable(this);
  }

  showNavigation() {
    this.isNavigationVisible = true;
  }

  hideNavigation() {
    this.isNavigationVisible = false;
  }

  openNavigation() {
    this.isNavigationOpened = true;
  }

  closeNavigation() {
    this.isNavigationOpened = false;
  }
}

export default new NavigationStore();
