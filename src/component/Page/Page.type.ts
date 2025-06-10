import { ReactNode } from 'react';
import { ViewStyle } from 'react-native';

export interface PageContainerProps {
  children: Exclude<NonNullable<ReactNode>, string | number | boolean>
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  disableStyles?: boolean;
  testID?: string;
}

export interface PageComponentProps {
  children: Exclude<NonNullable<ReactNode>, string | number | boolean>
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  disableStyles?: boolean;
}

export type HistoryItem = {
  key: string;
};
