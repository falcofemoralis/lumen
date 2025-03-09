import { FilmCardInterface } from 'Type/FilmCard.interface';

export type FilmListData = {
  header: string;
  films: FilmCardInterface[];
}

export interface FilmListContainerProps {
  data: FilmListData[];
  numberOfColumns?: number;
  children?: JSX.Element;
  contentHeight?: number;
  handleOnPress: (film: FilmCardInterface) => void;
}

export interface FilmListComponentProps {
  data: FilmListData[];
  numberOfColumns: number;
  children?: JSX.Element;
  contentHeight?: number;
  handleOnPress: (film: FilmCardInterface) => void;
  calculateRows: <T>(list: T[]) => T[][];
}

export type FilmListItem = {
  index: number;
  films?: FilmCardInterface[];
  header?: string;
  content?: JSX.Element;
}

export interface FilmListRowProps {
  row: FilmListItem;
  itemSize?: number;
  numberOfColumns: number;
  handleOnPress: (film: FilmCardInterface) => void;
}
