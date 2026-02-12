import { LinearGradient } from 'expo-linear-gradient';
import { useLayout } from 'Hooks/useLayout';
import { DimensionValue } from 'react-native';
import GradientShimmer from 'react-native-gradient-shimmer';
import { useAppTheme } from 'Theme/context';

import { ThumbnailComponentProps } from './Thumbnail.type';

const convertPercentageToNumber = (
  type: 'width' | 'height',
  value: DimensionValue,
  layoutWidth: number,
  layoutHeight: number
) => {
  if (typeof value === 'string' && value.endsWith('%')) {
    return (parseFloat(value) / 100) * (type === 'width' ? layoutWidth : layoutHeight);
  }

  if (typeof value === 'string' && value === 'auto') {
    return 10;
  }

  return typeof value === 'number' ? value : parseFloat(value as string);
};

const transformValue = (
  type: 'width' | 'height',
  value: DimensionValue | undefined,
  style: any,
  layoutWidth: number,
  layoutHeight: number
) => {
  if (style && style[type] !== undefined) {
    return convertPercentageToNumber(type, style[type], layoutWidth, layoutHeight);
  }

  if (value) {
    return convertPercentageToNumber(type, value, layoutWidth, layoutHeight);
  }

  return 10;
};

export const ThumbnailComponent = ({ style, height, width }: ThumbnailComponentProps) => {
  const { theme, scale } = useAppTheme();
  const { width: layoutWidth } = useLayout();

  return (
    <GradientShimmer
      LinearGradientComponent={ LinearGradient }
      backgroundColor={ theme.colors.thumbnail }
      highlightColor={ theme.colors.thumbnailHighlight }
      height={ transformValue('height', height, style, layoutWidth, theme.dimensions.height) }
      width={ transformValue('width', width, style, layoutWidth, theme.dimensions.height) }
      style={ [
        {
          borderRadius: scale(12),
        },
        style ? style : {},
      ] }
    />
  );
};

export default ThumbnailComponent;
