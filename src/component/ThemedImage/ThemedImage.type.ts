import { ImageStyle, StyleProp } from 'react-native';
import { StyleValue } from 'Theme/types';

export type ThemedImageProps = {
  src: string;
  style?: StyleProp<ImageStyle> | StyleValue | undefined;
  blurRadius?: number;
  transition?: number;
  cachePolicy?: 'none' | 'disk' | 'memory' | 'memory-disk' | /** @hidden */ null;
};
