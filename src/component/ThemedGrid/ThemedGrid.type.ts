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
  header?: JSX.Element;
  headerSize?: number;
  renderItem: (args: ThemedGridRowProps<T>) => JSX.Element;
  onNextLoad?: (isRefresh: boolean) => Promise<void>;
}

export interface ThemedGridComponentProps<T = any> {
  data: T[];
  numberOfColumns: number;
  itemSize: number;
  isRefreshing?: boolean;
  style?: ViewStyle;
  rowStyle?: ViewStyle;
  header?: JSX.Element;
  headerSize?: number;
  renderItem: (props: { item: T, index: number }) => JSX.Element;
  handleScrollEnd: () => void;
  handleRefresh?: () => void;
}
