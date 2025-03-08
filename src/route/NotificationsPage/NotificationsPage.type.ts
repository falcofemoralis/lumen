import { FilmListData } from 'Component/FilmList/FilmList.type';
import { FilmCardInterface } from 'Type/FilmCard.interface';

export interface NotificationsPageComponentProps {
  isLoading: boolean;
  data: FilmListData[];
  handleSelectFilm: (film: FilmCardInterface) => void;
}
