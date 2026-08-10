import { ReactNode } from 'react';
import { TextStyle, ViewStyle } from 'react-native';

export interface AccordionGroupInterface<T> {
  id: string;
  title: string;
  items: T[];
}

export interface ThemedAccordionContainerProps<T> {
  data: AccordionGroupInterface<T>[];
  overlayContentStyle?: ViewStyle;
  // resting look of the group button, merged under its focused state (TV only)
  groupStyle?: TextStyle;
  renderItem: (item: T, idx: number) => ReactNode;
}

export interface ThemedAccordionComponentProps<T> extends ThemedAccordionContainerProps<T> {
  expanded: ExpandedItem;
  openAccordionGroup: (id: string) => void;
}

export interface ExpandedItem {
  [key: string]: boolean;
}
