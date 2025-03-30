import type { ColorValue, ImageProps } from 'react-native';

export interface SliderIntroItemProps {
  index: number;
  title?: object | string;
  text?: object | string;
  link?: string;
  image?: ImageProps['source'];
  backgroundColor?: ColorValue;
  activeLanguage?: string;
  slideMaxHeightPercent?: number;
  icon?: any;
}
