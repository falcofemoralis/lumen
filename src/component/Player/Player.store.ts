import { makeAutoObservable } from 'mobx';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { convertSecondsToTime } from 'Util/Date';

import { DEFAULT_PROGRESS_STATUS, FocusedElement } from './Player.config';
import { ProgressStatus } from './Player.type';

class PlayerStore {
  public progressStatus: ProgressStatus = DEFAULT_PROGRESS_STATUS;

  public focusedElement: FocusedElement = FocusedElement.PROGRESS_THUMB;

  public selectedVoice: {
    filmId: string;
    voice: FilmVoiceInterface;
  } | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setProgressStatus(
    currentTime: number,
    bufferedPosition: number,
    duration: number,
  ) {
    this.progressStatus = {
      progressPercentage: (currentTime / duration) * 100,
      playablePercentage: (bufferedPosition / duration) * 100,
      currentTime: convertSecondsToTime(currentTime),
      durationTime: convertSecondsToTime(duration),
      remainingTime: convertSecondsToTime(duration - currentTime),
    };
  }

  resetProgressStatus() {
    this.progressStatus = DEFAULT_PROGRESS_STATUS;
  }

  setFocusedElement(focusedElement: FocusedElement) {
    this.focusedElement = focusedElement;
  }

  setSelectedVoice(filmId: string, voice: FilmVoiceInterface) {
    this.selectedVoice = {
      filmId,
      voice,
    };
  }
}

export default new PlayerStore();
