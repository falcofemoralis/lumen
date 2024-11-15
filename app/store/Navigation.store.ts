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
}

export default new NavigationStore();
