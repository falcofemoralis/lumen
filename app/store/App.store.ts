import { makeAutoObservable } from 'mobx';

class AppStore {
  isTV = false;
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
