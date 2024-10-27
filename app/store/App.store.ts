import { makeAutoObservable } from 'mobx';

class AppStore {
  isTV = true;
  isInitiallyFocused = false;

  constructor() {
    makeAutoObservable(this);
  }

  setTV() {
    this.isTV = true;
  }

  setInitiallyFocused() {
    this.isInitiallyFocused = true;
  }
}

export default new AppStore();
