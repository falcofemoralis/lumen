import React from 'react';
import { ViewStyle } from 'react-native';

export interface ThemedGridRowProps<T = any> {
  item: T,
  index: number;
}

export interface ThemedGridContainerProps<T = any> {
  data: T[];
  numberOfColumns: number;
  itemSize: number;
  style?: ViewStyle;
  rowStyle?: ViewStyle;
  header?: React.ReactNode;
  headerSize?: number;
  ListEmptyComponent?: React.ComponentType<any>
  | React.ReactElement<any, string
  | React.JSXElementConstructor<any>>;
  renderItem: (args: ThemedGridRowProps<T>) => React.ReactNode;
  onNextLoad?: (isRefresh: boolean) => Promise<void>;
}

export interface ThemedGridComponentProps<T = any> {
  data: T[];
  numberOfColumns: number;
  itemSize: number;
  isRefreshing?: boolean;
  style?: ViewStyle;
  rowStyle?: ViewStyle;
  header?: React.ReactNode;
  headerSize?: number;
  ListEmptyComponent?: any;
  renderItem: (props: { item: T, index: number }) => React.ReactNode;
  handleScrollEnd: () => void;
  handleRefresh?: () => void;
}
