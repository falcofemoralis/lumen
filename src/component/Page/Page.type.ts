import { ReactNode } from 'react';
import { ViewStyle } from 'react-native';

export interface PageContainerProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export interface PageComponentProps {
  children: Exclude<NonNullable<ReactNode>, string | number | boolean>
  style?: ViewStyle;
  testID?: string;
}

export type HistoryItem = {
  key: string;
};
