import { ImageStyle, StyleProp } from 'react-native';

export interface ThemedImageProps {
  src: string;
  style?: StyleProp<ImageStyle> | undefined;
}
