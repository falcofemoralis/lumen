import { FilmCardInterface } from './FilmCard.interface';

export interface NotificationInterface {
  date: string;
  items: NotificationItemInterface[];
}

export interface NotificationItemInterface {
  name: string;
  link: string;
  film?: FilmCardInterface;
  info?: string;
}
