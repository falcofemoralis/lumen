export interface AccordionGroup<T> {
  id: string;
  title: string;
  items: T[];
}

export interface ThemedAccordionContainerProps<T> {
  data: AccordionGroup<T>[];
  renderItem: (item: T, idx: number) => JSX.Element;
}

export interface ThemedAccordionComponentProps<T> extends ThemedAccordionContainerProps<T> {
  expanded: ExpandedItem;
  openAccordionGroup: (id: string) => void;
}

export interface ExpandedItem {
  [key: string]: boolean;
}
