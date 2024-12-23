import { ViewStyle } from 'react-native';

export interface PageContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export interface PageComponentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export type HistoryItem = {
  key: string;
};
