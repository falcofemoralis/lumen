import { StyleProp, ViewStyle } from 'react-native';
import { FilmCardInterface } from 'Type/FilmCard.interface';

export interface FilmCardContainerProps {
  filmCard: FilmCardInterface;
  style?: StyleProp<ViewStyle>;
  // TV related
  isFocused?: boolean;
  /** Drop the focus zoom entirely -- the card never grows. */
  disableScaleAnimation?: boolean;
  /**
   * Keep the focus zoom but snap to it instead of gliding. Lets a caller pay for
   * the transition only where it is affordable -- see the grid, which glides
   * along a row but snaps between rows while a new row is being drawn.
   */
  disableScaleTransition?: boolean;
}

export type FilmCardComponentProps = FilmCardContainerProps;