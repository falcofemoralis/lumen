import { FilmCardInterface } from 'Type/FilmCard.interface';

export interface FilmGridContainerProps {
  films: FilmCardInterface[];
  onNextLoad: (isRefresh: boolean) => Promise<void>;
  onItemFocus?: (row: number) => void;
}

export interface FilmGridComponentProps {
  films: FilmCardInterface[];
  handleOnPress: (film: FilmCardInterface) => void;
  handleItemFocus: (index: number) => void;
  onNextLoad: (isRefresh: boolean) => Promise<void>;
}

export type FilmGridItem = FilmCardInterface & {
  isThumbnail?: boolean;
};

export interface FilmGridRowProps {
  item: FilmGridItem[];
  handleOnPress: (film: FilmCardInterface) => void;
}
