import { makeAutoObservable } from 'mobx';

class RouterStore {
  private transitionData: any = {};

  constructor() {
    makeAutoObservable(this);
  }

  popData(key: string) {
    if (!this.transitionData[key]) {
      return null;
    }

    const data = this.transitionData[key];

    delete this.transitionData[key];

    return data;
  }

  pushData(key: string, data: any) {
    this.transitionData[key] = data;
  }
}

export default new RouterStore();
