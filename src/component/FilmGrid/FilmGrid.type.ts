import { FilmCardInterface } from 'Type/FilmCard.interface';

export interface FilmGridContainerProps {
  films: FilmCardInterface[];
  header?: JSX.Element;
  headerSize?: number;
  onNextLoad?: (isRefresh: boolean) => Promise<void>;
  onItemFocus?: (row: number) => void;
}

export interface FilmGridComponentProps {
  films: FilmCardInterface[];
  header?: JSX.Element;
  headerSize?: number;
  handleOnPress: (film: FilmCardInterface) => void;
  handleItemFocus: (index: number) => void;
  onNextLoad?: (isRefresh: boolean) => Promise<void>;
}

export type FilmGridRowType = {
  id: string;
  items: FilmCardInterface[];
}

export interface FilmGridItemProps {
  index: number;
  row: FilmGridRowType,
  width: number;
  handleOnPress: (film: FilmCardInterface) => void;
  handleItemFocus?: (index: number) => void;
}
