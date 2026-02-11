import { FilmCardInterface } from 'Type/FilmCard.interface';

export interface FilmGridContainerProps {
  films: FilmCardInterface[];
  isGridVisible?: boolean;
  isEmpty?: boolean;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
  onNextLoad?: (isRefresh: boolean) => Promise<void>;
  onItemFocus?: (row: number) => void;
}

export interface FilmGridComponentProps {
  films: FilmCardInterface[];
  numberOfColumns: number;
  isGridVisible?: boolean;
  isEmpty?: boolean;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
  handleOnPress: (film: FilmCardInterface) => void;
  handleItemFocus: (index: number) => void;
  onNextLoad?: (isRefresh: boolean) => Promise<void>;
}

export type FilmGridRowItem = FilmCardInterface & {
  isPlaceholder?: boolean;
};

export type FilmGridRowType = {
  id: string;
  items: FilmGridRowItem[];
}

export interface FilmGridItemProps {
  index: number;
  row: FilmGridRowType,
  width: number;
  handleOnPress: (film: FilmCardInterface) => void;
  handleItemFocus?: (index: number) => void;
}
