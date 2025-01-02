import { StyleProp, ViewStyle } from 'react-native';

export interface ThemedCardContainerProps {
  style?: StyleProp<ViewStyle> | undefined;
  children?: React.ReactNode | undefined;
}

export interface ThemedCardComponentProps {
  style?: StyleProp<ViewStyle> | undefined;
  children?: React.ReactNode | undefined;
}
