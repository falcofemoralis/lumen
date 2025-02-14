import { ImageStyle, StyleProp, ViewStyle } from 'react-native';

export interface ThemedImageModalComponentProps {
  src: string;
  modalSrc?: string;
  style?: StyleProp<ViewStyle> | undefined;
  imageStyle?: StyleProp<ImageStyle> | undefined;
}
