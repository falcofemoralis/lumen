import { makeAutoObservable } from 'mobx';

class AppStore {
  isTV = true;

  constructor() {
    makeAutoObservable(this);
  }

  setTV() {
    this.isTV = true;
  }
}

export default new AppStore();
