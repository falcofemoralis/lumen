import { ViewStyle } from 'react-native';

export interface ThemedListRowProps<T = any> {
  item: T,
  index: number;
}

export interface ThemedListContainerProps<T = any> {
  data: T[];
  numberOfColumns: number;
  itemHeight?: number;
  style?: ViewStyle;
  rowStyle?: ViewStyle;
  renderItem: (args: ThemedListRowProps<T>) => JSX.Element;
  onNextLoad?: (isRefresh: boolean) => Promise<void>;
}

export interface ThemedListComponentProps<T = any> {
  data: T[];
  rows: T[][];
  numberOfColumns: number;
  isRefreshing?: boolean;
  itemHeight?: number;
  style?: ViewStyle;
  rowStyle?: ViewStyle;
  renderItem: (props: { item: T, index: number }) => JSX.Element;
  handleScrollEnd: () => void;
  handleRefresh?: () => void;
}
