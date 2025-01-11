import { ViewStyle } from 'react-native';

export interface PageContainerProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export interface PageComponentProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export type HistoryItem = {
  key: string;
};
