import { ThemedStyles } from 'Theme/types';
import { FilmCardInterface } from 'Type/FilmCard.interface';

export type FilmSectionsData = {
  header: string;
  films: FilmCardInterface[];
  isPlaceholder?: boolean;
}

export interface FilmSectionsContainerProps {
  data: FilmSectionsData[];
  children?: React.ReactNode;
  handleOnPress: (film: FilmCardInterface) => void;
}

export interface FilmSectionsComponentProps {
  data: FilmSectionsItem[];
  children?: React.ReactNode;
  handleOnPress: (film: FilmCardInterface) => void;
}

export type FilmSectionsItem = {
  index: number;
  films?: FilmCardInterface[];
  header?: string;
  isPlaceholder?: boolean;
}

export interface FilmSectionsRowProps {
  index: number;
  row: FilmSectionsItem;
  itemSize?: number;
  numberOfColumns: number;
  handleOnPress: (film: FilmCardInterface) => void;
  containerWidth?: number;
  styles: ThemedStyles;
}
