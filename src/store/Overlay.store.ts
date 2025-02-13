import { makeAutoObservable } from 'mobx';

class OverlayStore {
  public currentOverlay: string[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  hasOpenedOverlay() {
    return this.currentOverlay.length > 0;
  }

  isOverlayOpened(id: string) {
    if (!this.currentOverlay.length) {
      return false;
    }

    return this.currentOverlay.includes(id);
  }

  isOverlayVisible(id: string) {
    if (!this.currentOverlay.length) {
      return false;
    }

    return this.currentOverlay[this.currentOverlay.length - 1] === id;
  }

  openOverlay(id: string) {
    this.closeOverlay(id);

    this.currentOverlay.push(id);
  }

  closeOverlay(id: string) {
    this.currentOverlay = this.currentOverlay.filter(
      (overlayId) => overlayId !== id,
    );
  }

  goToPreviousOverlay() {
    this.currentOverlay.pop();
  }
}

export default new OverlayStore();
