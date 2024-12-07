import FilmCardInterface from './FilmCard.interface';

export interface FilmListInterface {
  films: FilmCardInterface[];
  totalPages: number;
}
