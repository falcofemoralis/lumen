import { ReactNode, RefObject } from 'react';

export type ThemedListRef = {
  scrollTo: (index: number) => void;
};

export type ThemedListContainerProps<T = any> = {
  ref?: RefObject<ThemedListRef | null>;
  data: T[];
  estimatedItemSize?: number;
  keyExtractor?: (item: T, index: number) => string;
  renderItem: (item: T) => ReactNode;
  getEstimatedItemSize?: (index: number, item: T) => number;
  onNextLoad?: () => Promise<void>;
}

export type ThemedListComponentProps = ThemedListContainerProps;