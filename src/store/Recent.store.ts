import { makeAutoObservable } from 'mobx';
import { RecentItemInterface } from 'Type/RecentItem.interface';

import NotificationStore from './Notification.store';
import ServiceStore from './Service.store';

class RecentStore {
  public isPreloaded = false;

  public items: RecentItemInterface[] = [];

  public currentPage = 1;

  public totalPages = 1;

  constructor() {
    makeAutoObservable(this);
  }

  async preloadData() {
    try {
      const { items, totalPages } = await ServiceStore.getCurrentService().getRecent(1);

      this.items = items;
      this.setTotalPages(totalPages);
      this.isPreloaded = true;
    } catch (error) {
      NotificationStore.displayError(error as Error);
    }
  }

  setItems(items: RecentItemInterface[]) {
    this.items = items;
  }

  setCurrentPage(page: number) {
    this.currentPage = page;
  }

  setTotalPages(totalPages: number) {
    this.totalPages = totalPages;
  }
}

export default new RecentStore();
