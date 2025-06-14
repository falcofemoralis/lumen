import { ReactNode } from 'react';
import { ViewStyle } from 'react-native';

export interface PageContainerProps {
  children: Exclude<NonNullable<ReactNode>, string | number | boolean>
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  disableWrapper?: boolean;
  testID?: string;
}

export interface PageComponentProps {
  children: Exclude<NonNullable<ReactNode>, string | number | boolean>
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  disableWrapper?: boolean;
}

export type HistoryItem = {
  key: string;
};
