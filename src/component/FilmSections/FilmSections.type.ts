import { FilmCardInterface } from 'Type/FilmCard.interface';

export type FilmSectionsData = {
  header: string;
  films: FilmCardInterface[];
}

export interface FilmSectionsContainerProps {
  data: FilmSectionsData[];
  children?: JSX.Element;
  contentHeight?: number;
  handleOnPress: (film: FilmCardInterface) => void;
}

export interface FilmSectionsComponentProps {
  data: FilmSectionsItem[];
  contentHeight?: number;
  handleOnPress: (film: FilmCardInterface) => void;
}

export type FilmSectionsItem = {
  index: number;
  films?: FilmCardInterface[];
  header?: string;
  content?: JSX.Element;
}

export interface FilmSectionsRowProps {
  row: FilmSectionsItem;
  itemSize?: number;
  numberOfColumns: number;
  handleOnPress: (film: FilmCardInterface) => void;
  containerWidth?: number;
}
