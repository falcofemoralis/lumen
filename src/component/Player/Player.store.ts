import { makeAutoObservable } from 'mobx';

import { DEFAULT_PROGRESS_STATUS } from './Player.config';
import { ProgressStatus } from './Player.type';

class PlayerStore {
  public progressStatus: ProgressStatus = DEFAULT_PROGRESS_STATUS;

  constructor() {
    makeAutoObservable(this);
  }

  setProgressStatus(progressStatus: ProgressStatus) {
    this.progressStatus = progressStatus;
  }
}

export default new PlayerStore();
