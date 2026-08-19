import { ReactElement } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export interface ListItem {
  label: string;
  value: string;
  startIcon?: string;
  endIcon?: string;
}

export type ThemedSimpleListContainerProps = {
  data: ListItem[];
  value?: string,
  header?: string;
  style?: StyleProp<ViewStyle>;
  onChange: (item: ListItem) => void;
  rightAdditionalElement?: (item: ListItem, isFocused: boolean, isSelected: boolean) => ReactElement | null;
  emptyComponent?: ReactElement | null;
  /**
   * Drawn between the header and the rows, in a slot of a fixed height the row
   * viewport is sized against -- which is why it belongs here rather than above
   * the list in the caller. Meant for a search field over `data`; the filtering
   * itself stays with whoever owns the data.
   */
  searchComponent?: ReactElement | null;
}

export type ThemedSimpleListComponentProps = ThemedSimpleListContainerProps;
