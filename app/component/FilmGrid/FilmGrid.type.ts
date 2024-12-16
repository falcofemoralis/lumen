import FilmCardInterface from 'Type/FilmCard.interface';
import { PaginationInterface } from 'Type/Pagination.interface';

export interface FilmGridContainerProps {
  films: FilmCardInterface[];
  pagination: PaginationInterface;
  onNextLoad: (
    pagination: PaginationInterface,
    isUpdate?: boolean, // flag to rewrite current data
    isRefresh?: boolean // flag to load new data from server
  ) => Promise<void>;
}

export interface FilmGridComponentProps {
  films: FilmCardInterface[];
  rows: FilmGridItem[][];
  isRefreshing?: boolean;
  handleOnPress: (film: FilmCardInterface) => void;
  onScrollEnd: () => void;
  onRefresh?: () => void;
}

export interface FilmGridRowProps {
  item: FilmGridItem[];
  handleOnPress: (film: FilmCardInterface) => void;
}

export type FilmGridItem = FilmCardInterface & {
  isThumbnail?: boolean;
};
