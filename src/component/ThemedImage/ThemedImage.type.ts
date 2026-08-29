import { ImageContentFit, ImageLoadEventData, ImageProgressEventData } from 'expo-image';
import { ImageStyle, StyleProp } from 'react-native';
import { StyleValue } from 'Theme/types';

export type ThemedImageProps = {
  src: string;
  style?: StyleProp<ImageStyle> | StyleValue | undefined;
  blurRadius?: number;
  transition?: number;
  cachePolicy?: 'none' | 'disk' | 'memory' | 'memory-disk' | /** @hidden */ null;
  resizeMode?: ImageContentFit
  onLoadStart?: () => void;
  onProgress?: (event: ImageProgressEventData) => void;
  onLoad?: (event: ImageLoadEventData) => void;
  onLoadEnd?: () => void;
};
