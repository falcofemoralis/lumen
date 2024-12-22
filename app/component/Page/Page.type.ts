import { ViewStyle } from 'react-native';

export interface PageProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export type HistoryItem = {
  key: string;
};
