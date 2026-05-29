import { ComponentType, ReactElement, ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export interface ThemedGridRowProps<T = any> {
  item: T & { isPlaceholder?: boolean };
  index: number;
}

export interface ThemedGridContainerProps<T = any> {
  data: T[];
  numberOfColumns: number;
  itemSize?: number;
  style?: StyleProp<ViewStyle>;
  rowStyle?: StyleProp<ViewStyle>;
  scrollBehavior?: 'stick-to-start' | 'stick-to-center';
  tvOptimized?: boolean;
  ListHeaderComponent?: ComponentType<any> | ReactElement | null | undefined;
  ListEmptyComponent?: ComponentType<any> | ReactElement | null | undefined;
  renderItem: (args: ThemedGridRowProps<T>) => ReactNode;
  onNextLoad?: (isRefresh: boolean) => Promise<void>;
}

export interface ThemedGridComponentProps<T = any> {
  data: T[];
  numberOfColumns: number;
  itemSize: number;
  isRefreshing?: boolean;
  style?: StyleProp<ViewStyle>;
  rowStyle?: StyleProp<ViewStyle>;
  scrollBehavior?: 'stick-to-start' | 'stick-to-center';
  tvOptimized?: boolean;
  ListHeaderComponent?: ComponentType<any> | ReactElement | null | undefined;
  ListEmptyComponent?: ComponentType<any> | ReactElement | null | undefined;
  renderItem: (props: { item: T, index: number }) => ReactNode;
  handleScrollEnd: () => void;
  handleRefresh?: () => void;
}
