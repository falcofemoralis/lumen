import { FilmCardInterface } from 'Type/FilmCard.interface';

export interface FilmGridContainerProps {
  films: FilmCardInterface[];
  onNextLoad?: (isRefresh: boolean) => Promise<void>;
  onItemFocus?: (row: number) => void;
}

export interface FilmGridComponentProps {
  films: FilmCardInterface[];
  handleOnPress: (film: FilmCardInterface) => void;
  handleItemFocus: (index: number) => void;
  onNextLoad?: (isRefresh: boolean) => Promise<void>;
}

export type FilmGridItemType = FilmCardInterface & {
  isThumbnail?: boolean;
};

export interface FilmGridRowProps {
  item: FilmGridItemType[];
  handleOnPress: (film: FilmCardInterface) => void;
}

export interface FilmGridItemProps {
  item: FilmGridItemType,
  index: number;
  isThumbnail?: boolean;
  handleOnPress: (film: FilmCardInterface) => void;
  handleItemFocus: (index: number) => void;
}
