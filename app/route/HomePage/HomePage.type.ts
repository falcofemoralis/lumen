import { FilmGridPaginationInterface } from 'Component/FilmGrid/FilmGrid.type';
import FilmCardInterface from 'Type/FilmCard.interface';

export interface HomePageProps {
  films: FilmCardInterface[];
  loadFilms: (
    pagination: FilmGridPaginationInterface,
    isRefresh?: boolean
  ) => Promise<FilmGridPaginationInterface>;
}
