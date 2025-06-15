import { ViewStyle } from 'react-native';

export interface AccordionGroupInterface<T> {
  id: string;
  title: string;
  items: T[];
}

export interface ThemedAccordionContainerProps<T> {
  data: AccordionGroupInterface<T>[];
  overlayContent?: ViewStyle;
  renderItem: (item: T, idx: number) => React.ReactNode;
}

export interface ThemedAccordionComponentProps<T> extends ThemedAccordionContainerProps<T> {
  expanded: ExpandedItem;
  openAccordionGroup: (id: string) => void;
}

export interface ExpandedItem {
  [key: string]: boolean;
}
