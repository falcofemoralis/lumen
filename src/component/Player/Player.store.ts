import { makeAutoObservable } from 'mobx';

import { DEFAULT_PROGRESS_STATUS, FocusedElement } from './Player.config';
import { ProgressStatus } from './Player.type';

class PlayerStore {
  public progressStatus: ProgressStatus = DEFAULT_PROGRESS_STATUS;

  public focusedElement: FocusedElement = FocusedElement.ProgressThumb;

  constructor() {
    makeAutoObservable(this);
  }

  setProgressStatus(progressStatus: ProgressStatus) {
    this.progressStatus = progressStatus;
  }

  setFocusedElement(focusedElement: FocusedElement) {
    this.focusedElement = focusedElement;
  }
}

export default new PlayerStore();
