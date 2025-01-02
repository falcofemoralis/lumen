import { DimensionValue, StyleProp, ViewStyle } from 'react-native';

export interface ThumbnailComponentProps {
  style?: StyleProp<ViewStyle> | undefined;
  height?: DimensionValue;
  width?: DimensionValue;
}
