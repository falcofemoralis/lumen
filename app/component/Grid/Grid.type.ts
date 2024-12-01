import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import FilmCard from 'Type/FilmCard.interface';

export interface GridContainerProps {
  films: FilmCard[];
  onScrollEnd?: () => void;
}

export interface GridComponentProps {
  rows: FilmCard[][];
  handleOnPress: (film: FilmCard) => void;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}
