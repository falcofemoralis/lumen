import { StyleProp, ViewStyle } from 'react-native';

export interface LoaderComponentProps {
  isLoading?: boolean;
  fullScreen?: boolean;
  style?: StyleProp<ViewStyle>;
  backdrop?: boolean;
  size?: number | 'small' | 'large';
  color?: string;
}
