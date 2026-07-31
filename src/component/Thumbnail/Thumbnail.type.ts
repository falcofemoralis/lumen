import { StyleProp, ViewStyle } from 'react-native';

export interface ThumbnailComponentProps {
  width?: number | string;
  height?: number | string;
  style?: StyleProp<ViewStyle> | undefined;
}
