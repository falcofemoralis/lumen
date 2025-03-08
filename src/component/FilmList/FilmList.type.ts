import { FilmCardInterface } from 'Type/FilmCard.interface';

export type FilmListData = {
  header: string;
  films: FilmCardInterface[];
}

export interface FilmListContainerProps {
  data: FilmListData[];
  offsetFromStart?: number;
  numberOfColumns?: number;
  handleOnPress: (film: FilmCardInterface) => void;
  children?: JSX.Element;
}

export interface FilmListComponentProps {
  data: FilmListData[];
  offsetFromStart?: number;
  numberOfColumns: number;
  handleOnPress: (film: FilmCardInterface) => void;
  calculateRows: <T>(list: T[]) => T[][];
  children?: JSX.Element;
}

export enum FilmListItemType {
  FILM = 'FILM',
  HEADER = 'HEADER',
  CONTENT = 'CONTENT',
}

export type FilmListItem = {
  index: number;
  films?: FilmCardInterface[];
  header?: string;
  type: FilmListItemType;
}

export interface FilmListRowProps {
  row: FilmListItem;
  itemSize: number;
  children?: JSX.Element;
  handleOnPress: (film: FilmCardInterface) => void;
}
