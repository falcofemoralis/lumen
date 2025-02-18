import { StyleProp, ViewStyle } from 'react-native';
import { FilmCardInterface } from 'Type/FilmCard.interface';

export interface FilmCardContainerProps {
  filmCard: FilmCardInterface;
  isFocused?: boolean;
  style?: StyleProp<ViewStyle>;
  stylePoster?: StyleProp<ViewStyle>;
  isThumbnail?: boolean;
}

export interface FilmCardComponentProps {
  filmCard: FilmCardInterface;
  isFocused?: boolean;
  style?: StyleProp<ViewStyle>;
  stylePoster?: StyleProp<ViewStyle>;
  isThumbnail?: boolean;
}
