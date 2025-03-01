import { makeAutoObservable } from 'mobx';

const transitionData: any = {};

class RouterStore {
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
}

export default new RouterStore();
