import { StyleProp, ViewStyle } from 'react-native';

export type HeaderComponentProps = {
  title?: string;
  style?: StyleProp<ViewStyle>;
  additionalAction?: () => void;
  AdditionalActionIcon?: React.ComponentType<any>;
};