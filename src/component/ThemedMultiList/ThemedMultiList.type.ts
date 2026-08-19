import { ReactElement } from 'react';

export interface ThemedMultiListContainerProps {
  data: ListItem[],
  header?: string;
  noItemsTitle?: string;
  noItemsSubtitle?: string;
  /**
   * Stops the trailing `(n)` in a label from being counted up and down as the
   * item is checked. For lists whose labels carry no such tally -- without it a
   * plain label grows a `(1)` of its own the first time it is ticked.
   *
   * It also hands the items back to the caller: with the counter on the list
   * keeps a copy of them to write those tallies into, and with it off it renders
   * `data` as given -- which is what lets a caller filter what is on screen.
   */
  disableCounter?: boolean;
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
