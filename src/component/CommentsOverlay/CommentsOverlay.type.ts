import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { StyleProp, ViewStyle } from 'react-native';
import { FilmInterface } from 'Type/Film.interface';

export type CommentsOverlayContainerProps = {
  overlayRef: React.RefObject<ThemedOverlayRef | null>;
  film: FilmInterface;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  onClose?: () => void;
}

export type CommentsOverlayComponentProps = CommentsOverlayContainerProps;