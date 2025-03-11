import { FilmCardInterface } from 'Type/FilmCard.interface';

export type FilmListData = {
  header: string;
  films: FilmCardInterface[];
}

export interface FilmListContainerProps {
  data: FilmListData[];
  children?: JSX.Element;
  contentHeight?: number;
  handleOnPress: (film: FilmCardInterface) => void;
}

export interface FilmListComponentProps {
  data: FilmListItem[];
  contentHeight?: number;
  handleOnPress: (film: FilmCardInterface) => void;
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
