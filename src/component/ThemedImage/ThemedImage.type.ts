import { ImageStyle, StyleProp } from 'react-native';

export type ThemedImageProps = {
  src: string;
  style?: StyleProp<ImageStyle> | undefined;
};
