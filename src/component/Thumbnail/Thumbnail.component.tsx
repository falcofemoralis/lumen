import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { DimensionValue } from 'react-native';
import GradientShimmer from 'react-native-gradient-shimmer';
import { Colors } from 'Style/Colors';
import { calculateLayoutWidth } from 'Style/Layout';

import { styles } from './Thumbnail.style';
import { ThumbnailComponentProps } from './Thumbnail.type';

const convertPercentageToNumber = (value: DimensionValue) => {
  if (typeof value === 'string' && value.endsWith('%')) {
    return (parseFloat(value) / 100) * calculateLayoutWidth();
  }

  if (typeof value === 'string' && value === 'auto') {
    return 10;
  }

  return typeof value === 'number' ? value : parseFloat(value as string);
};

const transformValue = (type: 'width' | 'height', value: DimensionValue | undefined, style: any) => {
  if (style && style[type] !== undefined) {
    return convertPercentageToNumber(style[type]);
  }

  if (value) {
    return convertPercentageToNumber(value);
  }

  return 10;
};

export const ThumbnailComponent = ({ style, height, width }: ThumbnailComponentProps) => {
  return (
    <GradientShimmer
      LinearGradientComponent={ LinearGradient }
      backgroundColor={ Colors.thumbnail }
      highlightColor={ Colors.thumbnailHighlight }
      height={ transformValue('height', height, style) }
      width={ transformValue('width', width, style) }
      style={ [styles.thumbnail, style] }
    />
  );
};

export default ThumbnailComponent;
