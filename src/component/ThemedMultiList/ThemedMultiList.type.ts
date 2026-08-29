import { ReactElement } from 'react';

export interface ThemedMultiListContainerProps {
  data: ListItem[],
  header?: string;
  noItemsTitle?: string;
  noItemsSubtitle?: string;
  /** Passed straight to the list -- see `ThemedSimpleListContainerProps`. */
  searchComponent?: ReactElement | null;
  onChange: (value: string, isChecked: boolean) => void;
}

export interface ThemedMultiListComponentProps {
  values: ListItem[],
  header?: string;
  noItemsTitle?: string;
  noItemsSubtitle?: string;
  searchComponent?: ReactElement | null;
  handleOnChange: (value: string, isChecked: boolean) => void;
}

export interface ListItem {
  label: string;
  value: string;
  isChecked: boolean;
}
