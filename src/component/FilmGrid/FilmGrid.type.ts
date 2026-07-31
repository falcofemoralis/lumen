import { ComponentType, ReactElement } from 'react';
import { FilmCardInterface } from 'Type/FilmCard.interface';

export interface FilmGridContainerProps {
  films: FilmCardInterface[];
  disableEmptyComponent?: boolean;
  isEmpty?: boolean;
  hideGrid?: boolean;
  ListHeaderComponent?: ComponentType<any> | ReactElement | null | undefined;
  ListEmptyComponent?: ComponentType<any> | ReactElement | null | undefined;
  onNextLoad?: (isRefresh: boolean) => Promise<void>;
  // Mobile related
  disableStatusbarSafeArea?: boolean;
  // TV related
  disableAutofocus?: boolean;
  /** Fired when grid focus enters (true) or leaves (false) the first row. */
  onAtTopChange?: (atTop: boolean) => void;
}

export interface FilmGridComponentProps extends Omit<FilmGridContainerProps, 'onNextLoad'> {
  numberOfColumns: number;
  isRefreshing: boolean;
  handleOnPress: (film: FilmCardInterface) => void;
  handleScrollEnd?: () => void;
  handleRefresh?: () => void;
}

export type FilmGridRowItem = FilmCardInterface & {
  isPlaceholder?: boolean;
};

export interface FilmGridItemProps {
  index: number;
  item: FilmGridRowItem,
  // TV related
  isLastRow?: boolean;
  handleOnPress: (film: FilmCardInterface) => void;
}
