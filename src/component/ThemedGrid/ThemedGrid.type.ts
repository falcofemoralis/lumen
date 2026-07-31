/* eslint-disable max-len */
import { ComponentType, ReactElement, ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export interface ThemedGridRowProps<T = any> {
  item: T & { isPlaceholder?: boolean };
  index: number;
}

export interface ThemedGridContainerProps<T = any> {
  data: T[];
  numberOfColumns: number;
  style?: StyleProp<ViewStyle>;
  rowStyle?: StyleProp<ViewStyle>;
  ListHeaderComponent?: ComponentType<any> | ReactElement | null | undefined;
  ListEmptyComponent?: ComponentType<any> | ReactElement | null | undefined;
  renderItem: (args: ThemedGridRowProps<T>) => ReactNode;
  onNextLoad?: (isRefresh: boolean) => Promise<void>;
  // TV related
  scrollBehavior?: 'stick-to-start' | 'stick-to-center';
  autofocus?: boolean;
}

export interface ThemedGridComponentProps<T = any> extends Omit<ThemedGridContainerProps<T>, 'renderItem | onNextLoad'> {
  renderItem: (props: { item: T, index: number }) => ReactNode;
  handleScrollEnd: () => void;
  // Mobile related
  isRefreshing?: boolean;
  handleRefresh?: () => void;
}
