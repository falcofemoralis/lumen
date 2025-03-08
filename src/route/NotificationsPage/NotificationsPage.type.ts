import { FilmCardInterface } from 'Type/FilmCard.interface';
import { NotificationInterface } from 'Type/Notification.interface';

export interface NotificationsPageComponentProps {
  notifications: NotificationInterface[];
  handleSelectFilm: (film: FilmCardInterface) => void;
}
