import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import FilmCardInterface from 'Type/FilmCard.interface';

export interface FilmGridPaginationInterface {
  currentPage: number;
  totalPages: number;
}

export interface FilmGridContainerProps {
  films: FilmCardInterface[];
  onNextLoad: (
    pagination: FilmGridPaginationInterface,
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
