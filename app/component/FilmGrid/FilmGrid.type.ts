import FilmCardInterface from 'Type/FilmCard.interface';

export interface FilmGridContainerProps {
  films: FilmCardInterface[];
  onNextLoad: (
    pagination: FilmGridPaginationInterface,
    isUpdate?: boolean,
    isRefresh?: boolean
  ) => Promise<FilmGridPaginationInterface>;
}

export interface FilmGridComponentProps {
  films: FilmCardInterface[];
  rows: FilmCardInterface[][];
  isRefreshing?: boolean;
  handleOnPress: (film: FilmCardInterface) => void;
  onScrollEnd: () => void;
  onRefresh?: () => void;
}

export interface FilmGridPaginationInterface {
  currentPage: number;
  totalPages: number;
}

export type FilmGridItem = FilmCardInterface & {
  isThumbnail?: boolean;
};
