import { FilmSectionsData } from 'Component/FilmSections/FilmSections.type';
import { FilmCardInterface } from 'Type/FilmCard.interface';

export interface NotificationsScreenComponentProps {
  isLoading: boolean;
  data: FilmSectionsData[];
  handleSelectFilm: (film: FilmCardInterface) => void;
}
