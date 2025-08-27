export type ThemedListRef = {
  scrollTo: (index: number) => void;
};

export type ThemedListContainerProps<T = any> = {
  ref?: React.RefObject<ThemedListRef | null>;
  data: T[];
  estimatedItemSize?: number;
  renderItem: (item: T) => React.ReactNode;
  getEstimatedItemSize?: (index: number, item: T) => number;
  onNextLoad?: () => Promise<void>;
}

export type ThemedListComponentProps = ThemedListContainerProps;