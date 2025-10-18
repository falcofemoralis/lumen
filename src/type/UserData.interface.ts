import { NotificationInterface } from './Notification.interface';

export interface UserDataInterface {
  notifications: NotificationInterface[];
  premiumDays?: number;
}
