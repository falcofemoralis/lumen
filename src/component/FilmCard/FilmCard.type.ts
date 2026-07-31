import { StyleProp, ViewStyle } from 'react-native';
import { FilmCardInterface } from 'Type/FilmCard.interface';

export interface FilmCardContainerProps {
  filmCard: FilmCardInterface;
  style?: StyleProp<ViewStyle>;
  // TV related
  isFocused?: boolean;
  disableScaleAnimation?: boolean;
}

export type FilmCardComponentProps = FilmCardContainerProps;