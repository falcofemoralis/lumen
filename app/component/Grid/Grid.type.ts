import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import FilmCardInterface from 'Type/FilmCard.interface';

export interface GridContainerProps {
  films: FilmCardInterface[];
  onScrollEnd?: () => void;
}

export interface GridComponentProps {
  films: FilmCardInterface[];
  rows: FilmCardInterface[][];
  handleOnPress: (film: FilmCardInterface) => void;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}
