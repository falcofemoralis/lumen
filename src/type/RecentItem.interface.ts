import { FilmCardInterface } from './FilmCard.interface';

export interface RecentItemInterface {
  filmCard?: FilmCardInterface;
  id: string;
  link: string;
  image: string;
  date: string;
  name: string;
  info?: string;
  additionalInfo?: string;
  isWatched: boolean;
}
