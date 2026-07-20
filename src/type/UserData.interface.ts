import { NotificationInterface } from './Notification.interface';

export interface UserDataInterface {
  notifications: NotificationInterface[];
  // all series-update rows of the day (tracked and untracked); optional because
  // caches written by older builds lack it
  updates?: NotificationInterface[];
  premiumDays?: number;
}
