import { FilmCardInterface } from 'Type/FilmCard.interface';

export interface FilmGridContainerProps {
  films: FilmCardInterface[];
  onNextLoad: (isRefresh: boolean) => Promise<void>;
  onItemFocus?: (row: number) => void;
}

export interface FilmGridComponentProps {
  films: FilmCardInterface[];
  rows: FilmGridItem[][];
  isRefreshing?: boolean;
  handleOnPress: (film: FilmCardInterface) => void;
  onScrollEnd: () => void;
  onRefresh?: () => void;
  handleItemFocus: (index: number) => void;
}

export type FilmGridItem = FilmCardInterface & {
  isThumbnail?: boolean;
};

export interface FilmGridRowProps {
  item: FilmGridItem[];
  handleOnPress: (film: FilmCardInterface) => void;
}
