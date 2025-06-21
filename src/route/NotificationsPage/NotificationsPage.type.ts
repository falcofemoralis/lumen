import { FilmSectionsData } from 'Component/FilmSections/FilmSections.type';
import { FilmCardInterface } from 'Type/FilmCard.interface';

export interface NotificationsPageComponentProps {
  isLoading: boolean;
  data: FilmSectionsData[];
  handleSelectFilm: (film: FilmCardInterface) => void;
}
