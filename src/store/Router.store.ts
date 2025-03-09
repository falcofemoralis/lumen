import { makeAutoObservable } from 'mobx';

const transitionData: any = {};

class RouterStore {
  public isAppLoaded = false;

  constructor() {
    makeAutoObservable(this);
  }

  popData(key: string) {
    if (!transitionData[key]) {
      return null;
    }

    const data = transitionData[key];

    delete transitionData[key];

    return data;
  }

  pushData(key: string, data: any) {
    transitionData[key] = data;
  }

  setAppLoaded() {
    this.isAppLoaded = true;
  }
}

export default new RouterStore();
